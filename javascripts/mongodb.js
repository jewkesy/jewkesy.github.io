"use strict";

httpGet("https://api.mongolab.com/api/1/databases/twentyquestions/collections/stats?q={}&l=50000&apiKey=qbjPCckU4aqtUj_i5wyxpwEizWa5Ccp9");

function httpGet(theUrl){

	var xmlHttp = null;
	xmlHttp = new XMLHttpRequest();
	xmlHttp.open("GET", theUrl, true);
	xmlHttp.onreadystatechange = handleReadyStateChange;
	xmlHttp.send(null);

	function handleReadyStateChange() {
		if (xmlHttp.readyState == 4) {
			if (xmlHttp.status == 200) {
				var docs = JSON.parse(xmlHttp.responseText);
				processResults(docs);
			}
		}
	}
}

function buildStatPanel(topUsers, userCount, topWords, fastest, wins, loses, failed, total, gPerHr) {
	// console.log(topUsers, userCount, topWords, fastest, wins, loses, failed, total);
	document.getElementById("20q_players").innerHTML = numberWithCommas(userCount);
	document.getElementById("20q_wins").innerHTML = numberWithCommas(wins);
	document.getElementById("20q_loses").innerHTML = numberWithCommas(loses);
	document.getElementById("20q_total").innerHTML = numberWithCommas(total);

	document.getElementById("20q_wins_perc").innerHTML = Math.floor((wins / total) * 100) + '%';
	document.getElementById("20q_loses_perc").innerHTML  = Math.floor((loses / total) * 100) + '%';

	document.getElementById("20q_avgHr").innerHTML = numberWithCommas(gPerHr);

	for (var i = 0; i < topWords.length; i++) {
		var x = i+1;
		document.getElementById("20q_word" + x).innerHTML = x +". " + topWords[i].key;
		document.getElementById("20q_word" + x + "_count").innerHTML = numberWithCommas(topWords[i].count);
	}
}

function processResults(docs) {
	var users = [];
	var words = [];
	var quickest = 30;
	var win = 0;
	var lose = 0;
	var end = 0;

	var startDate = new Date(docs[0].timestamp);
	var endDate = new Date(docs[docs.length-1].timestamp);

	var hours = Math.abs(startDate - endDate) / 36e5;
	var gPerHr = Math.ceil(docs.length/Math.ceil(hours));
	// console.log(startDate, endDate, Math.ceil(hours), gPerHr);

	for (var i = 0; i < docs.length; i++) {
		upsertArray(docs[i].userId, users);
		upsertArray(docs[i].word, words);
		if (docs[i].num < quickest) quickest = docs[i].num;
		if (docs[i].num == 30) end++;
		if (docs[i].win) win++; else lose++;
	}

	users.sort(sortByCount);
	var topUsers = users.slice(0, 10);
	// console.log(users.length, topUsers);

	words.sort(sortByCount);	
	var topWords = words.slice(0, 5);

	// console.log(topWords);

	// console.log("Fastest: " + quickest, "Wins: " + win, "Loses: " + lose, "Failed: " + end, "No. records: " + docs.length);
	buildStatPanel(topUsers, users.length, topWords, quickest, win, lose, end, docs.length, gPerHr);
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function sortByCount(a,b) {
  if (a.count < b.count)
    return 1;
  if (a.count > b.count)
    return -1;
  return 0;
}

function upsertArray(key, array) {
  var position = keyExists(key, array) 
  if (position > -1) {
    array[position].count++;
  } else {
    array.push({key: key, count: 1});
  }
}

function keyExists(name, arr) {
  for(var i = 0, len = arr.length; i < len; i++) {
    if( arr[ i ].key === name ) return i;
  }
  return -1;
}