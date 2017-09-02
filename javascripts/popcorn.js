"use strict";

var popcornUrl = aws + 'getHomePageContent?action=getstats&prefix=pc';

var newUsersChart = new Chart(document.getElementById("pc_cht_new_users").getContext('2d'), {
    type: 'line'
});

function buildPopcornPage(content) {
	updateCharts(content.newUsers);
	buildPopcornLastGame('pc', content.lastGame);
	buildPopcornLeague(content.league, 'pc');
	document.getElementById('pc_total_players').innerHTML = numberWithCommas(content.totalUsers);
	document.getElementById('pc_total_games').innerHTML = numberWithCommas(content.totalGames);
}

function buildPopcornLastGame(prefix, t) {
	document.getElementById(prefix + '_lp_rank').innerHTML = numberWithCommas(t.rank);
	document.getElementById(prefix + '_lp_score').innerHTML = numberWithCommas(t.score);
	document.getElementById(prefix + '_lp_games').innerHTML = numberWithCommas(t.games);
	document.getElementById(prefix + '_lp_avg').innerHTML = ((+t.score)/(+t.games)).toFixed(2);
	document.getElementById(prefix + '_lp_ts').innerHTML = "...";
	document.getElementById(prefix + '_lp_ts').setAttribute('title', t.timestamp/1000);
	document.getElementById(prefix + '_lp_locale').innerHTML =  "<img class='locale' src='./images/" + t.locale + ".png' />";
}

function buildPopcornLeague(topTen, prefix) {
	var container = document.getElementById(prefix + '_scores')

	for (var i = 0; i < topTen.length; i++) {
		if (i >= displayCount) break;
		var x = i + 1;
		var id = prefix + "_" + x;
		var sym = "";
		if (topTen[i].icon == 'star') {sym = " &#9734;";}
		else if (topTen[i].icon == 'sun') {sym = " &#9788;";}
		else if (topTen[i].icon == 'note') {sym = " &#9834;";}

		if (!document.getElementById(prefix + '_' + x)) {
			var row = container.insertRow(-1);
			row.id = prefix + '_' + x;
			var cell1 = row.insertCell(0);
			cell1.id = prefix + "_rank_" + x;
			var cell2 = row.insertCell(1);
			cell2.id = prefix + "_score_" + x;
			var cell3 = row.insertCell(2);
			cell3.id = prefix + "_games_" + x;
			var cell4 = row.insertCell(3);
			cell4.id = prefix + "_avg_" + x;

			var cell5 = row.insertCell(4)
			cell5.id = prefix + "_ts_" + x;
			cell5.className = "timeago";
			cell5.title = topTen[i].timestamp/1000;
			var cell6 = row.insertCell(5);
			cell6.id = prefix + "_locale_" + x;

			cell1.innerHTML = x + sym;
			cell2.innerHTML = topTen[i].score;
			cell3.innerHTML = topTen[i].games;
			cell4.innerHTML = ((+topTen[i].score)/(+topTen[i].games)).toFixed(2);
			cell5.innerHTML = "...";

			if (topTen[i].locale) {
				cell6.innerHTML =  "<img class='locale' src='./images/" + topTen[i].locale + ".png' />";
			}
			
		} else {
			document.getElementById(prefix + '_rank_' + x).innerHTML = x + sym;
			document.getElementById(prefix + '_score_' + x).innerHTML = topTen[i].score;
			document.getElementById(prefix + '_games_' + x).innerHTML = topTen[i].games;
			document.getElementById(prefix + '_ts_' + x).title = topTen[i].timestamp/1000;
			if (topTen[i].locale) {
				document.getElementById(prefix + '_locale_' + x).innerHTML =  "<img class='locale' src='./images/" + topTen[i].locale + ".png' />";
			}
		}
		document.getElementById(prefix + '_count').innerHTML = i+1;
	}
}

var startDate = new Date("28 May 2017");

httpGetStats(popcornUrl, 'pc', function (err, data) {
	if (!err) {
		buildPopcornPage(data);
	}
});

buildAmazonParts({
	uk: {
		reviews: 'Awaiting publish',
		score: 'NA'
	}
}, 'popcorn_amazon_score');

setInterval(function () {
	httpGetStats(popcornUrl, 'pc', function (err, data) {
		if (!err) buildPopcornPage(data);
	});

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
		if (!x.locale) x.locale = 'Unknown'
		var idx = keyExists(x.locale, results)
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
		l[i] = q[0] + getMonthName(q[1]-1);
	}
	l[0] = "Launch";
	l[diff] = "Today";

	var ar = new Array(diff).fill(0);
	var uk = new Array(diff).fill(0);
	var us = new Array(diff).fill(0);
	var de = new Array(diff).fill(0);
	var un = new Array(diff).fill(0);

	for (var i = 0; i < data.length; i++) {
		var x = data[i];
		var d = new Date(x.d);
		var df = daydiff(startDate, d, true);
		if (x.l=="en-GB") uk[df-1]++;
		else if (x.l=="en-US") us[df-1]++;
		else if (x.l=="de-DE") de[df-1]++;
		else un[df-1]++;
		ar[df-1]++;
	}

	var d = {
		"labels": l,
		"datasets":[{
			"label":"New Users",
			"data": ar,
			"fill":false,
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

	chart.update();
}

function updateCharts(data) {
	if (!data) return;
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
    return retVal;
}

function addDays(startDate,numberOfDays) {
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
