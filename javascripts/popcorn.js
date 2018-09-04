(function(){
    "use strict";
})();

var _locale = '';
var _device = 'ga_aa';
var _deviceFilter = '';
var _limit = 10;
var _keywords;

var _popcornUrl = aws + 'getHomePageContent?action=getstats&prefix=pc&limit=' + _limit;
var _popcornLastGameUrl = aws + 'getHomePageContent?last=true&prefix=pc&limit=' + _limit;
var _amazonUrl = aws + 'getHomePageContent?amazon=true';

var _startDate = new Date("2017-05-28T12:00:00Z");
var _timeFrom = 0;
var _lastTimestamp = 0;
var _doubleDayDivider = 1;
var _daysSinceLaunch = 0;
var _newUsersChart = new Chart(document.getElementById("pc_cht_new_users").getContext('2d'), { type: 'bar' });
var _newUsers = {};
var _newUsersLabels = [];
var _total = 0;
var _gameinfo = { dailygames: [] };
var _chtHeight = 3500;
var _dailyPlayers = [];

var _correctPhrases = ["Correct!"];
var _incorrectPhrases = ["Incorrect!"];

if (document.getElementById('captionYear')) document.getElementById('captionYear').innerHTML = new Date().getFullYear();

Chart.defaults.bar.scales.xAxes[0].categoryPercentage = 1;
Chart.defaults.bar.scales.xAxes[0].barPercentage = 1;
Chart.defaults.bar.scales.xAxes[0].gridLines={color:"rgba(0, 0, 0, 0)"};

var aInt;
var sInt;

window.addEventListener('popstate', function (event) {
	console.log(history.state);
    if (history.state && history.state.id === 'homepage') {
    	_locale = history.state.locale;
    	_device = history.state.device;
    	_limit = history.state.limit;
    	startPopcornQuiz();
        // Render new content for the hompage
    }
}, false);


function getFlag(locale) {
	return locale;
}

function changeUrl(title, url) {
	if (typeof (history.pushState) == "undefined") return;
	
	var obj = { id: 'homepage', pageTitle: title, Url: url, locale: _locale, device: _device, limit: _limit };
	history.pushState(obj, obj.Page, obj.Url);
	// console.log(history.state)
}

function startPopcornQuiz() {
	_locale = getParameterByName('locale') || '';
	_limit = getParameterByName('limit') || 10;
	// console.log(_limit, getParameterByName('limit'))
	document.getElementById('pc_more_count').innerHTML = _limit;

	if (_locale != '') {
		applyLocaleHeader(_locale, _device);
		_popcornUrl += "&locale=" + _locale;
	}
	buildLeague();
	buildLastGames();
	getKeywords();
	getPhrases();
	getIntro();
	getEvent();
	checkNewDay();
	getMyRank();
	httpGetAmazon(_amazonUrl, function (err, data) {
		amazonTimer();
	});


	
	httpGetByUrl(aws + "getHomePageContent?getdailyplayers=true&prefix=pc&limit=0&locale=" + _locale + "&timefrom=" + _timeFrom + _deviceFilter, function (err, data) {
		buildDailyPlayers(err, data);
	});
	httpGetByUrl(aws + "getHomePageContent?getdailygames=true&prefix=pc&limit=0&locale=" + _locale + "&timefrom=" + _timeFrom + _deviceFilter, function (err, data) {
		buildDailyGames(err, data);
	});
	httpGetStats(aws + "getHomePageContent?newusers=true&prefix=pc&limit=" + _limit + "&locale=" + _locale + "&timefrom=" + _timeFrom + _deviceFilter, 'pc', function (err, data) {
		if (!data) return;
		_timeFrom = data.lastTime;
		if (!err) buildPopcornPage(data);
		statsTimer();
	});
}

function amazonTimer() {
	aInt = setInterval(function () {
		getIntro();
		getEvent();
		checkNewDay();
		getMyRank();
		httpGetAmazon(_amazonUrl, function (err, data) {});
	}, 60000);
}

var _runStats = true;
function statsTimer() {
	sInt = setInterval(function () {
		if (_runStats) getStats();
	}, 2500);
}

function getStats() {
	_runStats = false;
	document.getElementById('pc_more_count').innerHTML = _limit;
	httpGetLastPlay(_popcornLastGameUrl, 'pc', function (err, data) {
		if (!err) {
			if (!data || !data[0]){ _runStats = true; return; }
			if (_lastTimestamp < data[0].timestamp) {
				_lastTimestamp = data[0].timestamp;
				getEverything();
				_runStats = true;
			} else { _runStats = true; }
		}  else { _runStats = true; }
	});
}


function getEverything() {
	buildLeague();
	buildLastGames();
	httpGetStats(aws + "getHomePageContent?newusers=true&prefix=pc&limit=" + _limit + "&locale=" + _locale + "&timefrom=" + _timeFrom + _deviceFilter, 'pc', function (err, data) {
		if (!data) return;
		// console.log(data);
		_timeFrom = data.lastTime;
		if (!err) buildPopcornPage(data);
	});			
	httpGetByUrl(aws + "getHomePageContent?getdailygames=true&prefix=pc&limit=0&locale=" + _locale + "&timefrom=" + _timeFrom + _deviceFilter, function (err, data) {
		buildDailyGames(err, data);
	});
	httpGetByUrl(aws + "getHomePageContent?getdailyplayers=true&prefix=pc&limit=0&locale=" + _locale + "&timefrom=" + _timeFrom + _deviceFilter, function (err, data) {
		buildDailyPlayers(err, data);
	});
}

function buildLeague() {
	httpGetStats(aws + "getHomePageContent?league=true&prefix=pc&limit=" + _limit + "&locale=" + _locale + _deviceFilter, 'pc',  function (err, data) {
		buildPopcornLeague(data, 'pc');
	});
}

function buildLastGames() {
	httpGetStats(aws + "getHomePageContent?lastgames=true&prefix=pc&limit=" + _limit + "&locale=" + _locale + _deviceFilter, 'pc',  function (err, data) {
		buildPopcornLastGames(data, 'pc');
	});
}

function switchLocale(locale) {
	_locale = locale;
	getKeywords();
	applyLocaleHeader(locale, _device);
	getPhrases();
	getQuestions(5, "");
	document.getElementById('pc_truefalse').setAttribute('style', 'display:none;');
	
	setGameElements(locale);
	
	clearInterval(sInt);
	statsTimer();
	
	clearLeague('pc_scores', null); // buildLeague()
	clearLeague('pc_lastgames', null); // buildLastGames()
	getEverything();
}

function switchDevice(device) {
	if (!device) device = "ga_aa";

	if (device == 'Google') {
		_device = 'ga';
		_deviceFilter = "&device=Google";
	} else if (device == 'Echo') {
		_device = 'aa';
		_deviceFilter = "&device=Echo";
	} else {
		_device = 'ga_aa';
		_deviceFilter = "";
	}

	var elements = document.getElementsByClassName('devicelist');
	for(var i=0, l=elements.length; i<l; i++){
	 elements[i].classList.remove("selected");
	}

	document.getElementById("th_"+_device).classList.add('selected');

	clearLeague('pc_scores', null); // buildLeague()
	clearLeague('pc_lastgames', null); // buildLastGames()
	getEverything();
	setGameElements(_locale);
}

function setGameElements(locale) {

	var l = locale.split('-')[0];
	
	fadeyStuff("pc_pq_name", "Popcorn Quiz");
	fadeyStuff("pc_h1_name", "Popcorn Quiz");

	var wakeWord = "Alexa";
	var playWord = ", play"

	if (_device == 'ga') {
		document.getElementById("linkToPQ").href="https://assistant.google.com/services/a/uid/000000b88782db03?hl=en-GB";
		document.getElementById("deviceLogo").src="/images/google.png";
		wakeWord = "Ok Google";
		if (l == "de") playWord = ", ";
		else if (l == "fr") playWord = ", "; 
		else if (l == "ja") playWord = ", ";
		else if (l == "es") playWord = ", ";
		else if (l == "it") playWord = ", ";
		else playWord = ", talk to";
	} else {
		document.getElementById("linkToPQ").href="https://www.amazon.co.uk/dp/B0719TQV6W";
		document.getElementById("deviceLogo").src="/images/alexa.png";
	}

	if (l == "de") {
	 	fadeyStuff("pc_wake_start", wakeWord + ", spiel"); 
	} else if (l == "fr") { 
		fadeyStuff("pc_wake_start", wakeWord + ", lance"); 
	} else if (l == "ja") { 
		fadeyStuff("pc_wake_start", "アレクサ、ポップコーンクイズ"); 
		fadeyStuff("pc_pq_name", "を始める");
		fadeyStuff("pc_h1_name", "ポップコーンクイズ");
	} else if (l == "es") { 
		fadeyStuff("pc_wake_start", wakeWord + ", jugar"); 
	} else if (l == "it") { 
		fadeyStuff("pc_wake_start", wakeWord + ", gioca con"); 
	} else { 
		fadeyStuff("pc_wake_start", wakeWord + playWord); 
	}
}

function clearLeague(id, callback) {
	$("#" + id).html("");
	return callback;
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

function getPhrases() {
	var l = _locale;
	if (l == '') l = 'en-GB';
	var url = aws + "getHomePageContent?action=getphrases&locale="+l;
	httpGetStats(url, 'pc',  function (err, data) {
		if (!data) return;
		// console.log(data)
		for (var i = 0; i < data.msg.correct.length; i++) {
			data.msg.correct[i] = data.msg.correct[i].replace('<say-as interpret-as="interjection">', '');
			data.msg.correct[i] = data.msg.correct[i].replace('</say-as>', '');
			data.msg.correct[i] = capitalizeFirstLetter(data.msg.correct[i]);
		}
		_correctPhrases = data.msg.correct;

		for (var i = 0; i < data.msg.incorrect.length; i++) {
			data.msg.incorrect[i] = data.msg.incorrect[i].replace('<say-as interpret-as="interjection">', '');
			data.msg.incorrect[i] = data.msg.incorrect[i].replace('</say-as>', '');
			data.msg.incorrect[i] = capitalizeFirstLetter(data.msg.incorrect[i]);
		}
		_incorrectPhrases = data.msg.incorrect;
	});
}

function getMyRank() {
	httpGetStats(aws + "getHomePageContent?getmyrank=true&prefix=pc&limit=" + _limit + "&locale=" + _locale, 'pc',  function (err, data) {
		if (!data) return;
		fadeyStuff('myrank', data.msg);
	});
}

function applyLocaleHeader(locale, device) {
	var elements = document.getElementsByClassName('selected');
	for(var i = 1; i < elements.length; i++){
		elements[i].classList.remove("selected");
	}
	
	document.getElementById("th_"+device).classList.add('selected');
	document.getElementById("th_"+locale).classList.add('selected');
}

function buildDailyPlayers(err, players) {
	if (err) {console.error(err); return;}
	if (!players) {console.log('no data'); return;}

	_dailyPlayers = players.dailyplayers;

	var total = _dailyPlayers[_dailyPlayers.length-1];

	fadeyStuff('pc_daily_players', numberWithCommas(total));
	chtNewUsers(_newUsersChart, _newUsers, _newUsersLabels, _total);
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
	
	var avg = Math.round(total/days);
	// console.log(days, total, avg)
	fadeyStuff('pc_games_avg', numberWithCommas(avg));
}

function buildPopcornPage(content) {
	fadeyStuff("pc_ts", moment().format("MMM Do, HH:mm:ss"));

	if (!content) return;
	if (content.count === 0) return;
	// console.log(content);
	updateCharts(content.counts, content.totalUsers);
}

function buildPopcornLastGames(data, prefix) {
	if(!data) return;
	// console.log(data);
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
		var deviceIcon = "alexa";
		if (games[i].d == "Echo Show")    device = ":";
		else if (games[i].d == "Google"){ device = ""; deviceIcon = "google"; }
		if (games[i].i == 'star') {sym = '<span style="color:DarkOrange;"> &#9734;</span>';}
		else if (games[i].i == 'sun') {sym = '<span style="color:DarkOrange;"> &#9788;</span>';}
		else if (games[i].i == 'note') {sym = " &#9834;";}
		else if (games[i].i == 'hash') {sym = " #";}
		else if (games[i].i == 'phone') {sym = " 📱";}

		if (!document.getElementById(prefix + '_lastgames_rank_' + x)) {			
			var row = container.insertRow(-1);
			row.id = prefix + '_lastgames_' + x;

			var cell0 =  row.insertCell(0);
			cell0.id = prefix + "_lastgames_device_" + x;
			var cell1 = row.insertCell(1);
			cell1.id = prefix + "_lastgames_rank_" + x;
			var cell2 = row.insertCell(2);
			cell2.id = prefix + "_lastgames_score_" + x;
			var cell3 = row.insertCell(3);
			cell3.id = prefix + "_lastgames_games_" + x;
			// var cell4 = row.insertCell(3);
			// cell4.id = prefix + "_lastgames_avg_" + x;

			var cell5 = row.insertCell(4);
			cell5.id = prefix + "_lastgames_lg_" + x;
			cell5.className = "nowrap";

			var cell6 = row.insertCell(5);
			cell6.id = prefix + "_lastgames_gs_" + x;

			var cell7 = row.insertCell(6);
			cell7.id = prefix + "_lastgames_ts_" + x;
			cell7.className = "timeago";
			cell7.title = games[i].t/1000;

			var cell8 = row.insertCell(7);
			cell8.id = prefix + "_lastgames_st_" + x;
			cell8.className = "timeago";
			cell8.title = games[i].st/1000;

			var cell9 = row.insertCell(8);
			cell9.id = prefix + "_lastgames_locale_" + x;
		} else {	
			document.getElementById(prefix + '_lastgames_ts_' + x).title = games[i].t/1000;
			document.getElementById(prefix + '_lastgames_st_' + x).title = games[i].st/1000;
		}
		
		fadeyStuff(prefix + "_lastgames_device_" + x, "<img width='22' class='device' src='./images/" + deviceIcon + ".png' />");

		fadeyStuff(prefix + "_lastgames_rank_" + x, numberWithCommas(games[i].r) + sym);
		fadeyStuff(prefix + "_lastgames_score_" + x, numberWithCommas(games[i].s));
		fadeyStuff(prefix + "_lastgames_games_" + x, numberWithCommas(games[i].g));
		
		if (!games[i].lg) games[i].lg = "";
		fadeyStuff(prefix + "_lastgames_lg_" + x, games[i].lg.replace(/ /g,''));
		fadeyStuff(prefix + "_lastgames_gs_" + x, games[i].gs);

		fadeyStuff(prefix + "_lastgames_ts_" + x, humanTime((games[i].t/1000)+""));
		fadeyStuff(prefix + "_lastgames_st_" + x, humanTime((games[i].st/1000)+""));
		if (games[i].l) fadeyStuff(prefix + "_lastgames_locale_" + x, "<span>"+device+"</span><img class='locale' title='"+games[i].l+"' alt='"+games[i].l+"' src='./flags/" + getFlag(games[i].l) + ".png' />");
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
		var deviceIcon = "alexa";
		if (topTen[i].d == "Echo Show")    device = ":";
		else if (topTen[i].d == "Google"){ device = ""; deviceIcon = "google"; }

		if (topTen[i].i == 'star') {sym = '<span style="color:DarkOrange;"> &#9734;</span>';}
		else if (topTen[i].i == 'sun') {sym = '<span style="color:DarkOrange;"> &#9788;</span>';}
		else if (topTen[i].i == 'note') {sym = " &#9834;";}
		else if (topTen[i].i == 'hash') {sym = " #";}

		if (!document.getElementById(prefix + '_league_' + x)) {
			var row = container.insertRow(-1);
			row.id = prefix + '_league_' + x;
			var cell0 = row.insertCell(0);
			cell0.id = prefix + "_league_device_" + x;
			var cell1 = row.insertCell(1);
			cell1.id = prefix + "_league_rank_" + x;
			var cell2 = row.insertCell(2);
			cell2.id = prefix + "_league_score_" + x;
			var cell3 = row.insertCell(3);
			cell3.id = prefix + "_league_games_" + x;
			var cell4 = row.insertCell(4);
			cell4.id = prefix + "_league_avg_" + x;
			var cell5 = row.insertCell(5);
			cell5.id = prefix + "_league_ts_" + x;
			cell5.className = "timeago";
			cell5.title = topTen[i].t/1000;
			var cell6 = row.insertCell(6);
			cell6.id = prefix + "_league_st_" + x;
			cell6.className = "timeago";
			cell6.title = topTen[i].st/1000;
			var cell7 = row.insertCell(7);
			cell7.id = prefix + "_league_locale_" + x;
		} else {
			document.getElementById(prefix + '_league_ts_' + x).title = topTen[i].t/1000;
			document.getElementById(prefix + '_league_st_' + x).title = topTen[i].st/1000;
		}
		fadeyStuff(prefix + "_league_device_" + x, "<img width='22' class='device' src='./images/" + deviceIcon + ".png' />");
		fadeyStuff(prefix + "_league_rank_" + x, numberWithCommas(x) + sym);
		fadeyStuff(prefix + "_league_score_" + x, numberWithCommas(topTen[i].s));
		fadeyStuff(prefix + "_league_games_" + x, numberWithCommas(topTen[i].g));
		fadeyStuff(prefix + "_league_avg_" + x, numberWithCommas(((+topTen[i].s)/(+topTen[i].g)).toFixed(2)));
		fadeyStuff(prefix + "_league_ts_" + x, humanTime((topTen[i].t/1000)+""));
		fadeyStuff(prefix + "_league_st_" + x, humanTime((topTen[i].st/1000)+""));
		if (topTen[i].l) fadeyStuff(prefix + "_league_locale_" + x, "<span>"+device+"</span><img class='locale' title='"+topTen[i].l+"' alt='"+topTen[i].l+"' src='./flags/" + getFlag(topTen[i].l) + ".png' />");
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
	if (!data.es) data.es = {score:0,reviews:0};
	if (!data.it) data.it = {score:0,reviews:0};
	if (!data.mx) data.mx = {score:0,reviews:0};

	var arIds = ['pc_uk_stars', 'pc_us_stars', 'pc_de_stars', 'pc_in_stars', 'pc_ca_stars', 'pc_jp_stars', 'pc_au_stars', 'pc_fr_stars', 'pc_es_stars', 'pc_it_stars', 'pc_mx_stars'];
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
		else if (i == 8) e.classList.add(getCssStar(data.es.score));
		else if (i == 9) e.classList.add(getCssStar(data.it.score));
		else if (i ==10) e.classList.add(getCssStar(data.mx.score));
	}

	if (document.getElementById('pc_uk_reviews')) fadeyStuff('pc_uk_reviews', numberWithCommas(data.uk.reviews));
	if (document.getElementById('pc_us_reviews')) fadeyStuff('pc_us_reviews', numberWithCommas(data.us.reviews));
	if (document.getElementById('pc_de_reviews')) fadeyStuff('pc_de_reviews', numberWithCommas(data.de.reviews));
	if (document.getElementById('pc_in_reviews')) fadeyStuff('pc_in_reviews', numberWithCommas(data.in.reviews));
	if (document.getElementById('pc_ca_reviews')) fadeyStuff('pc_ca_reviews', numberWithCommas(data.ca.reviews));
	if (document.getElementById('pc_jp_reviews')) fadeyStuff('pc_jp_reviews', numberWithCommas(data.jp.reviews));
	if (document.getElementById('pc_au_reviews')) fadeyStuff('pc_au_reviews', numberWithCommas(data.au.reviews));
	if (document.getElementById('pc_fr_reviews')) fadeyStuff('pc_fr_reviews', numberWithCommas(data.fr.reviews));
	if (document.getElementById('pc_es_reviews')) fadeyStuff('pc_es_reviews', numberWithCommas(data.es.reviews));
	if (document.getElementById('pc_it_reviews')) fadeyStuff('pc_it_reviews', numberWithCommas(data.it.reviews));
	if (document.getElementById('pc_mx_reviews')) fadeyStuff('pc_mx_reviews', numberWithCommas(data.mx.reviews));
}

function chtNewUsers(chart, d, l, total) {

	var dailyData = JSON.parse(JSON.stringify(d));
	dailyData.dailygames = JSON.parse(JSON.stringify(_gameinfo.dailygames));
	dailyData.dailyplayers = JSON.parse(JSON.stringify(_dailyPlayers));
	dailyData.labels = JSON.parse(JSON.stringify(l));
	// console.log(dailyData)
	dailyData = summariseChtData(dailyData);
	
	var data = {
		labels: dailyData.labels,
		datasets:[
			{label:"UK", data: dailyData.uk, borderColor:Crimson, backgroundColor:Crimson, yAxisID: 'left-y-axis', fill:false, lineTension:0.1, type:"line", pointRadius:2},
			{label:"US", data: dailyData.us, borderColor:SteelBlue, backgroundColor:SteelBlue, yAxisID: 'left-y-axis', fill:false, lineTension:0.1, type:"line", pointRadius:2},
			{label:"Germany", data: dailyData.de, borderColor:Gold, backgroundColor:Gold, yAxisID: 'left-y-axis', fill:false, lineTension:0.1, type:"line", pointRadius:2},
			{label:"India", data: dailyData.in, borderColor:Khaki, backgroundColor:Khaki, yAxisID: 'left-y-axis', fill:false, lineTension:0.1, type:"line", pointRadius:2},
			{label:"Canada", data: dailyData.ca, borderColor:Red, backgroundColor:Red, yAxisID: 'left-y-axis', fill:false, lineTension:0.1, type:"line", pointRadius:2},
			{label:"Japan", data: dailyData.jp, borderColor:LightPink, backgroundColor:LightPink, yAxisID: 'left-y-axis', fill:false, lineTension:0.1, type:"line", pointRadius:2},
			{label:"Australia", data: dailyData.au, borderColor:MidnightBlue, backgroundColor:MidnightBlue, yAxisID: 'left-y-axis', fill:false, lineTension:0.1, type:"line", pointRadius:2},
			{label:"France", data: dailyData.fr, borderColor:LightSkyBlue, backgroundColor:LightSkyBlue, yAxisID: 'left-y-axis', fill:false, lineTension:0.1, type:"line", pointRadius:2},
			{label:"Spain", data: dailyData.es, borderColor:Coral, backgroundColor:Coral, yAxisID: 'left-y-axis', fill:false, lineTension:0.1, type:"line", pointRadius:2},
			{label:"Italy", data: dailyData.it, borderColor:Moccasin, backgroundColor:Moccasin, yAxisID: 'left-y-axis', fill:false, lineTension:0.1, type:"line", pointRadius:2},
			{label:"Mexico", data: dailyData.mx, borderColor:SeaGreen, backgroundColor:SeaGreen, fill:false, lineTension:0.1, type:"line", pointRadius:2},
			{label:"DailyAvg", data: dailyData.avg, borderColor:Black, backgroundColor:Black, yAxisID: 'left-y-axis', pointRadius:0, type: "line", fill:false},
			{label:"DailyPlayers", data: dailyData.dailyplayers, borderColor:LightSlateGray, backgroundColor:LightSlateGray, yAxisID: 'left-y-axis', pointRadius:0, type: "line", fill:false},

			{label:"Games", data: dailyData.dailygames, backgroundColor:LightGreen, borderColor:LightGreen, yAxisID: 'right-y-axis', type: "bar", borderWidth: 1},
			{label:"Weekends", data: dailyData.we, backgroundColor:AliceBlue, borderColor:AliceBlue, yAxisID: 'right-y-axis', type: "bar", borderWidth: 1},
			{label:"Months", data: dailyData.mo, backgroundColor:BurlyWood, borderColor:BurlyWood, yAxisID: 'right-y-axis', type: "bar", borderWidth: 1}
		],
		
		options: {
			responsive: true,
			scales: {
				yAxes: [{
	            	id: 'left-y-axis',
	            	type: 'linear',
	            	position: 'left',
	                ticks: {
	                    beginAtZero:true
	                },
	                scaleLabel: {
		        		display: true,
		        		labelString: "Player Counts"
		        	}
	            },{
	            	id: 'right-y-axis',
	                type: 'linear',
	                position: 'right',
	                ticks: {
	                    beginAtZero:true
	                },
	                scaleLabel: {
		        		display: true,
		        		labelString: "Games Per Day"
		        	}
	            }]
	        }
		}
    };

	chart.data = data;
	chart.options = data.options;

	chart.update();

	var axis = chart.scales.y-axis-0;
	_chtHeight = axis.max;
}

function updateCharts(data, total) {
	if (!data) return;
	if (data.length === 0) return;

	// get days from launch as x axis
	var today = new Date();
	// console.log(_startDate, today)
	var diff = daydiff(_startDate, today, true);

	if (Object.keys(_newUsers).length === 0) {
		_newUsers = data;
		_newUsersLabels = new Array(diff).fill("");
		// console.log(diff)
		for (var i = 1; i < diff-1; i++) {
			var someDate = addDays(_startDate, i);
			// console.log(someDate)
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
		if (diff > _newUsers.es.length) resizeArr(_newUsers.es, diff, null);
		if (diff > _newUsers.it.length) resizeArr(_newUsers.it, diff, null);
		if (diff > _newUsers.mx.length) resizeArr(_newUsers.mx, diff, null);
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
		if (data.es[i] != _newUsers.es[i]) {
			if (!_newUsers.es[i]) _newUsers.es[i] = 0;
			_newUsers.es[i] += data.es[i];
		}
		if (data.it[i] != _newUsers.it[i]) {
			if (!_newUsers.it[i]) _newUsers.it[i] = 0;
			_newUsers.it[i] += data.it[i];
		}
		if (data.mx[i] != _newUsers.mx[i]) {
			if (!_newUsers.mx[i]) _newUsers.mx[i] = 0;
			_newUsers.mx[i] += data.mx[i];
		}
	}
	fadeyStuff('pc_total_today', numberWithCommas(_newUsers.totals[_newUsers.totals.length-1]));
	fadeyStuff('pc_total_avg', numberWithCommas(Math.round(_newUsers.avg[_newUsers.avg.length-1])));
	_total = total;
	chtNewUsers(_newUsersChart, _newUsers, _newUsersLabels, _total);
}

function resetLimit() {
	_limit = 10;
	clearLeague('pc_scores', buildLeague());
	clearLeague('pc_lastgames', buildLastGames());
}

function increaseLimit() {
	_limit = _limit * 2;
	var newUrl = paramReplace('limit', window.location.href, _limit);
	if (newUrl.indexOf('#pc_league') === -1) newUrl = newUrl + '#pc_league';
	changeUrl('', newUrl);
	buildLeague();
	buildLastGames();	
}

function getIntro() {
	httpGetByUrl(aws + "getHomePageContent?action=getintro&locale="+_locale, function (err, data) {
		if (!data) return;
		getQuestions(5, data.msg.genre);
		fadeyStuff("pc_intro", data.msg.text);
	});	
}

function getEvent() {
	httpGetByUrl(aws + "getHomePageContent?action=getevents&locale="+_locale, function (err, data) {
		if (!data) return;
		fadeyStuff("pc_event", data.msg.exitMsg || data.msg.msg);
	});
}

function getKeywords() {
	httpGetByUrl(aws + "getHomePageContent?action=getkeywords&locale="+_locale, function (err, data) {
		if (!data) return;
		_keywords = data.msg;
		fadeyStuff("pc_true", _keywords.true);
		fadeyStuff("pc_false", _keywords.false);
	});
}

function getQuestions(count, genre) {
	var url = aws + "getHomePageContent?action=getquestions&count="+count+"&genre="+genre+"&locale="+_locale;
	// console.log(url)
	httpGetByUrl(url, function (err, data) {
		// console.log(data);
		if (!data || !data.msg.questions) return;
		if (data.msg.genre) fadeyStuff("pc_question_genre", capitalizeFirstLetter(data.msg.genre) + " Movies"); 

		var idx = randomInt(0, data.msg.questions.length-1);
		var q = data.msg.questions[idx];
		var t = cleanseText(q.echoShowText);
		fadeyStuff("pc_question", t);

		$.get(q.Poster).done(function () {
		  fadeyPic("pc_question_poster", q.Poster);
		}).fail(function () {
		   fadeyPic("pc_question_poster", './images/popcorn_l.png');
		});

		var c;

		if (q.correct) {
			c = q.correct+"";
			c = c.replace('<emphasis level="reduced">', '');
			c = c.replace('</emphasis>', '');
		}

		document.getElementById('pc_true').onclick = function () {showAnswer(true, q.answer, c);};
		document.getElementById('pc_false').onclick = function () {showAnswer(false, q.answer, c);};

		startProgressBar(30, q.answer, c);
	});
}

var pg;
function showAnswer(chosen, answer, correct){
	// console.log(chosen, answer, correct);

	clearInterval(pg);
	document.getElementById('pc_progressbar').setAttribute('style', "width:100%;");
	document.getElementById('pc_truefalse').setAttribute('style', 'display:none;');

	var text = "";
	if (chosen === null) {
		text = "The correct answer was " + answer+". ";
		if (correct) text += "The answer is " + correct;
	} else {
		if (chosen == answer) {
			var i = randomInt(0, _correctPhrases.length-1);
			text = _correctPhrases[i];
		} else {
			var i = randomInt(0, _incorrectPhrases.length-1);
			text = _incorrectPhrases[randomInt(0, i)];
		}

		if (correct) text += " - The answer is " + correct;
	}
	fadeyStuff("pc_answer", text);
}

function startProgressBar(seconds, answer, correct) {
	document.getElementById('pc_answer').setAttribute('style', 'display:none;');
	document.getElementById('pc_truefalse').setAttribute('style', '');
	document.getElementById('pc_progressbar').setAttribute('style', 'width:0px;');

	var curr = 0;
	var width = 0;
	seconds = seconds*10;
	clearInterval(pg);
	pg = setInterval(function () {
		curr += 1;
		width = +((curr/seconds) * 100).toFixed(0);
		// console.log(curr, seconds, width);
		document.getElementById('pc_progressbar').setAttribute('style', "width:" + width + "%;");
		if (width >= 100) {
			clearInterval(pg);
			showAnswer(null, answer, correct);
		}
	}, 100);

	document.getElementById('pc_progressbar').setAttribute('style', 'width:0px;');
}

function summariseChtData(data, fraction) {
	if (!fraction) fraction = 1.2;  // lower = more recent; 100 = full, 1.2 = half
	var newSize = 10;
	// console.log(data)
	// check all same length;
	var initialLabel = data.labels[0];
	var l = -1;
	for (var property in data) {
	    if (data.hasOwnProperty(property)) {
	    	if (l == -1) { l = data[property].length; continue; }
	    	if (data[property].length != l) { 
	    		// console.log("Length mismatch, resetting", l, data[property].length, property, data); 
	    		reset(); 
	    		return data; 
	    	}
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

