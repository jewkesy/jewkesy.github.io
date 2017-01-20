"use strict";

const statsUrl = "https://api.mongolab.com/api/1/databases/twentyquestions/collections/summary?q={}&apiKey=qbjPCckU4aqtUj_i5wyxpwEizWa5Ccp9";
const amazonUkUrl = "https://api.mongolab.com/api/1/databases/twentyquestions/collections/amazon?q={}&apiKey=qbjPCckU4aqtUj_i5wyxpwEizWa5Ccp9";

httpGetStats(statsUrl, true);
httpGetAmazon(amazonUkUrl);

var totalGames = 0;


setInterval(function () { 
	// console.log('getting');
	httpGetStats(statsUrl, false);
	httpGetAmazon(amazonUkUrl);
	// console.log('got');
}, 60000);



function httpGetStats(theUrl, firstTime){

	var xmlHttp = null;
	xmlHttp = new XMLHttpRequest();
	xmlHttp.open("GET", theUrl, true);
	xmlHttp.onreadystatechange = handleReadyStateChange;
	xmlHttp.send(null);

	function handleReadyStateChange() {
		if (xmlHttp.readyState == 4) {
			if (xmlHttp.status == 200) {
				var doc = JSON.parse(xmlHttp.responseText)[0];
				// if (totalGames == doc.totalGames) return;
				totalGames = doc.totalGames;
				// console.log(doc)
				buildStatPanel(doc.topUsers, doc.totalUsers, doc.topWords, doc.quickest, doc.quickestObj, doc.wins, doc.loses, doc.failed, doc.totalGames, doc.avgGameHr, doc.startTime, doc.lastGame);
				
				if (firstTime) buildCharts(doc.categories, firstTime);
			}
		}
	}
}

function buildStatPanel(topUsers, userCount, topWords, fastest, fastestObj, wins, loses, failed, total, gPerHr, timeFrom, lastGame) {
	if (lastGame.win) {
		document.getElementById("20q_lastGame").innerHTML = "<strong>Alexa just won!</strong><br>She guessed " + lastGame.word + " in " + lastGame.num + " questions :)"
	} else {
		if (lastGame.num >= 30) {
			document.getElementById("20q_lastGame").innerHTML = "<strong>Alexa just lost!</strong><br>She couldn't guess the object after 30 questions :(";
		} else {
			document.getElementById("20q_lastGame").innerHTML = "<strong>Alexa just lost</strong><br>But she guessed " + lastGame.word + " in " + lastGame.num + " questions :|"
		}
	}

	document.getElementById("20q_timeFrom").innerHTML = "Echo Skill launched on " + timeFrom.replace("+0000 (UTC)", "");
	document.getElementById("20q_players").innerHTML = numberWithCommas(userCount);
	document.getElementById("20q_wins").innerHTML = numberWithCommas(wins);
	document.getElementById("20q_loses").innerHTML = numberWithCommas(loses - failed);
	document.getElementById("20q_failed").innerHTML = numberWithCommas(failed);
	document.getElementById("20q_total").innerHTML = numberWithCommas(total);

	document.getElementById("20q_wins_perc").innerHTML = Math.floor((wins / total) * 100) + '%';
	document.getElementById("20q_loses_perc").innerHTML  = Math.floor(((loses - failed) / total) * 100) + '%';
	document.getElementById("20q_failed_perc").innerHTML  = Math.floor((failed / total) * 100) + '%';

	document.getElementById("20q_avgHr").innerHTML = numberWithCommas(gPerHr);

	document.getElementById("20q_fastestObj").innerHTML = fastestObj;
	document.getElementById("20q_fastest").innerHTML = fastest;

	for (var i = 0; i < 10; i++) {
		var x = i+1;
		document.getElementById("20q_word" + x).innerHTML = x +". " + topWords[i].key;
		document.getElementById("20q_word" + x + "_count").innerHTML = numberWithCommas(topWords[i].count);
	}
}

function buildCharts(categories) {
	// console.log(categories);

	// var ctx = document.getElementById("chtCats");
	var ctx = document.getElementById("chtCats").getContext("2d");
	// var ctx = $("#chtCats");

	var myChart = new Chart(ctx, {
	    type: 'bar',
	    data: {
	        labels: ["Animal", "Vegetable", "Mineral", "Other", "Unknown"],
	        datasets: [{
	            label: 'Count',
	            data: [
	            	getCountByKey('Animal', categories), 
	            	getCountByKey('Vegetable', categories), 
	            	getCountByKey('Mineral', categories), 
	            	getCountByKey('Other', categories), 
	            	getCountByKey('Unknown', categories)],
	            backgroundColor: [
	                'rgba(255, 99, 132, 0.2)',
	                'rgba(54, 162, 235, 0.2)',
	                'rgba(255, 206, 86, 0.2)',
	                'rgba(75, 192, 192, 0.2)',
	                'rgba(153, 102, 255, 0.2)'
	            ],
	            borderColor: [
	                'rgba(255,99,132,1)',
	                'rgba(54, 162, 235, 1)',
	                'rgba(255, 206, 86, 1)',
	                'rgba(75, 192, 192, 1)',
	                'rgba(153, 102, 255, 1)'
	            ],
	            borderWidth: 1
	        }]
	    },
	    options: {
	    	legend: {
	    		display: false
	    	},
	        scales: {
	            yAxes: [{
	            	display: false
	            }]
	        }
	    }
	});
}

function httpGetAmazon(theUrl){
	var xmlHttp = null;
	xmlHttp = new XMLHttpRequest();
	xmlHttp.open("GET", theUrl, true);
	xmlHttp.onreadystatechange = handleReadyStateChange;
	xmlHttp.send(null);

	function handleReadyStateChange() {
		if (xmlHttp.readyState == 4) {
			if (xmlHttp.status == 200) {
				var doc = JSON.parse(xmlHttp.responseText)[0];
				// console.log(doc)
				buildAmazonParts(doc);
			}
		}
	}
}

function buildAmazonParts(doc) {
	document.getElementById("20q_amazon_score").innerHTML = "Amazon Rating: " + doc.uk.score + " / 5<br>" + "Reviews: " + doc.uk.reviews;
}

function getCountByKey(key, arr) {
	for(var i = 0, len = arr.length; i < len; i++) {
		if( arr[ i ].key === key ) return arr[ i ].count;
	}
	return 0;
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
