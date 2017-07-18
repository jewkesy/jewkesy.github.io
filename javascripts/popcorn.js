"use strict";
var popcornLastPlay = 'https://api.mongolab.com/api/1/databases/popcorn/collections/game?l=0&f={"score":1,"games":1,"timestamp":1,"locale":1,"_id":0}&s={"score":-1,%22timestamp%22:1}&apiKey=qbjPCckU4aqtUj_i5wyxpwEizWa5Ccp9';
var popcornCountUrl = 'https://api.mongolab.com/api/1/databases/popcorn/collections/game?l=0&f={"games":1,"startTimestamp":1,"_id":0}&s={"startTimestamp":1}&apiKey=qbjPCckU4aqtUj_i5wyxpwEizWa5Ccp9';
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
	}
});

httpGetGameCount(popcornCountUrl, 'pc');
httpGetLastPlay(popcornLastPlay, 'pc');
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
	httpGetLastPlay(popcornLastPlay, 'pc');
	// console.log('got');
}, 60000);

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
	        backgroundColor: [],
            borderWidth: 1
	    }],

	    // These labels appear in the legend and in the tooltips when hovering different arcs
	    labels: []
	};

	for (var i = 0; i < results.length; i++) {
		d.datasets[0].data.push(results[i].count);
		d.labels.push(results[i].key);
		if (results[i].key == "en-GB") d.datasets[0].backgroundColor.push("rgba(255,99,132,1)");
		else if (results[i].key == "en-US") d.datasets[0].backgroundColor.push("rgba(54, 162, 235, 1)");
		else if (results[i].key == "de-DE") d.datasets[0].backgroundColor.push("rgba(255, 206, 86, 1)");
		else d.datasets[0].backgroundColor.push("rgba(75, 192, 192, 1)");
	}

	chart.data = d;
	chart.options.animation.duration = 1;

	chart.update();
}

function chtNewUsers(chart, data) {
	if (!data) return;

	// get days from launch as x axis

	var today = new Date();
	var diff = daydiff(startDate, today, true);
	var l = new Array(diff).fill("");

	for (var i = 1; i < diff-1; i++) {
		var someDate = addDays(startDate, i);
		var q = someDate.toLocaleDateString().split("/");
		l[i] = q[0] + getMonthName(q[1]);
		i++;
		i++;
	}
	l[0] = "28 May";
	l[diff] = "Today";

	var ar = new Array(diff).fill(0);
	var uk = new Array(diff).fill(0);
	var us = new Array(diff).fill(0);
	var de = new Array(diff).fill(0);
	var un = new Array(diff).fill(0);

	for (var i = 0; i < data.length; i++) {
		var x = data[i];
		var d = new Date(x.startDate);
		var df = daydiff(startDate, d, true);
		if (x.locale=="en-GB") uk[df-1]++;
		else if (x.locale=="en-US") us[df-1]++;
		else if (x.locale=="de-DE") de[df-1]++;
		else un[df-1]++;
		ar[df-1]++;
	}

	var d = {
		"labels": l,
		"datasets":[{
			"label":"New Users",
			"data": ar,
			"fill":false,
			// "borderColor":"rga(75, 192, 192,0.5)",
			"lineTension":0.1
		}, {
			"label":"en-GB",
			"data": uk,
			"fill":false,
			"borderColor":"rgba(255,99,132,1)",
			"backgroundColor":"rgba(255,99,132,1)",
			"lineTension":0.1
		},{
			"label":"en-US",
			"data": us,
			"fill":false,
			"borderColor":"rgba(54, 162, 235, 1)",
			"backgroundColor":"rgba(54, 162, 235, 1)",
			"lineTension":0.1
		},{
			"label":"de-DE",
			"data": de,
			"fill":false,
			"borderColor":"rgba(255, 206, 86, 1)",
			"backgroundColor":"rgba(255, 206, 86, 1)",
			"lineTension":0.1
		},{
			"label":"Unknown",
			"data": un,
			"fill":false,
			"borderColor":"rgba(75, 192, 192, 1)",
			"backgroundColor":"rgba(75, 192, 192, 1)",
			"lineTension":0.1
		}],
		options: {}	
	}

	chart.data = d;
	chart.getDatasetMeta(0).hidden = true
	chart.getDatasetMeta(4).hidden = true
	// chart.options.animation.duration = 1;

	chart.update();
}

function updateCharts(data) {
	if (!data) return;
	// console.log(data);
	chtLocale(localChart, data);
	chtNewUsers(newUsersChart, data)
}

function daydiff(first, second, includeLast) {

    // Copy date parts of the timestamps, discarding the time parts.
    var one = new Date(first.getFullYear(), first.getMonth(), first.getDate());
    var two = new Date(second.getFullYear(), second.getMonth(), second.getDate());

    // Do the math.
    var millisecondsPerDay = 1000 * 60 * 60 * 24;
    var millisBetween = two.getTime() - one.getTime();
    var days = millisBetween / millisecondsPerDay;

    if (includeLast) days++;
    // Round down.
    var retVal = Math.floor(days);
    // console.log(retVal)
    return retVal;
}

function addDays(startDate,numberOfDays)
	{
		var returnDate = new Date(
			startDate.getFullYear(),
			startDate.getMonth(),
			startDate.getDate()+numberOfDays,
			startDate.getHours(),
			startDate.getMinutes(),
			startDate.getSeconds());
		return returnDate;
	}

function getMonthName(mon) {
	var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	return " " + monthNames[+mon];
}
