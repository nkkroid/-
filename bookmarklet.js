(function () {
  'use strict';
  var APP = 'https://nkkroid.github.io/-/';

  function cellText(cells, i) {
    return i < cells.length ? cells[i].textContent.replace(/\s+/g, ' ').trim() : '';
  }

  function parseDate(s) {
    var m = s.match(/(\d{4})[\/年](\d{1,2})[\/月](\d{1,2})/);
    if (!m) return '';
    return m[1] + '-' + ('0' + m[2]).slice(-2) + '-' + ('0' + m[3]).slice(-2);
  }

  function parseGrade(name) {
    if (name.indexOf('新馬') !== -1) return '新馬';
    if (name.indexOf('未勝利') !== -1) return '未勝利';
    var gm = name.match(/[（(]([GＧ][123１２３])[）)]/);
    if (gm) {
      return gm[1].replace('Ｇ', 'G').replace('１', '1').replace('２', '2').replace('３', '3');
    }
    if (/3勝|3[Cc]/.test(name)) return '3勝';
    if (/2勝|2[Cc]/.test(name)) return '2勝';
    if (/1勝|1[Cc]/.test(name)) return '1勝';
    return 'OP';
  }

  function parseVenue(s) {
    var list = ['東京', '中山', '阪神', '京都', '中京', '小倉', '新潟', '福島', '札幌', '函館'];
    for (var i = 0; i < list.length; i++) {
      if (s.indexOf(list[i]) !== -1) return list[i];
    }
    return s.replace(/\d/g, '').trim().slice(0, 4) || s.slice(0, 4);
  }

  function parseCourse(s) {
    var surface = s.charAt(0) === '芝' ? '芝' : 'ダート';
    var dm = s.match(/\d+/);
    return { surface: surface, distance: dm ? dm[0] + 'm' : '' };
  }

  function buildHeaderMap(table) {
    var map = {};
    var ths = table.querySelectorAll('thead th, thead td');
    if (!ths.length) {
      ths = table.querySelectorAll('tr:first-child th, tr:first-child td');
    }
    [].forEach.call(ths, function (th, i) {
      map[th.textContent.trim()] = i;
    });
    return map;
  }

  function scrapeTable(table) {
    var H = buildHeaderMap(table);
    function get(key, def) { return H[key] !== undefined ? H[key] : def; }

    // Netkeiba DB column defaults (26-column table)
    var COL = {
      date:     get('日付', 0),
      venue:    get('開催', 1),
      raceName: get('レース名', 4),
      runners:  get('頭数', 6),
      pos:      get('着順', 11),
      jockey:   get('騎手', 12),
      weight:   get('斤量', 13),
      course:   get('コース', 14),
      time:     get('タイム', 17),
      margin:   get('着差', 18),
      prize:    get('賞金(万円)', 25),
    };

    var results = [];
    [].forEach.call(table.querySelectorAll('tbody tr'), function (row) {
      var cells = row.querySelectorAll('td');
      if (cells.length < 5) return;

      var date = parseDate(cellText(cells, COL.date));
      if (!date) return;

      var raceName = cellText(cells, COL.raceName).replace(/\s+/g, '');
      if (!raceName) return;

      var posRaw = cellText(cells, COL.pos);
      var pos = parseInt(posRaw, 10);
      if (isNaN(pos)) return; // skip 中止/除外/取消

      var courseInfo = parseCourse(cellText(cells, COL.course));
      var prizeStr = cellText(cells, COL.prize).replace(/,/g, '');
      var prize = Math.round((parseFloat(prizeStr) || 0) * 10000);

      results.push({
        date: date,
        raceName: raceName,
        venue: parseVenue(cellText(cells, COL.venue)),
        distance: courseInfo.distance,
        surface: courseInfo.surface,
        grade: parseGrade(raceName),
        position: pos,
        totalRunners: parseInt(cellText(cells, COL.runners), 10) || 0,
        jockey: cellText(cells, COL.jockey),
        weight: parseFloat(cellText(cells, COL.weight)) || 0,
        time: cellText(cells, COL.time),
        margin: cellText(cells, COL.margin) || '—',
        prizeMoney: prize,
      });
    });
    return results;
  }

  function getHorseName() {
    var sels = ['.horse_title', '#horse_title', 'h1.name', '.mainHorseData h1', 'h1'];
    for (var i = 0; i < sels.length; i++) {
      var el = document.querySelector(sels[i]);
      if (el) {
        var n = el.textContent.trim().split(/[\s\n\（\(]/)[0].trim();
        if (n.length >= 2 && n.length <= 16) return n;
      }
    }
    return document.title.split(/[\s|｜\-]/)[0].trim();
  }

  function findTable() {
    var candidates = [
      document.querySelector('.db_h_race_results'),
      document.querySelector('.nk_tb_common'),
      document.querySelector('table[class*="race_result"]'),
      document.querySelector('table[class*="result_table"]'),
    ].filter(Boolean);
    if (candidates.length) return candidates[0];

    // Generic fallback: find any table containing 着順 and レース名 or 日付
    var tables = document.querySelectorAll('table');
    for (var i = 0; i < tables.length; i++) {
      var text = tables[i].textContent;
      if (text.indexOf('着順') !== -1 &&
          (text.indexOf('レース名') !== -1 || text.indexOf('日付') !== -1)) {
        return tables[i];
      }
    }
    return null;
  }

  var table = findTable();
  if (!table) {
    alert('レース結果テーブルが見つかりません\n馬の成績ページで実行してください\n例: db.netkeiba.com/horse/〜');
    return;
  }

  var results = scrapeTable(table);
  if (!results.length) {
    alert('レース結果を読み取れませんでした\nページの形式を確認してください');
    return;
  }

  // Trim to latest 60 races to stay within URL length limits
  if (results.length > 60) results = results.slice(0, 60);

  var payload = JSON.stringify({
    horseName: getHorseName(),
    source: location.hostname,
    results: results,
  });

  location.href = APP + '?import=' + encodeURIComponent(payload);
})();
