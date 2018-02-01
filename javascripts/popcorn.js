"use strict";

var popcornStats = aws + 'getHomePageContent?stats=true&prefix=pc&limit=75';
var popcornUrl = aws + 'getHomePageContent?action=getstats&prefix=pc';
var popcornLastGameUrl = aws + 'getHomePageContent?last=true&prefix=pc';
var amazonUrl = aws + 'getHomePageContent?amazon=true';

var loc = getParameterByName('locale') || '';
var c = getParameterByName('limit') || 10;

document.getElementById('pc_more_count').innerHTML = c;

// if (c != 10) 
popcornUrl += "&limit=" + c;
popcornLastGameUrl += "&limit=" + c;

Chart.defaults.bar.scales.xAxes[0].categoryPercentage = 1;
Chart.defaults.bar.scales.xAxes[0].barPercentage = 1;
Chart.defaults.bar.scales.xAxes[0].gridLines={color:"rgba(0, 0, 0, 0)"};

if (loc != '') {
	applyLocaleHeader(loc);
	popcornUrl += "&locale=" + loc;
}

var startDate = new Date("28 May 2017");
var timeFrom = 0;
var last = 0;

httpGetAmazon(amazonUrl, function (err, data) {
	setInterval(function () {
		httpGetAmazon(amazonUrl, function (err, data) {});
	}, 60000);
});

httpGetStats(aws + "getHomePageContent?league=true&prefix=pc&limit=" + c + "&locale=" + loc, 'pc',  function (err, data) {
	buildPopcornLeague(data, 'pc');
});
httpGetStats(aws + "getHomePageContent?lastgames=true&prefix=pc&limit=" + c + "&locale=" + loc, 'pc',  function (err, data) {
	buildPopcornLastGames(data, 'pc');
});
httpGetGameStats(popcornStats);
httpGetStats(aws + "getHomePageContent?newusers=true&prefix=pc&limit=" + c + "&locale=" + loc + "&timefrom=" + timeFrom, 'pc', function (err, data) {
	if (!data) return;
	timeFrom = data.lastTime;
	console.log(data);
	if (!err) buildPopcornPage(data);
	setInterval(function () {
		httpGetLastPlay(popcornLastGameUrl, 'pc', function (err, data) {
			if (!err) {
				if (!data || !data[0]) return;
				if (last < data[0].timestamp) {
					last = data[0].timestamp;
					httpGetStats(aws + "getHomePageContent?league=true&prefix=pc&limit=" + c + "&locale=" + loc, 'pc',  function (err, data) {
						buildPopcornLeague(data, 'pc');
					});
					httpGetStats(aws + "getHomePageContent?lastgames=true&prefix=pc&limit=" + c + "&locale=" + loc, 'pc',  function (err, data) {
						buildPopcornLastGames(data, 'pc');
					});
					// console.log(aws + "getHomePageContent?newusers=true&prefix=pc&limit=" + c + "&locale=" + loc + "&timefrom=" + timeFrom);
					httpGetStats(aws + "getHomePageContent?newusers=true&prefix=pc&limit=" + c + "&locale=" + loc + "&timefrom=" + timeFrom, 'pc', function (err, data) {
						if (!data) return;
						console.log(data);
						timeFrom = data.lastTime;
						if (!err) buildPopcornPage(data);
					});
					httpGetGameStats(popcornStats);
				}
			} 
		});
	}, 5000);
});

function applyLocaleHeader(locale) {
	var elements = document.getElementsByClassName('selected');
	for(var i=0, l=elements.length; i<l; i++){
	 elements[i].classList.remove("selected");
	}
	
	document.getElementById("th_"+loc).classList.add('selected');
}

function buildGamePlayStats(content) {
	// console.log(content)
	var dots = [];

	for (var i = content.length-1; i >= 0; i--) {	
		var s = content[i];

		// get the day
		var d = new Date(s.d);
		var dd = ""+d.getFullYear()+(d.getMonth() + 1)+d.getDate();
		var day = weekday[d.getDay()];
		// console.log(dd);

		var idx = keyExists(dd, dots);
		if (idx == -1) {
			dots.push({
				key: dd,
				day: day,
				games: s.games
			});
		} else {
			dots[idx].games = s.games;
		}
	}
	
	for (var i = dots.length-1; i >= 0; i--) {
		// console.log(dots[i])
		if (i > 0) {
			dots[i].games = dots[i].games - dots[i-1].games;
			dots[i].hourly = dots[i].games/24;
		} else if (i === 0) dots[i].games = 0;
	}

	fadeyStuff("pc_games_today", numberWithCommas(dots[dots.length-1].games));
}

function buildPopcornPage(content) {
	fadeyStuff("pc_ts", moment().format("MMM Do, HH:mm:ss"));

	if (!content) return;
	if (content.count === 0) return;
	updateCharts(content.counts, content.totalUsers);
}

function fadeyStuff(id, val) {
	if (document.getElementById(id).innerHTML == val) return;

	$("#"+id).fadeOut(666, function () {
		document.getElementById(id).innerHTML = val;
		$("#"+id).fadeIn();
	});
}

function buildPopcornLastGames(data, prefix) {
	if(!data) return;
	fadeyStuff("pc_total_players", numberWithCommas(data.totalUsers));
	document.getElementById('pc_total_players').setAttribute('total', data.totalUsers);

	fadeyStuff("pc_total_games", numberWithCommas(data.totalGames));
	document.getElementById('pc_total_games').setAttribute('total', data.totalGames);

	var container = document.getElementById(prefix + '_lastgames');
	var games = data.lastGame;
	for (var i = 0; i < games.length; i++) {
		var x = i + 1;		
		var sym = "";
		var device = ".";
		if (games[i].d == "Echo Show") device = ":";

		if (games[i].i == 'star') {sym = " &#9734;";}
		else if (games[i].i == 'sun') {sym = " &#9788;";}
		else if (games[i].i == 'note') {sym = " &#9834;";}
		else if (games[i].i == 'hash') {sym = " #";}

		if (!document.getElementById(prefix + '_lastgames_rank_' + x)) {			
			var row = container.insertRow(-1);
			row.id = prefix + '_lastgames_' + x;
			var cell1 = row.insertCell(0);
			cell1.id = prefix + "_lastgames_rank_" + x;
			var cell2 = row.insertCell(1);
			cell2.id = prefix + "_lastgames_score_" + x;
			var cell3 = row.insertCell(2);
			cell3.id = prefix + "_lastgames_games_" + x;
			var cell4 = row.insertCell(3);
			cell4.id = prefix + "_lastgames_avg_" + x;

			var cell5 = row.insertCell(4);
			cell5.id = prefix + "_lastgames_ts_" + x;
			cell5.className = "timeago";
			cell5.title = games[i].t/1000;

			var cell6 = row.insertCell(5);
			cell6.id = prefix + "_lastgames_st_" + x;
			cell6.className = "timeago";
			cell6.title = games[i].st/1000;

			var cell7 = row.insertCell(6);
			cell7.id = prefix + "_lastgames_locale_" + x;

			cell1.innerHTML = numberWithCommas(games[i].r) + sym;
			cell2.innerHTML = numberWithCommas(games[i].s);
			cell3.innerHTML = numberWithCommas(games[i].g);
			cell4.innerHTML = ((+games[i].s)/(+games[i].g)).toFixed(2);
			cell5.innerHTML = humanTime((games[i].t/1000)+"");
			cell6.innerHTML = humanTime((games[i].st/1000)+"");

			if (games[i].l) cell7.innerHTML =  "<span>"+device+"</span><img class='locale' src='./images/" + games[i].l + ".png' />";
			
		} else {		
			document.getElementById(prefix + '_lastgames_rank_' + x).innerHTML = numberWithCommas(games[i].r) + sym;
			document.getElementById(prefix + '_lastgames_score_' + x).innerHTML = numberWithCommas(games[i].s);
			document.getElementById(prefix + '_lastgames_games_' + x).innerHTML = numberWithCommas(games[i].g);
			document.getElementById(prefix + '_lastgames_avg_' + x).innerHTML = ((+games[i].s)/(+games[i].g)).toFixed(2);
			document.getElementById(prefix + '_lastgames_ts_' + x).title = games[i].t/1000;
			document.getElementById(prefix + '_lastgames_ts_' + x).innerHTML = humanTime((games[i].t/1000)+"");
			document.getElementById(prefix + '_lastgames_st_' + x).title = games[i].st/1000;
			document.getElementById(prefix + '_lastgames_st_' + x).innerHTML = humanTime((games[i].st/1000)+"");

			if (games[i].l) document.getElementById(prefix + '_lastgames_locale_' + x).innerHTML = "<span>"+device+"</span><img class='locale' src='./images/" + games[i].l + ".png' />";
		}

	}
	document.getElementById(prefix + '_lg_count').innerHTML = i;
	document.getElementById(prefix + '_more_count').innerHTML = i;
}

function buildPopcornLeague(data, prefix, total) {
	if(!data) return;
	var topTen = data.league;
	var container = document.getElementById(prefix + '_scores');
	for (var i = 0; i < topTen.length; i++) {
		var x = i + 1;		
		var sym = "";
		var device = ".";
		if (topTen[i].d == "Echo Show") device = ":";

		if (topTen[i].i == 'star') {sym = " &#9734;";}
		else if (topTen[i].i == 'sun') {sym = " &#9788;";}
		else if (topTen[i].i == 'note') {sym = " &#9834;";}
		else if (topTen[i].i == 'hash') {sym = " #";}

		if (!document.getElementById(prefix + '_league_' + x)) {
			var row = container.insertRow(-1);
			row.id = prefix + '_league_' + x;
			var cell1 = row.insertCell(0);
			cell1.id = prefix + "_league_rank_" + x;
			var cell2 = row.insertCell(1);
			cell2.id = prefix + "_league_score_" + x;
			var cell3 = row.insertCell(2);
			cell3.id = prefix + "_league_games_" + x;
			var cell4 = row.insertCell(3);
			cell4.id = prefix + "_league_avg_" + x;

			var cell5 = row.insertCell(4);
			cell5.id = prefix + "_league_ts_" + x;
			cell5.className = "timeago";
			cell5.title = topTen[i].t/1000;

			var cell6 = row.insertCell(5);
			cell6.id = prefix + "_league_st_" + x;
			cell6.className = "timeago";
			cell6.title = topTen[i].st/1000;

			var cell7 = row.insertCell(6);
			cell7.id = prefix + "_league_locale_" + x;

			cell1.innerHTML = numberWithCommas(x) + sym;
			cell2.innerHTML = numberWithCommas(topTen[i].s);
			cell3.innerHTML = numberWithCommas(topTen[i].g);
			cell4.innerHTML = ((+topTen[i].s)/(+topTen[i].g)).toFixed(2);
			cell5.innerHTML = humanTime((topTen[i].t/1000)+"");
			cell6.innerHTML = humanTime((topTen[i].st/1000)+"");

			if (topTen[i].l) cell7.innerHTML =  "<span>"+device+"</span><img class='locale' src='./images/" + topTen[i].l + ".png' />";
		} else {
			document.getElementById(prefix + '_league_rank_' + x).innerHTML = numberWithCommas(x) + sym;
			document.getElementById(prefix + '_league_score_' + x).innerHTML = numberWithCommas(topTen[i].s);
			document.getElementById(prefix + '_league_games_' + x).innerHTML = numberWithCommas(topTen[i].g);
			document.getElementById(prefix + '_league_avg_' + x).innerHTML = ((+topTen[i].s)/(+topTen[i].g)).toFixed(2);
			document.getElementById(prefix + '_league_ts_' + x).title = topTen[i].t/1000;
			document.getElementById(prefix + '_league_ts_' + x).innerHTML = humanTime((topTen[i].t/1000)+"");
			document.getElementById(prefix + '_league_st_' + x).title = topTen[i].st/1000;
			document.getElementById(prefix + '_league_st_' + x).innerHTML = humanTime((topTen[i].st/1000)+"");

			if (topTen[i].l) document.getElementById(prefix + '_league_locale_' + x).innerHTML =  "<span>"+device+"</span><img class='locale' src='./images/" + topTen[i].l + ".png' />";
		}
	}
	document.getElementById(prefix + '_count').innerHTML = i;
	document.getElementById(prefix + '_scores').setAttribute('total', total);
}

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

function httpGetAmazon(theUrl, callback){
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
				return callback();
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

	var arIds = ['pc_uk_stars', 'pc_us_stars', 'pc_de_stars', 'pc_in_stars', 'pc_ca_stars', 'pc_jp_stars', 'pc_au_stars'];
	var arClasses = ['a-star-0', 'a-star-0-5', 'a-star-1', 'a-star-1-5', 'a-star-2', 'a-star-2-5', 'a-star-3', 'a-star-3-5', 'a-star-4', 'a-star-4-5', 'a-star-5'];
	// console.log(data)

	for (var i = 0; i < arIds.length; i++) {
		var e = document.getElementById(arIds[i]);
		if (!e) continue;
		for (var j = 0; j < arClasses.length; j++) {
			e.classList.remove(arClasses[j]);
		}

		     if (i ===0) e.classList.add(getCssStar(data.uk.score));
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

function chtNewUsers(chart, d, l, total) {

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
			"data": _newUsers.uk,
			"fill":false,
			"borderColor":red,
			"backgroundColor":red,
			"lineTension":0.1,
			"type":"line",
			"pointRadius":2
		},{
			"label":"US",
			"data": _newUsers.us,
			"fill":false,
			"borderColor":blue,
			"backgroundColor":blue,
			"lineTension":0.1,
			"type":"line",
			"pointRadius":2
		},{
			"label":"Germany",
			"data": _newUsers.de,
			"fill":false,
			"borderColor":yellow,
			"backgroundColor":yellow,
			"lineTension":0.1,
			"type":"line",
			"pointRadius":2
		},{
			"label":"India",
			"data": _newUsers.in,
			"fill":false,
			"borderColor":orange,
			"backgroundColor":orange,
			"lineTension":0.1,
			"type":"line",
			"pointRadius":2
		},{
			"label":"Canada",
			"data": _newUsers.ca,
			"fill":false,
			"borderColor":purple,
			"backgroundColor":purple,
			"lineTension":0.1,
			"type":"line",
			"pointRadius":2
		},{
			"label":"Japan",
			"data": _newUsers.jp,
			"fill":false,
			"borderColor":green,
			"backgroundColor":green,
			"lineTension":0.1,
			"type":"line",
			"pointRadius":2
		},{
			"label":"Australia",
			"data": _newUsers.au,
			"fill":false,
			"borderColor":grey,
			"backgroundColor":grey,
			"lineTension":0.1,
			"type":"line",
			"pointRadius":2
		},{
			"label":"", //Weekends
			"data": _newUsers.we,
			"type": "bar",
			"borderWidth": 1,
			"backgroundColor":"rgba(238, 238, 238, 0.4)",
			"borderColor":"rgba(238, 238, 238, 0.4)"
		},{
			"label":"", //Months
			"data": _newUsers.mo,
			"type": "bar",
			"borderWidth": 1,
			"backgroundColor":"rgba(76, 245, 20, 1)"
		},{
			"label":"", //avg
			"data": _newUsers.avg,
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

var _newUsersChart = new Chart(document.getElementById("pc_cht_new_users").getContext('2d'), { type: 'bar' });
var _newUsers = {};
var _newUsersLabels = [];

function updateCharts(data, total) {
	if (!data) return;
	if (data.length === 0) return;

	// get days from launch as x axis
	var today = new Date();
	var diff = daydiff(startDate, today, true);

	if (Object.keys(_newUsers).length === 0) {
		_newUsers = data;
		_newUsersLabels = new Array(diff).fill("");

		for (var i = 1; i < diff-1; i++) {
			var someDate = addDays(startDate, i);
			var q = someDate.toLocaleDateString().split("/");
			_newUsersLabels[i] = q[0] + getMonthName(q[1]-1);
		}
		_newUsersLabels[0] = "Launch";
		_newUsersLabels[diff] = "Today";

	} else {
		if (diff > _newUsers.uk.length) resizeArr(_newUsers.uk, diff, null);
		if (diff > _newUsers.us.length) resizeArr(_newUsers.us, diff, null);
		if (diff > _newUsers.de.length) resizeArr(_newUsers.de, diff, null);
		if (diff > _newUsers.in.length) resizeArr(_newUsers.in, diff, null);
		if (diff > _newUsers.ca.length) resizeArr(_newUsers.ca, diff, null);
		if (diff > _newUsers.jp.length) resizeArr(_newUsers.jp, diff, null);
		if (diff > _newUsers.au.length) resizeArr(_newUsers.au, diff, null);
		if (diff > _newUsers.avg.length)resizeArr(_newUsers.avg,diff, null);
		if (diff > _newUsers.we.length) resizeArr(_newUsers.we, diff, null);
		if (diff > _newUsers.mo.length) resizeArr(_newUsers.mo, diff, null);
		if (diff > _newUsers.totals.length) resizeArr(_newUsers.totals, diff, 0);
	}
	
	for (var i = 0; i < data.totals.length; i++) {
		if (data.avg[i] != _newUsers.avg[i]) _newUsers.avg[i] += data.avg[i];
		if (data.we[i] != _newUsers.we[i]) _newUsers.we[i] += data.we[i];
		if (data.mo[i] != _newUsers.mo[i]) _newUsers.mo[i] += data.mo[i];
		if (data.totals[i] != _newUsers.totals[i]) _newUsers.totals[i] += data.totals[i];
	}

	for (var i = 0; i < data.totals.length; i++) {
		if (data.uk[i] != _newUsers.uk[i]) {
			if (!_newUsers.uk[i]) _newUsers.uk[i] = 0;
			_newUsers.uk[i] += data.uk[i];
		}
		if (data.us[i] != _newUsers.us[i]) {
			if (!_newUsers.us[i]) _newUsers.us[i] = 0;
			_newUsers.us[i] += data.us[i];
		}
		if (data.de[i] != _newUsers.de[i]) {
			if (!_newUsers.de[i]) _newUsers.de[i] = 0;
			_newUsers.de[i] += data.de[i];
		}
		if (data.in[i] != _newUsers.in[i]) {
			if (!_newUsers.in[i]) _newUsers.in[i] = 0;
			_newUsers.in[i] += data.in[i];
		}
		if (data.ca[i] != _newUsers.ca[i]) {
			if (!_newUsers.ca[i]) _newUsers.ca[i] = 0;
			_newUsers.ca[i] += data.ca[i];
		}
		if (data.jp[i] != _newUsers.jp[i]) {
			if (!_newUsers.jp[i]) _newUsers.jp[i] = 0;
			_newUsers.jp[i] += data.jp[i];
		}
		if (data.au[i] != _newUsers.au[i]) {
			if (!_newUsers.au[i]) _newUsers.au[i] = 0;
			_newUsers.au[i] += data.au[i];
		}
	}

	document.getElementById('pc_total_today').innerHTML = numberWithCommas(_newUsers.totals[_newUsers.totals.length-1]);
	var t = 1;  // include myself
	_newUsers.avg[0] = _newUsers.totals[0];
	for (var i = 0; i < diff; i++) {
		t += _newUsers.totals[i];
		_newUsers.avg[i] = t/(i+1);
	}

	chtNewUsers(_newUsersChart, _newUsers, _newUsersLabels, total);
}

function resetLimit() {
	var newUrl = paramReplace('limit', window.location.href, 10);
	// var newUrl2 = paramReplace('pc_league', newUrl, null);
	if (newUrl.indexOf('#pc_league') === -1) { 
		newUrl = newUrl + '#pc_league';
	}
	// console.log(newUrl);
	window.location.href = newUrl;	
}

function increaseLimit() {
	c = c*2;
	var newUrl = paramReplace('limit', window.location.href, c);
	// var newUrl2 = paramReplace('pc_league', newUrl, null);
	if (newUrl.indexOf('#pc_league') === -1) { 
		newUrl = newUrl + '#pc_league';
	}
	// console.log(newUrl);
	window.location.href = newUrl;	
}

// Update the appropriate href query string parameter
function paramReplace(param, url, value) {
	// console.log(param, url, value);

	var inline = "";
	if (url.indexOf("#") > -1) {
		inline = "#" + url.split("#")[1];
		url =  url.split("#")[0];
	}

	if (url.indexOf(param) === -1) {
		if (url.indexOf("?") === -1) {
			return url + "?" + param + "=" + value;
		}
		return url + "&" + param + "="+value;
	}
  // Find the param with regex
  // Grab the first character in the returned string (should be ? or &)
  // Replace our href string with our new value, passing on the name and delimiter
  var re = new RegExp("[\\?&#]" + param + "=([^&#]*)");
  var pos = re.exec(url);
  var delimiter = pos[0].charAt(0);

  if (!value || value === null) return url.replace(re, delimiter + param);
  var newString = url.replace(re, delimiter + param + "=" + value);
 
  return newString + inline;
}
