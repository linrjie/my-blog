// ===== Daily Quote =====
var dailyQuotes = [
  { text: "学而不思则罔，思而不学则殆。", author: "孔子" },
  { text: "己所不欲，勿施于人。", author: "孔子" },
  { text: "三人行，必有我师焉。", author: "孔子" },
  { text: "温故而知新，可以为师矣。", author: "孔子" },
  { text: "知之者不如好之者，好之者不如乐之者。", author: "孔子" },
  { text: "路漫漫其修远兮，吾将上下而求索。", author: "屈原" },
  { text: "天行健，君子以自强不息。", author: "周易" },
  { text: "地势坤，君子以厚德载物。", author: "周易" },
  { text: "千里之行，始于足下。", author: "老子" },
  { text: "上善若水，水善利万物而不争。", author: "老子" },
  { text: "知人者智，自知者明。", author: "老子" },
  { text: "合抱之木，生于毫末；九层之台，起于累土。", author: "老子" },
  { text: "不积跬步，无以至千里；不积小流，无以成江海。", author: "荀子" },
  { text: "锲而舍之，朽木不折；锲而不舍，金石可镂。", author: "荀子" },
  { text: "书山有路勤为径，学海无涯苦作舟。", author: "韩愈" },
  { text: "业精于勤，荒于嬉；行成于思，毁于随。", author: "韩愈" },
  { text: "宝剑锋从磨砺出，梅花香自苦寒来。", author: "警世贤文" },
  { text: "少壮不努力，老大徒伤悲。", author: "长歌行" },
  { text: "黑发不知勤学早，白首方悔读书迟。", author: "颜真卿" },
  { text: "读书破万卷，下笔如有神。", author: "杜甫" },
  { text: "横看成岭侧成峰，远近高低各不同。", author: "苏轼" },
  { text: "不识庐山真面目，只缘身在此山中。", author: "苏轼" },
  { text: "山重水复疑无路，柳暗花明又一村。", author: "陆游" },
  { text: "纸上得来终觉浅，绝知此事要躬行。", author: "陆游" },
  { text: "人生自古谁无死，留取丹心照汗青。", author: "文天祥" },
  { text: "落红不是无情物，化作春泥更护花。", author: "龚自珍" },
  { text: "海内存知己，天涯若比邻。", author: "王勃" },
  { text: "长风破浪会有时，直挂云帆济沧海。", author: "李白" },
  { text: "天生我材必有用，千金散尽还复来。", author: "李白" },
];

function getDailyQuote() {
  var today = new Date();
  var start = new Date(today.getFullYear(), 0, 0);
  var diff = today - start;
  var oneDay = 1000 * 60 * 60 * 24;
  var dayOfYear = Math.floor(diff / oneDay);
  var index = dayOfYear % dailyQuotes.length;
  return dailyQuotes[index];
}

function initDailyQuote() {
  var el = document.getElementById("daily-quote");
  var authorEl = document.getElementById("daily-quote-author");
  if (!el) return;
  var quote = getDailyQuote();
  el.textContent = quote.text;
  if (authorEl) authorEl.textContent = "—— " + quote.author;
}
