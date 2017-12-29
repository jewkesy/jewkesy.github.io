"use strict";

var popcornStats = aws + 'getHomePageContent?stats=true&prefix=pc';
var popcornUrl = aws + 'getHomePageContent?action=getstats&prefix=pc';
var popcornLastGameUrl = aws + 'getHomePageContent?last=true&prefix=pc';
var amazonUrl = aws + 'getHomePageContent?amazon=true';

var loc = getParameterByName('locale') || '';
var c = getParameterByName('limit') || 10;

if (loc != '') {
	applyLocaleHeader(loc);
	popcornUrl += "&locale=" + loc;
}

function applyLocaleHeader(locale) {
	var elements = document.getElementsByClassName('selected');
	for(var i=0, l=elements.length; i<l; i++){
	 elements[i].classList.remove("selected");
	}
	
	document.getElementById("th_"+loc).classList.add('selected');
}

if (c != 10) popcornUrl += "&limit=" + c;

Chart.defaults.bar.scales.xAxes[0].categoryPercentage = 1;
Chart.defaults.bar.scales.xAxes[0].barPercentage = 1;
Chart.defaults.bar.scales.xAxes[0].gridLines={color:"rgba(0, 0, 0, 0)"};

var newUsersChart = new Chart(document.getElementById("pc_cht_new_users").getContext('2d'), { type: 'bar' });

function buildGamePlayStats(content) {
	// console.log(content.length)

	var dots = []

	for (var i = 0; i < content.length; i++) {
		var s = content[i];

		// get the day
		var d = new Date(s.d)
		var dd = ""+d.getFullYear()+(d.getMonth() + 1)+d.getDate();
		var day = weekday[d.getDay()];
		// console.log(dd);

		var idx = keyExists(dd, dots)
		if (idx == -1) {
			dots.push({
				key: dd,
				day: day,
				games: s.games
			})
		} else {
			dots[idx].games = s.games;
		}
	}
	
	for (var i = dots.length-1; i >= 0; i--) {
		// console.log(dots[i])
		if (i > 0) {
			dots[i].games = dots[i].games - dots[i-1].games;
			dots[i].hourly = dots[i].games/24;
		}
		else if (i == 0) dots[i].games = 0
	}

	fadeyStuff("pc_games_today", dots[dots.length-1].games)

	// console.log(dots)
}

function buildPopcornPage(content) {

	fadeyStuff("pc_ts", moment().format("MMM Do, HH:mm:ss"));

	if (!content) return;
	updateCharts(content.newUsers, content.totalUsers);
	buildPopcornLastGame('pc', content.lastGame);

	buildPopcornLeague(content.league, 'pc', content.totalGames);

	fadeyStuff("pc_total_players", numberWithCommas(content.totalUsers));
	document.getElementById('pc_total_players').setAttribute('total', content.totalUsers);

	fadeyStuff("pc_total_games", numberWithCommas(content.totalGames));
	document.getElementById('pc_total_games').setAttribute('total', content.totalGames);
}

function fadeyStuff(id, val) {
	if (document.getElementById(id).innerHTML == val) return;

	$("#"+id).fadeOut(666, function () {
		// console.log('here')
		document.getElementById(id).innerHTML = val;
		$("#"+id).fadeIn();
	});
}

function buildPopcornLastGame(prefix, t) {

	var x = document.getElementById(prefix + '_lp_ts').getAttribute('title');

	if (x == t.t/1000) return;

	fadeyStuff(prefix + '_lp_rank', numberWithCommas(t.r));
	fadeyStuff(prefix + '_lp_score', numberWithCommas(t.s));
	fadeyStuff(prefix + '_lp_games', numberWithCommas(t.g));
	fadeyStuff(prefix + '_lp_avg', ((+t.s)/(+t.g)).toFixed(2));
	fadeyStuff(prefix + '_lp_ts', humanTime((t.t/1000)+""));
	fadeyStuff(prefix + '_lp_st', humanTime((t.st/1000)+""));
	fadeyStuff(prefix + '_lp_locale', "<img class='locale' src='./images/" + t.l + ".png' />");

	// document.getElementById(prefix + '_lp_rank').innerHTML = numberWithCommas(t.r);
	// document.getElementById(prefix + '_lp_score').innerHTML = numberWithCommas(t.s);
	// document.getElementById(prefix + '_lp_games').innerHTML = numberWithCommas(t.g);
	// document.getElementById(prefix + '_lp_avg').innerHTML = ((+t.s)/(+t.g)).toFixed(2);
	// document.getElementById(prefix + '_lp_ts').innerHTML = humanTime((t.t/1000)+"");
	document.getElementById(prefix + '_lp_ts').setAttribute('title', t.t/1000);
	// document.getElementById(prefix + '_lp_st').innerHTML = humanTime((t.st/1000)+"");
	document.getElementById(prefix + '_lp_st').setAttribute('title', t.st/1000);
	// document.getElementById(prefix + '_lp_locale').innerHTML = "<img class='locale' src='./images/" + t.l + ".png' />";
}

function buildPopcornLeague(topTen, prefix, total) {

	var container = document.getElementById(prefix + '_scores')
	for (var i = 0; i < topTen.length; i++) {
		var x = i + 1;		
		var id = prefix + "_" + x;
		var sym = "";

		if (topTen[i].i == 'star') {sym = " &#9734;";}
		else if (topTen[i].i == 'sun') {sym = " &#9788;";}
		else if (topTen[i].i == 'note') {sym = " &#9834;";}
		else if (topTen[i].i == 'hash') {sym = " #";}

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

			cell1.innerHTML = numberWithCommas(x) + sym;
			cell2.innerHTML = numberWithCommas(topTen[i].s);
			cell3.innerHTML = numberWithCommas(topTen[i].g);
			cell4.innerHTML = ((+topTen[i].s)/(+topTen[i].g)).toFixed(2);
			cell5.innerHTML = humanTime((topTen[i].t/1000)+"");
			cell6.innerHTML = humanTime((topTen[i].st/1000)+"");

			if (topTen[i].l) cell7.innerHTML =  "<img class='locale' src='./images/" + topTen[i].l + ".png' />";
			
		} else {
			document.getElementById(prefix + '_rank_' + x).innerHTML = numberWithCommas(x) + sym;
			document.getElementById(prefix + '_score_' + x).innerHTML = numberWithCommas(topTen[i].s);
			document.getElementById(prefix + '_games_' + x).innerHTML = numberWithCommas(topTen[i].g);
			document.getElementById(prefix + '_avg_' + x).innerHTML = ((+topTen[i].s)/(+topTen[i].g)).toFixed(2);
			document.getElementById(prefix + '_ts_' + x).title = topTen[i].t/1000;
			document.getElementById(prefix + '_ts_' + x).innerHTML = humanTime((topTen[i].t/1000)+"");
			document.getElementById(prefix + '_st_' + x).title = topTen[i].st/1000;
			document.getElementById(prefix + '_st_' + x).innerHTML = humanTime((topTen[i].st/1000)+"");

			if (topTen[i].l) document.getElementById(prefix + '_locale_' + x).innerHTML =  "<img class='locale' src='./images/" + topTen[i].l + ".png' />";

		}
		document.getElementById(prefix + '_count').innerHTML = i+1;
	}
	document.getElementById(prefix + '_scores').setAttribute('total', total);
}

var startDate = new Date("28 May 2017");

var timeFrom = 0;
httpGetStats(popcornUrl, 'pc', function (err, data) {
	// timeFrom = new Date().getTime();
	if (!err) {
		buildPopcornPage(data);
	}
});
httpGetGameStats(popcornStats);
httpGetAmazon(amazonUrl, function (err, data) {});

var last = 0;

setInterval(function () {
	httpGetLastPlay(popcornLastGameUrl, 'pc', function (err, data) {
		if (!err) {
			if (!data || !data[0]) return;
			if (last < data[0].timestamp) {
				// console.log(last, data[0].timestamp)
				last = data[0].timestamp;
				var url = popcornUrl + "&timefrom=" + timeFrom;
				console.log(url)
				httpGetStats(url, 'pc', function (err, data) {
					// timeFrom = new Date().getTime();
					// console.log(data)
					if (!err) buildPopcornPage(data);
				});
				httpGetGameStats(popcornStats);
			}
		} 
	});
	
	httpGetAmazon(amazonUrl, function (err, data) {});

}, 5000);

function httpGetGameStats(theUrl){
	var xmlHttp = null;
	xmlHttp = new XMLHttpRequest();
	xmlHttp.open("GET", theUrl, true);
	xmlHttp.onreadystatechange = handleReadyStateChange;
	xmlHttp.send(null);

	function handleReadyStateChange() {
		if (xmlHttp.readyState == 4) {
			if (xmlHttp.status == 200) {
				var doc = JSON.parse(xmlHttp.responseText);
				buildGamePlayStats(doc);
			}
		}
	}
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
				var doc = JSON.parse(xmlHttp.responseText);
				buildAmazonReview(doc.reviews[0]);
			}
		}
	}
}

function buildAmazonReview(data) {
	// console.log(data)
	if (!data.uk) data.uk = {score:0,reviews:0};
	if (!data.us) data.us = {score:0,reviews:0};
	if (!data.de) data.de = {score:0,reviews:0};
	if (!data.in) data.in = {score:0,reviews:0};
	if (!data.ca) data.ca = {score:0,reviews:0};
	if (!data.jp) data.jp = {score:0,reviews:0};
	if (!data.au) data.au = {score:0,reviews:0};

	var arIds = ['pc_uk_stars', 'pc_us_stars', 'pc_de_stars', , 'pc_in_stars', 'pc_ca_stars', 'pc_jp_stars', 'pc_au_stars'];
	var arClasses = ['a-star-0', 'a-star-0-5', 'a-star-1', 'a-star-1-5', 'a-star-2', 'a-star-2-5', 'a-star-3', 'a-star-3-5', 'a-star-4', 'a-star-4-5', 'a-star-5'];
	// console.log(data)

	for (var i = 0; i < arIds.length; i++) {
		var e = document.getElementById(arIds[i]);
		if (!e) continue;
		for (var j = 0; j < arClasses.length; j++) {
			e.classList.remove(arClasses[j]);
		}

		     if (i == 0) e.classList.add(getCssStar(data.uk.score));
		else if (i == 1) e.classList.add(getCssStar(data.us.score));
		else if (i == 2) e.classList.add(getCssStar(data.de.score));
		else if (i == 3) e.classList.add(getCssStar(data.in.score));
		else if (i == 4) e.classList.add(getCssStar(data.ca.score));
		else if (i == 5) e.classList.add(getCssStar(data.jp.score));
		else if (i == 6) e.classList.add(getCssStar(data.au.score));
	}

	if (document.getElementById('pc_uk_reviews')) document.getElementById('pc_uk_reviews').innerHTML = data.uk.reviews;
	if (document.getElementById('pc_us_reviews')) document.getElementById('pc_us_reviews').innerHTML = data.us.reviews;
	if (document.getElementById('pc_de_reviews')) document.getElementById('pc_de_reviews').innerHTML = data.de.reviews;
	if (document.getElementById('pc_in_reviews')) document.getElementById('pc_in_reviews').innerHTML = data.in.reviews;
	if (document.getElementById('pc_ca_reviews')) document.getElementById('pc_ca_reviews').innerHTML = data.ca.reviews;
	if (document.getElementById('pc_jp_reviews')) document.getElementById('pc_jp_reviews').innerHTML = data.jp.reviews;
	if (document.getElementById('pc_au_reviews')) document.getElementById('pc_au_reviews').innerHTML = data.au.reviews;
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
		else if (results[i].key == "en-IN") d.datasets[0].backgroundColor.push("rgba(75, 192, 192, 1)");
		else if (results[i].key == "en-CA") d.datasets[0].backgroundColor.push("rgba(90, 92, 192, 1)");
		else if (results[i].key == "ja-JP") d.datasets[0].backgroundColor.push("rgba(90, 92, 192, 1)");
		else if (results[i].key == "en-AU") d.datasets[0].backgroundColor.push("rgba(90, 92, 192, 1)");
		else d.datasets[0].backgroundColor.push("rgba(75, 192, 192, 1)");
	}

	chart.data = d;
	chart.options.animation.duration = 1;

	chart.update();
}

function chtNewUsers(chart, data, total) {
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

	// var ar = new Array(diff).fill(0);
	var uk = new Array(diff).fill(null);
	var us = new Array(diff).fill(null);
	var de = new Array(diff).fill(null);
	var ind =new Array(diff).fill(null);
	var ca = new Array(diff).fill(null);
	var jp = new Array(diff).fill(null);
	var au = new Array(diff).fill(null);

	var avg = new Array(diff).fill(0);

	var we = new Array(diff).fill(null);
	var mo = new Array(diff).fill(null);

	var totals = new Array(diff).fill(0);

	var max = 0;
// console.log(data)
	for (var i = 0; i < data.length; i++) {
		var x = data[i];	

		var d = new Date(x.d*100000);
		var day = d.getDay();
// console.log(day)
		var df = daydiff(startDate, d, true)-1;
		if (df < 0) continue;

		if (x.l=="GB") uk[df]++;
		else if (x.l=="US") us[df]++;
		else if (x.l=="DE") de[df]++;
		else if (x.l=="IN") ind[df]++;
		else if (x.l=="CA") ca[df]++;
		else if (x.l=="JP") jp[df]++;
		else if (x.l=="AU") au[df]++;
		else us[df]++; // assume US
		totals[df]++;

		// var day = d.getDay();
		if (day == 0 || day >= 5) we[df]=3500;
		var dt = d.getDate();
		// console.log(dt)
		if (dt == 1) mo[df]=3500;
	}
	document.getElementById('pc_total_today').innerHTML = numberWithCommas(totals[totals.length-1]);
	var t = 1;  // include myself
	avg[0] = totals[0]
	for (var i = 0; i < diff; i++) {
		t += totals[i]
		avg[i] = t/(i+1) 
	}

	var red = "rgba(255,99,132,1)";
	var blue = "rgba(54,162,235,1)";
	var yellow = "rgba(255,206,86,1)";
	var orange = "rgba(247,152,57,1)";
	var purple = "rgba(195,144,212,1)";
	var green = "rgba(22,158,22,1)";
	var grey = "rgba(168,173,168,1)";

	var d = {
		"labels": l,
		"datasets":[
		{
			"label":"UK",
			"data": uk,
			"fill":false,
			"borderColor":red,
			"backgroundColor":red,
			"lineTension":0.1,
			"type":"line",
			"pointRadius":2
		},{
			"label":"US",
			"data": us,
			"fill":false,
			"borderColor":blue,
			"backgroundColor":blue,
			"lineTension":0.1,
			"type":"line",
			"pointRadius":2
		},{
			"label":"Germany",
			"data": de,
			"fill":false,
			"borderColor":yellow,
			"backgroundColor":yellow,
			"lineTension":0.1,
			"type":"line",
			"pointRadius":2
		},{
			"label":"India",
			"data": ind,
			"fill":false,
			"borderColor":orange,
			"backgroundColor":orange,
			"lineTension":0.1,
			"type":"line",
			"pointRadius":2
		},{
			"label":"Canada",
			"data": ca,
			"fill":false,
			"borderColor":purple,
			"backgroundColor":purple,
			"lineTension":0.1,
			"type":"line",
			"pointRadius":2
		},{
			"label":"Japan",
			"data": jp,
			"fill":false,
			"borderColor":green,
			"backgroundColor":green,
			"lineTension":0.1,
			"type":"line",
			"pointRadius":2
		},{
			"label":"Australia",
			"data": au,
			"fill":false,
			"borderColor":grey,
			"backgroundColor":grey,
			"lineTension":0.1,
			"type":"line",
			"pointRadius":2
		},{
			"label":"", //Weekends
			"data": we,
			"type": "bar",
			"borderWidth": 1,
			"backgroundColor":"rgba(238, 238, 238, 0.4)",
			"borderColor":"rgba(238, 238, 238, 0.4)"
		},{
			"label":"", //Months
			"data": mo,
			"type": "bar",
			"borderWidth": 1,
			"backgroundColor":"rgba(76, 245, 20, 1)"
		},{
			"label":"", //avg
			"data": avg,
			"type": "line",
			"fill":false,
			"borderColor":"rgba(0, 0, 0, 1)",
			"backgroundColor":"rgba(0, 0, 0, 1)",
			"pointRadius":0
		}],
		options: {
			"responsive": true
		}
    }
	// console.log(mo)
	chart.data = d;
	chart.update();
}

function updateCharts(data, total) {
	if (!data) return;
	var x = document.getElementById('pc_total_players').getAttribute('total');
	// console.log(x,data.length)
	if (data.length == x) return;
	chtNewUsers(newUsersChart, data, total)
}
