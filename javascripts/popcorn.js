"use strict";

var popcornUrl = aws + 'getHomePageContent?action=getstats&prefix=pc';
var amazonUrl = aws + 'getHomePageContent?amazon=true';

var loc = getParameterByName('locale') || '';
var c = getParameterByName('limit') || 10;

if (loc != '') {
	popcornUrl += "&locale=" + loc;
}

if (c != 10) {
	popcornUrl += "&limit=" + c;
}

var newUsersChart = new Chart(document.getElementById("pc_cht_new_users").getContext('2d'), {
    type: 'line'
});

function buildPopcornPage(content) {


	updateCharts(content.newUsers);
	buildPopcornLastGame('pc', content.lastGame);

	// var x = document.getElementById('pc_total_games').getAttribute('total');
	// var y = document.getElementById('pc_scores').getAttribute('total');
// console.log(x,y)
	// if (x != y || !x || !y) 
	buildPopcornLeague(content.league, 'pc', content.totalGames);


	document.getElementById('pc_total_players').innerHTML = numberWithCommas(content.totalUsers);
	document.getElementById('pc_total_players').setAttribute('total', content.totalUsers);
	document.getElementById('pc_total_games').innerHTML = numberWithCommas(content.totalGames);
	document.getElementById('pc_total_games').setAttribute('total', content.totalGames);	
}

function buildPopcornLastGame(prefix, t) {

	var x = document.getElementById(prefix + '_lp_ts').getAttribute('title');

	if (x == t.t/1000) return;

	document.getElementById(prefix + '_lp_rank').innerHTML = numberWithCommas(t.r);
	document.getElementById(prefix + '_lp_score').innerHTML = numberWithCommas(t.s);
	document.getElementById(prefix + '_lp_games').innerHTML = numberWithCommas(t.g);
	document.getElementById(prefix + '_lp_avg').innerHTML = ((+t.s)/(+t.g)).toFixed(2);
	document.getElementById(prefix + '_lp_ts').innerHTML = "...";
	document.getElementById(prefix + '_lp_ts').setAttribute('title', t.t/1000);
	document.getElementById(prefix + '_lp_st').innerHTML = "...";
	document.getElementById(prefix + '_lp_st').setAttribute('title', t.st/1000);
	document.getElementById(prefix + '_lp_locale').innerHTML =  "<img class='locale' src='./images/" + t.l + ".png' />";
}

function buildPopcornLeague(topTen, prefix, total) {

	var container = document.getElementById(prefix + '_scores')
	// console.log(topTen)
	for (var i = 0; i < topTen.length; i++) {
		// if (i >= displayCount) break;
		var x = i + 1;
		
		var id = prefix + "_" + x;
		var sym = "";
		if (topTen[i].i == 'star') {sym = " &#9734;";}
		else if (topTen[i].i == 'sun') {sym = " &#9788;";}
		else if (topTen[i].i == 'note') {sym = " &#9834;";}

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

			var cell5 = row.insertCell(4);
			cell5.id = prefix + "_ts_" + x;
			cell5.className = "timeago";
			cell5.title = topTen[i].t/1000;

			var cell6 = row.insertCell(5);
			cell6.id = prefix + "_st_" + x;
			cell6.className = "timeago";
			cell6.title = topTen[i].st/1000;

			var cell7 = row.insertCell(6);
			cell7.id = prefix + "_locale_" + x;

			cell1.innerHTML = x + sym;
			cell2.innerHTML = topTen[i].s;
			cell3.innerHTML = topTen[i].g;
			cell4.innerHTML = ((+topTen[i].s)/(+topTen[i].g)).toFixed(2);
			cell5.innerHTML = "...";
			cell6.innerHTML = "...";

			if (topTen[i].l) {
				cell7.innerHTML =  "<img class='locale' src='./images/" + topTen[i].l + ".png' />";
			}
			
		} else {
			document.getElementById(prefix + '_rank_' + x).innerHTML = x + sym;
			document.getElementById(prefix + '_score_' + x).innerHTML = topTen[i].s;
			document.getElementById(prefix + '_games_' + x).innerHTML = topTen[i].g;
			document.getElementById(prefix + '_ts_' + x).title = topTen[i].t/1000;
			document.getElementById(prefix + '_st_' + x).title = topTen[i].st/1000;
			if (topTen[i].l) {
				document.getElementById(prefix + '_locale_' + x).innerHTML =  "<img class='locale' src='./images/" + topTen[i].l + ".png' />";
			}
		}
		document.getElementById(prefix + '_count').innerHTML = i+1;
	}
	document.getElementById(prefix + '_scores').setAttribute('total', total);
}

var startDate = new Date("28 May 2017");
// console.log(popcornUrl)
httpGetStats(popcornUrl, 'pc', function (err, data) {
	if (!err) {
		buildPopcornPage(data);
	}
});
httpGetAmazon(amazonUrl, function (err, data) {
	// if (!err) buildAmazonReview(data.reviews[0]);
});

setInterval(function () {
	httpGetStats(popcornUrl, 'pc', function (err, data) {
		if (!err) buildPopcornPage(data);
	});
	httpGetAmazon(amazonUrl, function (err, data) {
		// if (!err) buildAmazonReview(data.reviews[0]);
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
				var doc = JSON.parse(xmlHttp.responseText);
				buildAmazonReview(doc.reviews[0]);
			}
		}
	}
}

function buildAmazonReview(data) {

	var arIds = ['pc_uk_stars', 'pc_us_stars', 'pc_de_stars'];
	var arClasses = ['a-star-0', 'a-star-0-5', 'a-star-1', 'a-star-1-5', 'a-star-2', 'a-star-2-5', 'a-star-3', 'a-star-3-5', 'a-star-4', 'a-star-4-5', 'a-star-5'];
	// console.log(data)

	for (var i = 0; i < arIds.length; i++) {
		var e = document.getElementById(arIds[i]);
		for (var j = 0; j < arClasses.length; j++) {
			e.classList.remove(arClasses[j]);
		}

		if (i == 0) e.classList.add(getCssStar(data.uk.score));
		if (i == 1) e.classList.add(getCssStar(data.us.score));
		if (i == 2) e.classList.add(getCssStar(data.de.score));
	}
}

function getCssStar(score) {

	var retVal = 'a-star-';

	var s = score.toString().replace(".", "-");

	return retVal + s;
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
	var x = document.getElementById('pc_total_players').getAttribute('total');
	// console.log(x)
	// console.log(data.length)
	if (data.length == x) return
// console.log(data)
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
