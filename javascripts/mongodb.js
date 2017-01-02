"use strict";

httpGet("https://api.mongolab.com/api/1/databases/twentyquestions/collections/summary?q={}&apiKey=qbjPCckU4aqtUj_i5wyxpwEizWa5Ccp9");

function httpGet(theUrl){

	var xmlHttp = null;
	xmlHttp = new XMLHttpRequest();
	xmlHttp.open("GET", theUrl, true);
	xmlHttp.onreadystatechange = handleReadyStateChange;
	xmlHttp.send(null);

	function handleReadyStateChange() {
		if (xmlHttp.readyState == 4) {
			if (xmlHttp.status == 200) {
				var doc = JSON.parse(xmlHttp.responseText)[0];
				buildStatPanel(doc.topUsers, doc.totalUsers, doc.topWords, doc.quickest, doc.quickestObj, doc.wins, doc.loses, doc.failed, doc.totalGames, doc.avgGameHr, doc.startTime, doc.lastGame)
			}
		}
	}
}

function buildStatPanel(topUsers, userCount, topWords, fastest, fastestObj, wins, loses, failed, total, gPerHr, timeFrom, lastGame) {
	if (lastGame.win) {
		document.getElementById("20q_lastGame").innerHTML = "Alexa just won! She guessed " + lastGame.word + " in " + lastGame.num + " questions :)"
	} else {
		if (lastGame.num >= 30) {
			document.getElementById("20q_lastGame").innerHTML = "Alexa just lost! She couldn't guess the object after 30 questions :|";
		} else {
			document.getElementById("20q_lastGame").innerHTML = "Alexa just lost, but she guessed " + lastGame.word + " in " + lastGame.num + " questions :("
		}
	}

	document.getElementById("20q_timeFrom").innerHTML = "Skill launched on " + timeFrom.replace("+0000 (UTC)", "");
	document.getElementById("20q_players").innerHTML = numberWithCommas(userCount);
	document.getElementById("20q_wins").innerHTML = numberWithCommas(wins);
	document.getElementById("20q_loses").innerHTML = numberWithCommas(loses);
	document.getElementById("20q_total").innerHTML = numberWithCommas(total);

	document.getElementById("20q_wins_perc").innerHTML = Math.floor((wins / total) * 100) + '%';
	document.getElementById("20q_loses_perc").innerHTML  = Math.floor((loses / total) * 100) + '%';

	document.getElementById("20q_avgHr").innerHTML = numberWithCommas(gPerHr);

	document.getElementById("20q_fastestObj").innerHTML = fastestObj;
	document.getElementById("20q_fastest").innerHTML = fastest;

	for (var i = 0; i < 5; i++) {
		var x = i+1;
		document.getElementById("20q_word" + x).innerHTML = x +". " + topWords[i].key;
		document.getElementById("20q_word" + x + "_count").innerHTML = numberWithCommas(topWords[i].count);
	}
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}