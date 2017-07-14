"use strict";

var popcornCountUrl = 'https://api.mongolab.com/api/1/databases/popcorn/collections/game?l=0&f={"games":1,"startTimestamp":1,"_id":0}&apiKey=qbjPCckU4aqtUj_i5wyxpwEizWa5Ccp9';
var popcornUrl = 'https://api.mongolab.com/api/1/databases/popcorn/collections/game?l=0&s={"score":-1,"timestamp":1}&apiKey=qbjPCckU4aqtUj_i5wyxpwEizWa5Ccp9';
var popcornAmazonUkUrl = "https://api.mongolab.com/api/1/databases/popcorn/collections/amazon?q={}&apiKey=qbjPCckU4aqtUj_i5wyxpwEizWa5Ccp9";

// var ctx = document.getElementById("pc_cht_locale").getContext('2d');
var localChart = new Chart(document.getElementById("pc_cht_locale").getContext('2d'), {
    type: 'doughnut'
});
var newUsersChart = new Chart(document.getElementById("pc_cht_new_users").getContext('2d'), {
    type: 'line'
});

var startDate = new Date(2017, 4, 28);

httpGetStats(popcornUrl, 'pc', function (err, data) {
	if (!err) {
		updateCharts(data);
		chtNewUsers(newUsersChart, data)
	}
});

httpGetGameCount(popcornCountUrl, 'pc');
buildAmazonParts({
	uk: {
		reviews: 'Awaiting publish',
		score: 'NA'
	}
}, 'popcorn_amazon_score');

setInterval(function () {
	// console.log('getting');
	// httpGetAmazon(popcornAmazonUkUrl);
	httpGetStats(popcornUrl, 'pc', function (err, data) {
		if (!err) updateCharts(data);
	});
	httpGetGameCount(popcornCountUrl, 'pc');

	// console.log('got');
}, 5000);

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
				buildAmazonParts(doc, 'popcorn_amazon_score');
			}
		}
	}
}

function chtLocale(chart, data, options) {
	if (!data) return;
	var results = [];


	for (var i = 0; i < data.length; i++) {
		var x = data[i];
		// console.log(x)
		if (!x.locale) x.locale = 'Unknown'
		var idx = keyExists(x.locale, results)
		// console.log(idx)
		if (idx == -1) {
			results.push({
				key: x.locale,
				count: 1
			})
		} else {
			results[idx].count ++;
		}
	} 

	var d = {
	    datasets: [{
	        data: [],
	        backgroundColor: [
				'rgba(255,99,132,1)',
				'rgba(54, 162, 235, 1)',
				'rgba(255, 206, 86, 1)',
				'rgba(75, 192, 192, 1)',
				'rgba(153, 102, 255, 1)',
				'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
	    }],

	    // These labels appear in the legend and in the tooltips when hovering different arcs
	    labels: []
	};

	for (var i = 0; i < results.length; i++) {
		d.datasets[0].data.push(results[i].count);
		d.labels.push(results[i].key);
	}

	chart.data = d;
	chart.options.animation.duration = 1;

	chart.update();
}

function daydiff(first, second) {
    return Math.round((second-first)/(1000*60*60*24));
}

function chtNewUsers(chart, data) {
	if (!data) return;
	// console.log(chart)
		// console.log(data);
	// get days from launch as x axis
	// console.log(startDate)
	var today = new Date();
	var diff = daydiff(startDate, today);

	var l = new Array(diff).fill("");
	l[0] = "Launch";
	l[diff-1] = "Today";
	var ar = new Array(diff).fill(0);
	// ar[3] = 40
	// ar[13] = 40
	// ar[43] = 40


	for (var i = 0; i < data.length; i++) {
		var x = data[i];
		// console.log(x.startTimestamp)
		var d = new Date(x.startTimestamp);
		var df = daydiff(startDate, d)
		// console.log(df)
		ar[df] = ar[df]+1;
	}

	// console.log(ar)

	var d = {
		"labels": l,
		"datasets":[{
			"label":"New Users",
			"data": ar,
			"fill":false,
			"borderColor":"rgb(75, 192, 192)",
			"lineTension":0.1
		}],
		options: {}
				
	}

	chart.data = d;
	chart.options.animation.duration = 1;

	chart.update();
}

function updateCharts(data) {
	if (!data) return;
	// console.log(data);
	chtLocale(localChart, data);
	chtNewUsers(newUsersChart, data)
}
