"use strict";

var trifleCountUrl = 'https://api.mongolab.com/api/1/databases/trifle/collections/game?f={"games":1,"_id":0}&apiKey=qbjPCckU4aqtUj_i5wyxpwEizWa5Ccp9';
var trifleUrl = 'https://api.mongolab.com/api/1/databases/trifle/collections/game?s={"score":-1,"timestamp":1}&apiKey=qbjPCckU4aqtUj_i5wyxpwEizWa5Ccp9';
var trifleAmazonUkUrl = "https://api.mongolab.com/api/1/databases/twentyquestions/collections/amazon?q={}&apiKey=qbjPCckU4aqtUj_i5wyxpwEizWa5Ccp9";

var myId = "amzn1.ask.account.AFJST3SHUEGBJ6AIWIBJHTJHHCU6NOUCAYBPAASUEPR6CAOPWB2MNH4T5JWE5GHTBVHRXXJFDV7TGAA4LLYETT3WIGRGKS2LEU5MR6X3HTEJW467IU7XNGI3OTBHYKZB4TMD5QYVTQ423HKYVT4J74TSCWHRGPYPJEWHFIGNJRKBOOKX4C7LSUX47V7CVIN5Q3KADVTT63FHE2A";

httpGetStats(trifleUrl);
httpGetGameCount(trifleCountUrl);
buildAmazonParts({
	uk: {
		reviews: 'Awaiting publish',
		score: 'NA'
	}
}, 'trifle_amazon_score');

setInterval(function () {
	// console.log('getting');
	// httpGetAmazon(trifleAmazonUkUrl);
	httpGetStats(trifleUrl);
	httpGetGameCount(trifleCountUrl);
	// console.log('got');
}, 60000);

// httpGetAmazon(amazonUkUrl);
function httpGetGameCount(theUrl){
	var xmlHttp = null;
	xmlHttp = new XMLHttpRequest();
	xmlHttp.open("GET", theUrl, true);
	xmlHttp.onreadystatechange = handleReadyStateChange;
	xmlHttp.send(null);

	function handleReadyStateChange() {
		if (xmlHttp.readyState == 4) {
			if (xmlHttp.status == 200) {
				var doc = JSON.parse(xmlHttp.responseText);
				// console.log(doc)
				// tr_total_games
				document.getElementById('tr_total_players').innerHTML = numberWithCommas(doc.length);

				var count = 0;
				for (var i = 0; i < doc.length; i++) {
					count += doc[i].games;
				}

				document.getElementById('tr_total_games').innerHTML = numberWithCommas(count);
				
			}
		}
	}
}

function httpGetStats(theUrl){
	var xmlHttp = null;
	xmlHttp = new XMLHttpRequest();
	xmlHttp.open("GET", theUrl, true);
	xmlHttp.onreadystatechange = handleReadyStateChange;
	xmlHttp.send(null);

	function handleReadyStateChange() {
		if (xmlHttp.readyState == 4) {
			if (xmlHttp.status == 200) {
				var doc = JSON.parse(xmlHttp.responseText);
				// console.log(doc)
				buildTopTen(doc.splice(0, 10));
			}
		}
	}
}

function buildTopTen(topTen) {
	// console.log(topTen)

	for (var i = 0; i < topTen.length; i++) {
		var x = i + 1;
		var id = "tr_" + x;
		if (topTen[i].userId == myId) console.log(x)
		document.getElementById(id + "_score").innerHTML = numberWithCommas(topTen[i].score);
		document.getElementById(id + "_games").innerHTML = numberWithCommas(topTen[i].games);

	}
}

function buildCharts(categories, wins) {
	// console.log(categories, wins);

	var ctxCats = document.getElementById("chtCats").getContext("2d");
	var ctxWins = document.getElementById("chtWins").getContext("2d");

	var catChart = new Chart(ctxCats, {
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
	var winChart = new Chart(ctxWins, {
		type: 'pie',
		data: {
			labels: wins.labels,
			datasets: [{
				data: wins.data,
				backgroundColor: [
                "#FF6384",
                "#36A2EB",
                "#FFCE56"
            ],
            hoverBackgroundColor: [
                "#FF6384",
                "#36A2EB",
                "#FFCE56"
            ]
			}]
		},
		options: {
			legend: {
				display: true
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
				buildAmazonParts(doc, 'trifle_amazon_score');
			}
		}
	}
}

