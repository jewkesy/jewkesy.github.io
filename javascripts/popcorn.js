(function(){
    "use strict";
})();

var _locale = '';
var _limit = 10;

var _popcornUrl = aws + 'getHomePageContent?action=getstats&prefix=pc&limit=' + _limit;
var _popcornLastGameUrl = aws + 'getHomePageContent?last=true&prefix=pc&limit=' + _limit;
var _amazonUrl = aws + 'getHomePageContent?amazon=true';

var _startDate = new Date("28 May 2017");
var _timeFrom = 0;
var _lastTimestamp = 0;
var _doubleDayDivider = 1;
var _daysSinceLaunch = 0;
var _newUsersChart;
var _newUsers = {};
var _newUsersLabels = [];
var _gameinfo = { dailygames: [] };
var _chtHeight = 2500;

Chart.defaults.bar.scales.xAxes[0].categoryPercentage = 1;
Chart.defaults.bar.scales.xAxes[0].barPercentage = 1;
Chart.defaults.bar.scales.xAxes[0].gridLines={color:"rgba(0, 0, 0, 0)"};

function startPopcornQuiz() {
	_locale = getParameterByName('locale') || '';
	_limit = getParameterByName('limit') || 10;
	document.getElementById('pc_more_count').innerHTML = _limit;
	_newUsersChart = new Chart(document.getElementById("pc_cht_new_users").getContext('2d'), { type: 'bar' });

	if (_locale != '') {
		applyLocaleHeader(_locale);
		_popcornUrl += "&locale=" + _locale;
	}

	httpGetAmazon(_amazonUrl, function (err, data) {
		checkNewDay();
		getEvent();
		getMyRank();
		setInterval(function () {
			checkNewDay();
			httpGetAmazon(_amazonUrl, function (err, data) {});
			getEvent();
			getMyRank();
		}, 60000);
	});

	httpGetStats(aws + "getHomePageContent?league=true&prefix=pc&limit=" + _limit + "&locale=" + _locale, 'pc',  function (err, data) {
		buildPopcornLeague(data, 'pc');
	});
	httpGetStats(aws + "getHomePageContent?lastgames=true&prefix=pc&limit=" + _limit + "&locale=" + _locale, 'pc',  function (err, data) {
		buildPopcornLastGames(data, 'pc');
	});
	httpGetByUrl(aws + "getHomePageContent?getdailygames=true&prefix=pc&limit=0&locale=" + _locale + "&timefrom=" + _timeFrom, function (err, data) {
		buildDailyGames(err, data);
	});
	httpGetStats(aws + "getHomePageContent?newusers=true&prefix=pc&limit=" + _limit + "&locale=" + _locale + "&timefrom=" + _timeFrom, 'pc', function (err, data) {
		if (!data) return;
		_timeFrom = data.lastTime;
		// console.log(data);
		if (!err) buildPopcornPage(data);
		setInterval(function () {
			httpGetLastPlay(_popcornLastGameUrl, 'pc', function (err, data) {
				if (!err) {
					if (!data || !data[0]) return;
					if (_lastTimestamp < data[0].timestamp) {
						_lastTimestamp = data[0].timestamp;
						httpGetStats(aws + "getHomePageContent?league=true&prefix=pc&limit=" + _limit + "&locale=" + _locale, 'pc',  function (err, data) {
							buildPopcornLeague(data, 'pc');
						});
						httpGetStats(aws + "getHomePageContent?lastgames=true&prefix=pc&limit=" + _limit + "&locale=" + _locale, 'pc',  function (err, data) {
							buildPopcornLastGames(data, 'pc');
						});
						httpGetStats(aws + "getHomePageContent?newusers=true&prefix=pc&limit=" + _limit + "&locale=" + _locale + "&timefrom=" + _timeFrom, 'pc', function (err, data) {
							if (!data) return;
							// console.log(data);
							_timeFrom = data.lastTime;
							if (!err) buildPopcornPage(data);
						});
						httpGetByUrl(aws + "getHomePageContent?getdailygames=true&prefix=pc&limit=0&locale=" + _locale + "&timefrom=" + _timeFrom, function (err, data) {
							buildDailyGames(err, data);
						});
					}
				} 
			});
		}, 5000);
	});
}

function reset() {
	var today = new Date();
	var diff =  daydiff(_startDate, today, true);
	_newUsers = {};
	_newUsersLabels = [];
	_gameinfo = {
		dailygames: []
	};
	_daysSinceLaunch = diff;
	_timeFrom = 0;
}

function checkNewDay() { //if new day, rebuild saved stats
	var today = new Date();
	var diff =  daydiff(_startDate, today, true);
	if (_daysSinceLaunch > 0 && _daysSinceLaunch != diff) reset();
}

function getMyRank() {
	httpGetStats(aws + "getHomePageContent?getmyrank=true&prefix=pc&limit=" + _limit + "&locale=" + _locale, 'pc',  function (err, data) {
		// console.log(err, data);
		fadeyStuff('myrank', data.msg)
	});
}

function applyLocaleHeader(locale) {
	var elements = document.getElementsByClassName('selected');
	for(var i=0, l=elements.length; i<l; i++){
	 elements[i].classList.remove("selected");
	}
	
	document.getElementById("th_"+_locale).classList.add('selected');
}

function buildDailyGames(err, content) {
	if (err) {console.error(err); return;}
	if (!content) {console.log('no data'); return;}
	// console.log(content)
	_gameinfo.dailygames = content.dailygames;
	fadeyStuff("pc_games_today", numberWithCommas(content.dailygames[content.dailygames.length-1]));

	var total = 0;
	var days = 0;
	for (var i = 0; i < content.dailygames.length; i++) {
		if (!content.dailygames[i]) continue;
		// console.log(content.dailygames[i]);
		total += content.dailygames[i];
		days++;
	}
	// console.log(days, total)
	var avg = Math.round(total/days);
	fadeyStuff('pc_games_avg', numberWithCommas(avg));
}

function buildGamePlayStats(content) {
	console.log(content);
	return;
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
		if (i > 0) {
			dots[i].games = dots[i].games - dots[i-1].games;
			dots[i].hourly = dots[i].games/24;
		} else if (i === 0) dots[i].games = 0;
	}

	var todayCount = Math.floor(dots[dots.length-1].games/_doubleDayDivider);

	fadeyStuff("pc_games_today", numberWithCommas(todayCount));
}

function buildPopcornPage(content) {
	fadeyStuff("pc_ts", moment().format("MMM Do, HH:mm:ss"));

	if (!content) return;
	if (content.count === 0) return;
	updateCharts(content.counts, content.totalUsers);
}

function fadeyStuff(id, val) {
	if (!val) return;
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
		} else {	
			document.getElementById(prefix + '_lastgames_ts_' + x).title = games[i].t/1000;
			document.getElementById(prefix + '_lastgames_st_' + x).title = games[i].st/1000;
		}
		fadeyStuff(prefix + "_lastgames_rank_" + x, numberWithCommas(games[i].r) + sym);
		fadeyStuff(prefix + "_lastgames_score_" + x, numberWithCommas(games[i].s));
		fadeyStuff(prefix + "_lastgames_games_" + x, numberWithCommas(games[i].g));
		fadeyStuff(prefix + "_lastgames_avg_" + x, numberWithCommas(((+games[i].s)/(+games[i].g)).toFixed(2)));
		fadeyStuff(prefix + "_lastgames_ts_" + x, humanTime((games[i].t/1000)+""));
		fadeyStuff(prefix + "_lastgames_st_" + x, humanTime((games[i].st/1000)+""));
		if (games[i].l) fadeyStuff(prefix + "_lastgames_locale_" + x, "<span>"+device+"</span><img class='locale' src='./images/" + games[i].l + ".png' />");
	}
	fadeyStuff(prefix + '_lg_count', numberWithCommas(i));
	fadeyStuff(prefix + '_more_count', numberWithCommas(i));
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
		} else {
			document.getElementById(prefix + '_league_ts_' + x).title = topTen[i].t/1000;
			document.getElementById(prefix + '_league_st_' + x).title = topTen[i].st/1000;
		}

		fadeyStuff(prefix + "_league_rank_" + x, numberWithCommas(x) + sym);
		fadeyStuff(prefix + "_league_score_" + x, numberWithCommas(topTen[i].s));
		fadeyStuff(prefix + "_league_games_" + x, numberWithCommas(topTen[i].g));
		fadeyStuff(prefix + "_league_avg_" + x, numberWithCommas(((+topTen[i].s)/(+topTen[i].g)).toFixed(2)));
		fadeyStuff(prefix + "_league_ts_" + x, humanTime((topTen[i].t/1000)+""));
		fadeyStuff(prefix + "_league_st_" + x, humanTime((topTen[i].st/1000)+""));
		if (topTen[i].l) fadeyStuff(prefix + "_league_locale_" + x, "<span>"+device+"</span><img class='locale' src='./images/" + topTen[i].l + ".png' />");
	}
	fadeyStuff(prefix + '_count', numberWithCommas(i));
	document.getElementById(prefix + '_scores').setAttribute('total', total);
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
	if (!data.fr) data.fr = {score:0,reviews:0};

	var arIds = ['pc_uk_stars', 'pc_us_stars', 'pc_de_stars', 'pc_in_stars', 'pc_ca_stars', 'pc_jp_stars', 'pc_au_stars', 'pc_fr_stars'];
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
		else if (i == 7) e.classList.add(getCssStar(data.fr.score));
	}

	if (document.getElementById('pc_uk_reviews')) fadeyStuff('pc_uk_reviews', numberWithCommas(data.uk.reviews)); //document.getElementById('pc_uk_reviews').innerHTML = data.uk.reviews;
	if (document.getElementById('pc_us_reviews')) fadeyStuff('pc_us_reviews', numberWithCommas(data.us.reviews)); //document.getElementById('pc_us_reviews').innerHTML = data.us.reviews;
	if (document.getElementById('pc_de_reviews')) fadeyStuff('pc_de_reviews', numberWithCommas(data.de.reviews)); //document.getElementById('pc_de_reviews').innerHTML = data.de.reviews;
	if (document.getElementById('pc_in_reviews')) fadeyStuff('pc_in_reviews', numberWithCommas(data.in.reviews)); //document.getElementById('pc_in_reviews').innerHTML = data.in.reviews;
	if (document.getElementById('pc_ca_reviews')) fadeyStuff('pc_ca_reviews', numberWithCommas(data.ca.reviews)); //document.getElementById('pc_ca_reviews').innerHTML = data.ca.reviews;
	if (document.getElementById('pc_jp_reviews')) fadeyStuff('pc_jp_reviews', numberWithCommas(data.jp.reviews)); //document.getElementById('pc_jp_reviews').innerHTML = data.jp.reviews;
	if (document.getElementById('pc_au_reviews')) fadeyStuff('pc_au_reviews', numberWithCommas(data.au.reviews)); //document.getElementById('pc_au_reviews').innerHTML = data.au.reviews;
	if (document.getElementById('pc_fr_reviews')) fadeyStuff('pc_fr_reviews', numberWithCommas(data.fr.reviews)); //document.getElementById('pc_fr_reviews').innerHTML = data.fr.reviews;
}

function chtNewUsers(chart, d, l, total) {

	var dailyData = JSON.parse(JSON.stringify(d));
	dailyData.dailygames = JSON.parse(JSON.stringify(_gameinfo.dailygames));
	dailyData.labels = JSON.parse(JSON.stringify(l));
	// console.log(dailyData.mo)
	dailyData = summariseChtData(dailyData);
	// console.log(dailyData.mo)
	var red =    "rgba(255,99,132,1)";
	var blue =   "rgba(54,162,235,1)";
	var yellow = "rgba(255,206,86,1)";
	var orange = "rgba(247,152,57,1)";
	var purple = "rgba(195,144,212,1)";
	var green =  "rgba(22,158,22,1)";
	var grey =   "rgba(168,173,168,1)";
	var brown =  "rgba(204,102,0,1)";

	var data = {
		"labels": dailyData.labels,
		"datasets":[{
			"label":"UK", "data": dailyData.uk,
			"borderColor":red, "backgroundColor":red, "fill":false, "lineTension":0.1, "type":"line", "pointRadius":2
		},{
			"label":"US", "data": dailyData.us,
			"borderColor":blue, "backgroundColor":blue, "fill":false, "lineTension":0.1, "type":"line", "pointRadius":2
		},{
			"label":"Germany", "data": dailyData.de,
			"borderColor":yellow, "backgroundColor":yellow, "fill":false, "lineTension":0.1, "type":"line", "pointRadius":2
		},{
			"label":"India", "data": dailyData.in,
			"borderColor":orange, "backgroundColor":orange, "fill":false, "lineTension":0.1, "type":"line", "pointRadius":2
		},{
			"label":"Canada", "data": dailyData.ca,
			"borderColor":purple, "backgroundColor":purple, "fill":false, "lineTension":0.1, "type":"line", "pointRadius":2
		},{
			"label":"Japan", "data": dailyData.jp,
			"borderColor":green, "backgroundColor":green, "fill":false, "lineTension":0.1, "type":"line", "pointRadius":2
		},{
			"label":"Australia", "data": dailyData.au,
			"borderColor":grey, "backgroundColor":grey, "fill":false, "lineTension":0.1, "type":"line", "pointRadius":2
		},{
			"label":"France", "data": dailyData.fr,
			"borderColor":brown, "backgroundColor":brown, "fill":false, "lineTension":0.1, "type":"line", "pointRadius":2
		},{
			"label":"Games",
			"data": dailyData.dailygames,
			"type": "bar", "borderWidth": 1,
			"backgroundColor":"rgba(76, 245, 20, 0.4)", "borderColor":"rgba(76, 245, 20, 0.4)"
		},{
			"label":"", //Weekends
			"data": dailyData.we,
			"type": "bar", "borderWidth": 1,
			"backgroundColor":"rgba(238, 238, 238, 0.4)", "borderColor":"rgba(238, 238, 238, 0.4)"
		},{
			"label":"", //Months
			"data": dailyData.mo,
			"type": "bar", "borderWidth": 1,
			"backgroundColor":"rgba(255, 102, 255, 0.4)", "borderColor":"rgba(255, 102, 255, 0.4)"
		},{
			"label":"", //avg
			"data": dailyData.avg, "type": "line", "fill":false,
			"borderColor":"rgba(0, 0, 0, 1)", "backgroundColor":"rgba(0, 0, 0, 1)", "pointRadius":0
		}],
		options: {
			"responsive": true,
			"maintainAspectRatio": false
		}
    };
	chart.data = data;
	chart.update();

	// console.log(chart.scales)
	// var axis = chart.scales.<scale id>;
	// var max = axis.max;
	// var min = axis.min;
	var axis = chart.scales.y-axis-0;
	_chtHeight = axis.max;
}

function updateCharts(data, total) {
	if (!data) return;
	if (data.length === 0) return;

	// get days from launch as x axis
	var today = new Date();
	var diff = daydiff(_startDate, today, true);

	if (Object.keys(_newUsers).length === 0) {
		_newUsers = data;
		_newUsersLabels = new Array(diff).fill("");

		for (var i = 1; i < diff-1; i++) {
			var someDate = addDays(_startDate, i);
			var q = someDate.toLocaleDateString().split("/");
			_newUsersLabels[i] = q[0] + getMonthName(q[1]-1);
		}
		_newUsersLabels[0] = "Launch";
		_newUsersLabels[diff-1] = "Today";

	} else {
		if (diff > _newUsers.uk.length) resizeArr(_newUsers.uk, diff, null);
		if (diff > _newUsers.us.length) resizeArr(_newUsers.us, diff, null);
		if (diff > _newUsers.de.length) resizeArr(_newUsers.de, diff, null);
		if (diff > _newUsers.in.length) resizeArr(_newUsers.in, diff, null);
		if (diff > _newUsers.ca.length) resizeArr(_newUsers.ca, diff, null);
		if (diff > _newUsers.jp.length) resizeArr(_newUsers.jp, diff, null);
		if (diff > _newUsers.au.length) resizeArr(_newUsers.au, diff, null);
		if (diff > _newUsers.fr.length) resizeArr(_newUsers.fr, diff, null);
		if (diff > _newUsers.avg.length)resizeArr(_newUsers.avg,diff, null);
		if (diff > _newUsers.we.length) resizeArr(_newUsers.we, diff, null);
		if (diff > _newUsers.mo.length) resizeArr(_newUsers.mo, diff, null);
		if (diff > _newUsers.totals.length) resizeArr(_newUsers.totals, diff, 0);
	}
	
	for (var i = 0; i < data.totals.length; i++) {
		if (data.avg[i] != _newUsers.avg[i]) _newUsers.avg[i] += data.avg[i];
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
		if (data.fr[i] != _newUsers.fr[i]) {
			if (!_newUsers.fr[i]) _newUsers.fr[i] = 0;
			_newUsers.fr[i] += data.fr[i];
		}
	}
	fadeyStuff('pc_total_today', numberWithCommas(_newUsers.totals[_newUsers.totals.length-1]));
	
	var t = 1;  // include myself
	_newUsers.avg[0] = _newUsers.totals[0];
	for (var i = 0; i < diff; i++) {
		t += _newUsers.totals[i];
		_newUsers.avg[i] = t/(i+1);
	}

	fadeyStuff('pc_total_avg', numberWithCommas(Math.round(_newUsers.avg[_newUsers.avg.length-1])));
	chtNewUsers(_newUsersChart, _newUsers, _newUsersLabels, total);
}

function resetLimit() {
	var newUrl = paramReplace('limit', window.location.href, 10);
	if (newUrl.indexOf('#pc_league') === -1) newUrl = newUrl + '#pc_league';

	window.location.href = newUrl;	
}

function increaseLimit() {
	_limit = _limit * 2;
	var newUrl = paramReplace('limit', window.location.href, _limit);
	if (newUrl.indexOf('#pc_league') === -1) newUrl = newUrl + '#pc_league';

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

function getEvent() {

    var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

    var eventDate = new Date("7 Feb 2018");
    var todayDate = new Date();

    todayDate.setHours(0,0,0,0);

    var dateArray = [];
    while (eventDate < todayDate) {
        dateArray.push(new Date (eventDate));
        eventDate = addDays(eventDate,3);
    }
    dateArray.push(new Date (eventDate));
 
    var eD = eventDate.getTime();
    var tD = todayDate.getTime();

    var retVal = {
      name: "default", extraGameCount: 0, multiplier: 1,
      today: false,
      tomorrow: false,
      next: eventDate,
      day: days[eventDate.getDay()]
    };

    if (eD == tD) {
      retVal.name = "doublepoints";
      retVal.extraGameCount = 1;
      retVal.multiplier = 2;
      retVal.today = true;
      retVal.msg = "Today is a double points day!";
      _doubleDayDivider = 2;
    } else if (eD > tD) {
      _doubleDayDivider = 1;
      if (eD-tD == 86400000) {
        retVal.tomorrow = true;
        retVal.msg = "Tomorrow is a double points day!";
      } else {
        retVal.msg = "The next double point event is on " + retVal.day + ". ";
      }
    }
    fadeyStuff("pc_event", retVal.msg);
}

function summariseChtData(data, fraction) {
	if (!fraction) fraction = 1.2;  // lower = more recent; 100 = full, 1.2 = half
	var newSize = 10;

	// check all same length;
	var initialLabel = data.labels[0];
	var l = -1;
	for (var property in data) {
	    if (data.hasOwnProperty(property)) {
	    	if (l == -1) { l = data[property].length; continue; }
	    	if (data[property].length != l) { console.log("Length mismatch, resetting", l, data[property].length, property); reset(); return data; }
	    }
	}
	
	var trunc_length = Math.ceil(l / fraction);
	var leftSide = {};
	
	for (var property in data) {
	    if (data.hasOwnProperty(property)) {
	    	leftSide[property] = data[property].splice(0, trunc_length);
	    }
	}

	for (var property in leftSide) {
	    if (leftSide.hasOwnProperty(property)) {
	    	if (property == 'labels') {
	    		leftSide[property] = [];
	    		resizeArr(leftSide[property], newSize, "");
	    		leftSide[property][0] = initialLabel;
	    		var mid = Math.round(leftSide[property].length/2);
	    		leftSide[property][mid] = trunc_length + " days avg";
	    	} else if (property == 'we' || property == 'mo') {
	    		leftSide[property] = [];
	    		resizeArr(leftSide[property], newSize, null);
	    	} else {
	    		leftSide[property] = reduceArr(leftSide[property], newSize);
	    	}
	    }
	}

	// merge new left side
	for (var property in leftSide) {
	    if (leftSide.hasOwnProperty(property)) {
	    	leftSide[property] = leftSide[property].concat(data[property]);
	    }
	}

	return leftSide;
}

function reduceArr(arr, count) {

	var slots = Math.ceil(arr.length/count);
	var chk = chunkArray(arr, slots);
	var retVal = [];

	for (var i = 0; i < chk.length; i++) {
		var x = chk[i].reduce(function(acc, val) { return acc + val; });
		if (x == 0) x = null;
		else x = Math.round(x/slots);
		retVal.push(x);
	}

	return retVal;
}

function chunkArray(myArray, chunk_size){
    var index = 0;
    var arrayLength = myArray.length;
    var tempArray = [];
    
    for (index = 0; index < arrayLength; index += chunk_size) {
        var myChunk = myArray.slice(index, index+chunk_size);
        // Do something if you want with the group
        tempArray.push(myChunk);
    }

    return tempArray;
}
