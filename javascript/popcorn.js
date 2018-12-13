(function(){
    "use strict";
})();

var _locale = getParameterByName('locale') || '';
var _limit = getParameterByName('limit') || 10;

var _device = 'ga_aa';
var _deviceFilter = '';

var _keywords;

var _popcornUrl = aws + '?action=getstats&prefix=pc&limit=' + _limit;
var _popcornLastGameUrl = aws + '?last=true&prefix=pc&limit=' + _limit;

var _startDate = new Date("2017-05-27T12:00:00Z");
var _timeFrom = 0;
var _lastTimestamp = 0;
var _doubleDayDivider = 1;
var _daysSinceLaunch = 0;
var _newUsersChart = new Chart(document.getElementById("pc_cht_new_users").getContext('2d'), { type: 'bar' });
var _newUsers = {};
var _newUsersLabels = [];

var _gameinfo = { dailygames: [] };
var _chtHeight = 7000;
var _dailyPlayers = [];
var _chartSummary = getParameterByName('chtsum') || 95;
var _chtData = {};

var _correctPhrases = ["Correct!"];
var _incorrectPhrases = ["Incorrect!"];
var _answerPhrases = ["The answer is &&"];

Chart.defaults.bar.scales.xAxes[0].categoryPercentage = 1;
Chart.defaults.bar.scales.xAxes[0].barPercentage = 1;
Chart.defaults.bar.scales.xAxes[0].gridLines={color:"rgba(0, 0, 0, 0)"};

var aInt;
var sInt;

window.addEventListener('popstate', function (event) {
	// console.log(history.state);
    if (history.state && history.state.id === 'homepage') {
    	_locale = history.state.locale;
    	_device = history.state.device;
    	_limit = history.state.limit;
    	_chartSummary = history.state.chartSummary;
    	startPopcornQuiz();
        // Render new content for the hompage
    }
}, false);

function startPopcornQuiz(locale, limit, device) {
	amazonTimer();
	getStats();
	// console.log(_limit, getParameterByName('limit'))
	document.getElementById('truncatePercentage').value = _chartSummary;
	document.getElementById('pc_more_count').innerHTML = _limit;

	if (_locale != '') {
		applyLocaleHeader(_locale, _device);
		_popcornUrl += "&locale=" + _locale;
	}

	getKeywords();
}

function amazonTimer() {
	getPhrases();
	getIntro();
	getEvent();
	checkNewDay();
	getMyRank();
	aInt = setInterval(function () {
		getPhrases();
		getIntro();
		getEvent();
		checkNewDay();
		getMyRank();
	}, 60000);
}

function statsTimer() {
	// console.log('statsTimer');
	sInt = setTimeout(function () {
		clearTimeout(sInt);
		getStats();
	}, 5000);
}

function getStats() {
	// console.log('getStats');
	httpGetLastPlay(_popcornLastGameUrl, 'pc', function (err, data) {
		if (err) { console.error(err); return statsTimer(); }
		// console.log(_lastTimestamp, data[0].timestamp)
		if (data && _lastTimestamp < data[0].timestamp) {
			_lastTimestamp = data[0].timestamp;
			getGamePlay(function () {
				 return statsTimer();
			});
		} else {
			return statsTimer();
		}
	});
}

function getGamePlay(callback) {
	async.parallel([
	    function(callback) {
	        buildLeague(function () {
	        	callback(null, 'buildLeague');
	        });
	    },
	    function(callback) {
	        buildLastGames(function () {
	        	callback(null, 'buildLastGames');
	        });
	    },
	    function(callback) {
	    	getDailyGames(function () {
	    		callback(null, 'getDailyGames');
	    	});
	    }
	],
	function(err, results) {
		if (err) console.error(err);
	    if (callback) return callback();
	});
}

function buildLeague(callback) {
	var uri = aws + "?league=true&prefix=pc&limit=" + _limit + "&locale=" + _locale + _deviceFilter;
	httpGetStats(uri, 'pc',  function (err, data) {
		buildPopcornLeague(data, 'pc');
		if (callback) return callback();
	});
}

function buildLastGames(callback) {
	var uri = aws + "?lastgames=true&prefix=pc&limit=" + _limit + "&locale=" + _locale + _deviceFilter;
	httpGetStats(uri, 'pc',  function (err, data) {
		// console.log(data)
		buildPopcornLastGames(data, 'pc');
		if (callback) return callback();
	});
}

function getDailyGames(callback) {
	httpGetByUrl(aws + "?getdailygames=true&prefix=pc&limit=0&locale=" + _locale + "&timefrom=" + _timeFrom + _deviceFilter, function (err, data) {
		if (err) console.error(err);
		if (!data) return callback();
		buildDailyGames(err, data);
		return callback();
	});
}

function switchLocale(locale) {
	_locale = locale;

	applyLocaleHeader(locale, _device);
	getIntro();
	getKeywords();
	getPhrases();
	getQuestions(5, "");
	document.getElementById('pc_truefalse').setAttribute('style', 'display:none;');
	
	setGameElements(locale);
	
	clearInterval(sInt);
	statsTimer();
	_dailyPlayers = [];
	clearLeague('pc_scores', null);
	clearLeague('pc_lastgames', null);
	getGamePlay();
}

function switchDevice(device) {
	if (!device) device = "ga_aa";
	_timeFrom = 0;
	if (device == 'Google') {
		_device = 'ga';
		_deviceFilter = "&device=Google,Google%20Phone,Google%20Surface,Google%20Speaker";
	} else if (device == 'Echo') {
		_device = 'aa';
		_deviceFilter = "&device=Echo,Echo%20Show,$exists:false";
	} else {
		_device = 'ga_aa';
		_deviceFilter = "";
	}
	// console.log(_deviceFilter)
	var elements = document.getElementsByClassName('devicelist');
	for(var i=0, l=elements.length; i<l; i++){
	 elements[i].classList.remove("selected");
	}

	document.getElementById("th_"+_device).classList.add('selected');
	_dailyPlayers = [];
	clearLeague('pc_scores', null);
	clearLeague('pc_lastgames', null);
	getGamePlay();
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
		else if (l == "pt") playWord = ", ";
		else if (l == "dk") playWord = ", ";
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
	var url = aws + "?action=getphrases&locale="+l;
	httpGetStats(url, 'pc',  function (err, data) {
		if (!data) return;
		// console.log(data)
		_answerPhrases = data.msg.answerPhrases;

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
	httpGetStats(aws + "?getmyrank=true&prefix=pc&limit=" + _limit + "&locale=" + _locale, 'pc',  function (err, data) {
		if (!data) return;
		// console.log(data)
		
		fadeyStuff('pc_total_players', numberWithCommas(data.myRank.total));
		document.getElementById('pc_total_players').setAttribute('total', data.myRank.total);
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

function buildDailyGames(err, content) {
	if (err) {console.error(err); return;}
	if (!content) {console.log('no data'); return;}
	if (!content.g) {console.log(content); return;}

	// console.log(content);

	updateDeviceTypes(content.g[content.g.length-1]);
	updateBonusPanel(content.g[content.g.length-1]);

	_chtData = content.g;

	var chtData = prepDataForChart(content.g, _chartSummary);
	chtNewUsers(_newUsersChart, chtData);

	var d = new Date();
    var formattedDate = "d_"+ formatDate(d);

    // TODO - If incorrect data for date, the sort order by assumes today is first
	var today = content.g[content.g.length-1][formattedDate].games;
	
	fadeyStuff("pc_games_today", numberWithCommas(today));

	var total = 0;
	var days = 0;
	for (var i = 0; i < content.g.length; i++) {
		if (content.g[i].games === 0) continue;
		total += content.g[i].games;
		for (k in content.g[i]) {
			if (k.indexOf('d_') == 0) days++;
		}
	}

	var avg = Math.round(total/days);
	fadeyStuff('pc_games_avg', numberWithCommas(avg));

	fadeyStuff('pc_total_games', numberWithCommas(total));
	document.getElementById('pc_total_games').setAttribute('total', total);
	fadeyStuff('pc_total_today', numberWithCommas(content.g[content.g.length-1][formattedDate].total));
}

var _deviceCounts;

function countDevices(obj, stack) {
    for (var property in obj) {
        if (obj.hasOwnProperty(property)) {
            if (typeof obj[property] == "object") {
                countDevices(obj[property], stack + '.' + property);
            } else {
            	if (property.toLowerCase().indexOf('echo') == 0) {
            		_deviceCounts.Echo += obj[property];
            		// console.log(stack, property, obj[property]);
            	} else if (property.toLowerCase().indexOf('google') == 0) {
            		_deviceCounts.Google += obj[property];
                	// console.log(stack, property, obj[property]);
            	}
            }
        }
    }
}

function updateDeviceTypes(obj) {
	_deviceCounts = {Echo: 0, Google: 0, Total: 0};
	countDevices(obj, '');
	_deviceCounts.Total = _deviceCounts.Echo + _deviceCounts.Google;

	var aWidth = percentage(_deviceCounts.Echo, _deviceCounts.Total);
	var gWidth = percentage(_deviceCounts.Google, _deviceCounts.Total);

	document.getElementById('barAlexa').setAttribute('style', 'width:'+aWidth+'%');
	document.getElementById('barGoogle').setAttribute('style','width:'+gWidth+'%');

	if (aWidth > gWidth) {
		fadeyStuff("barAlexa", aWidth.toFixed(2)+'%');
		fadeyStuff("barGoogle", '');
	} else {
		fadeyStuff("barAlexa", '');
		fadeyStuff("barGoogle", gWidth.toFixed(2)+'%');
	}

	fadeyStuff("pc_device_alexa", numberWithCommas(_deviceCounts.Echo));
	fadeyStuff("pc_device_google", numberWithCommas(_deviceCounts.Google));
}

function countBonuses(obj, stack) {
    for (var property in obj) {
        if (obj.hasOwnProperty(property)) {
        	// console.log(property)

            if (typeof obj[property] == "object") {
                countBonuses(obj[property], stack + '.' + property);
            } else {
            	if (stack.indexOf(".bonus.") > 0 ) {
            		// console.log(property, obj[property])
            			 if (property == "wins") _bonusCounts.Wins += obj[property];
            		else if (property == "loses") _bonusCounts.Loses += obj[property];
                	else if (property == "skips") _bonusCounts.Skips += obj[property];
            	}
            	// console.log(stack, property, obj[property]);
            }
        }
    }
}

var _bonusCounts = 0;

function updateBonusPanel(obj) {
	_bonusCounts = {Wins: 0, Loses: 0, Skips: 0, Total: 0};
	countBonuses(obj, '');
	_bonusCounts.Total = _bonusCounts.Wins + _bonusCounts.Loses + _bonusCounts.Skips;
	var wWidth = percentage(_bonusCounts.Wins, _bonusCounts.Total);
	var lWidth = percentage(_bonusCounts.Loses, _bonusCounts.Total);
	var sWidth = percentage(_bonusCounts.Skips, _bonusCounts.Total);

	fadeyStuff("pc_bonus_wins", numberWithCommas(_bonusCounts.Wins));
	fadeyStuff("pc_bonus_loses", numberWithCommas(_bonusCounts.Loses));
	fadeyStuff("pc_bonus_skips", numberWithCommas(_bonusCounts.Skips));
	document.getElementById('barWins').setAttribute('style', 'width:'+wWidth+'%');
	document.getElementById('barLoses').setAttribute('style','width:'+lWidth+'%');
	document.getElementById('barSkips').setAttribute('style','width:'+sWidth+'%');
	if (wWidth > 13) fadeyStuff("barWins", wWidth.toFixed(2)+'%');
	if (lWidth > 13) fadeyStuff("barLoses", lWidth.toFixed(2)+'%');
	if (sWidth > 13) fadeyStuff("barSkips", sWidth.toFixed(2)+'%');	
}

function buildPopcornLastGames(data, prefix) {
	if(!data) return;

	fadeyStuff("approxPlayers", numberWithCommas(data.totalUsers));
	fadeyStuff("approxGames", numberWithCommas(data.totalGames));

	var container = document.getElementById(prefix + '_lastgames');
	var games = data.lastGame;
	for (var i = 0; i < games.length; i++) {
		var x = i + 1;		
		var sym = "";
		var device = ".";
		var deviceIcon = "alexa";
		var g = games[i];
		if (g.d == "Echo Show")    device = ":";
		else if (g.d == "Google"){ device = ""; deviceIcon = "google"; }
		else if (g.d == "Google Surface"){ device = ":"; deviceIcon = "google"; }
		else if (g.d == "Google Phone"){ device = "."; deviceIcon = "google"; }
		else if (g.d == "Google Speaker"){ device = ""; deviceIcon = "google"; }

		if (g.i == 'star') {sym = " ⭐";}
		else if (g.i == 'sun') {sym = " 🌞";}
		else if (g.i == 'note') {sym = " 🎵";}
		else if (g.i == 'hash') {sym = " 🌭";}
		else if (g.i == 'phone') {sym = " 📱";}

		var cell1;
		if (!document.getElementById(prefix + '_lastgames_rank_' + x)) {			
			var row = container.insertRow(-1);
			row.id = prefix + '_lastgames_' + x;

			var cell0 =  row.insertCell(0);
			cell0.id = prefix + "_lastgames_device_" + x;
			cell1 = row.insertCell(1);
			cell1.id = prefix + "_lastgames_rank_" + x;
			//cell1.className = "";
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
			cell7.title = g.t/1000;

			var cell8 = row.insertCell(7);
			cell8.id = prefix + "_lastgames_st_" + x;
			cell8.className = "timeago";
			cell8.title = games[i].st/1000;

			var cell9 = row.insertCell(8);
			cell9.id = prefix + "_lastgames_locale_" + x;
		} else {	
			document.getElementById(prefix + '_lastgames_ts_' + x).title = g.t/1000;
			document.getElementById(prefix + '_lastgames_st_' + x).title = g.st/1000;
		}
		
		fadeyStuff(prefix + "_lastgames_device_" + x, buildIconHTML(deviceIcon, g.l, device));

		if (g.r == 1) {
			// cell1.className = "font20";
			fadeyStuff(prefix + "_lastgames_rank_" + x, "<span class='font26'>🥇</span>" + sym);
		} else if (g.r == 2) {
			// cell1.className = "font20";
			fadeyStuff(prefix + "_lastgames_rank_" + x, "<span class='font26'>🥈</span>" + sym);
		} else if (g.r == 3) {
			// cell1.className = "font20";
			fadeyStuff(prefix + "_lastgames_rank_" + x, "<span class='font26'>🥉</span>" + sym);
		} else {
			//cell1.className = "";
			fadeyStuff(prefix + "_lastgames_rank_" + x, numberWithCommas(g.r) + sym);
		}

		// fadeyStuff(prefix + "_lastgames_rank_" + x, numberWithCommas(g.r) + sym);
		fadeyStuff(prefix + "_lastgames_score_" + x, numberWithCommas(g.s));
		fadeyStuff(prefix + "_lastgames_games_" + x, numberWithCommas(g.g));
		
		if (!g.lg) g.lg = "";
		var bonusInfo = "";
		if (g.b) bonusInfo = "<br/>"+g.b.wins+" / "+g.b.loses+" / "+g.b.skips;

		fadeyStuff(prefix + "_lastgames_lg_" + x, g.lg+getGenreEventTitle(g.ge)+bonusInfo);
		fadeyStuff(prefix + "_lastgames_gs_" + x, g.gs);

		fadeyStuff(prefix + "_lastgames_ts_" + x, humanTime((g.t/1000)+""));
		fadeyStuff(prefix + "_lastgames_st_" + x, humanTime((g.st/1000)+""));
	}
	fadeyStuff(prefix + '_lg_count', numberWithCommas(i));
	fadeyStuff(prefix + '_more_count', numberWithCommas(i));
}

function getGenreEventTitle(genre, suffix) {
	//console.log(_locale);
	var br = "<br/>";
	if (genre == "Horror_Seasonal") {
		var l = _locale.split('-')[0];
		
			 if (l == 'es') return br + "🎃 Evento de halloween";
		else if (l == 'it') return br + "🎃 Evento di Halloween";
		else if (l == 'fr') return br + "🎃 Événement d'Halloween";
		else if (l == 'de') return br + "🎃 Halloween-Veranstaltung";
		else if (l == "pt") return br + "🎃 Evento de Halloween";
		else if (l == "da") return br + "🎃 Halloween begivenhed";
		else if (l == "nl") return br + "🎃 Halloween-evenement";
		else if (l == 'ja') return br + "🎃 ハロウィーンイベント";
		return br + "🎃 Halloween Event";
	}
	if (suffix && suffix.length > 0) return genre + " " + suffix;
	if (genre.length > 0) return br + genre;
	return "";
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
		else if (topTen[i].d == "Google Surface"){ device = ":"; deviceIcon = "google"; }
		else if (topTen[i].d == "Google Phone"){ device = "."; deviceIcon = "google"; }
		else if (topTen[i].d == "Google Speaker"){ device = ""; deviceIcon = "google"; }

		if (topTen[i].i == 'star') {sym = " ⭐";}
		else if (topTen[i].i == 'sun') {sym = " 🌞";}
		else if (topTen[i].i == 'note') {sym = " 🎵";}
		else if (topTen[i].i == 'hash') {sym = " 🌭";}
		else if (topTen[i].i == 'phone') {sym = " 📱";}
		
		var cell1;

		if (!document.getElementById(prefix + '_league_' + x)) {
			var row = container.insertRow(-1);
			row.id = prefix + '_league_' + x;
			var cell0 = row.insertCell(0);
			cell0.id = prefix + "_league_device_" + x;
			cell1 = row.insertCell(1);
			cell1.id = prefix + "_league_rank_" + x;
			cell1.className = "font20";
			var cell2 = row.insertCell(2);
			cell2.id = prefix + "_league_score_" + x;
			var cell3 = row.insertCell(3);
			cell3.id = prefix + "_league_games_" + x;
			var cell4 = row.insertCell(4);
			cell4.id = prefix + "_league_avg_" + x;
			var cell5 = row.insertCell(5);
			cell5.id = prefix + "_league_bonus_" + x;
			var cell6 = row.insertCell(6);
			cell6.id = prefix + "_league_ts_" + x;
			cell6.className = "timeago";
			cell6.title = topTen[i].t/1000;
			var cell7 = row.insertCell(7);
			cell7.id = prefix + "_league_st_" + x;
			cell7.className = "timeago";
			cell7.title = topTen[i].st/1000;
			// var cell7 = row.insertCell(7);
			// cell7.id = prefix + "_league_locale_" + x;
		} else {
			document.getElementById(prefix + '_league_ts_' + x).title = topTen[i].t/1000;
			document.getElementById(prefix + '_league_st_' + x).title = topTen[i].st/1000;
		}
		
		fadeyStuff(prefix + "_league_device_" + x, buildIconHTML(deviceIcon, topTen[i].l, device));
		//fadeyStuff(prefix + "_league_device_" + x, "<img width='22' class='device' title='"+ deviceIcon +"' alt='"+deviceIcon+"' src='./images/" + deviceIcon + ".png' />");
		
		if (x == 1) {
			fadeyStuff(prefix + "_league_rank_" + x, "<span class='font26'>🥇</span>" + sym);
		} else if (x == 2) {
			fadeyStuff(prefix + "_league_rank_" + x, "<span class='font26'>🥈</span>" + sym);
		} else if (x == 3) {
			fadeyStuff(prefix + "_league_rank_" + x, "<span class='font26'>🥉</span>" + sym);
		} else {
			if (cell1) cell1.className = "font16 strong";
			fadeyStuff(prefix + "_league_rank_" + x, numberWithCommas(x) + sym);
		}
		if (!topTen[i].b) topTen[i].b = {wins:"-", loses:"-", skips:"-"};
		fadeyStuff(prefix + "_league_score_" + x, numberWithCommas(topTen[i].s));
		fadeyStuff(prefix + "_league_games_" + x, numberWithCommas(topTen[i].g));
		fadeyStuff(prefix + "_league_avg_" + x, numberWithCommas(((+topTen[i].s)/(+topTen[i].g)).toFixed(2)));
		fadeyStuff(prefix + "_league_bonus_" + x, numberWithCommas(topTen[i].b.wins) + " / " + numberWithCommas(topTen[i].b.loses) + " / " + numberWithCommas(topTen[i].b.skips));
		fadeyStuff(prefix + "_league_ts_" + x, humanTime((topTen[i].t/1000)+""));
		fadeyStuff(prefix + "_league_st_" + x, humanTime((topTen[i].st/1000)+""));
		//if (topTen[i].l) fadeyStuff(prefix + "_league_locale_" + x, "<span>"+device+"</span><img class='locale' title='"+topTen[i].l+"' alt='"+topTen[i].l+"' src='./flags/" + topTen[i].l + ".png' />");
	}
	fadeyStuff(prefix + '_count', numberWithCommas(i));
	document.getElementById(prefix + '_scores').setAttribute('total', total);
}

var _chtStuffRunning = false;
function chtNewUsers(chart, dailyData, total) {	
	if (_chtStuffRunning) return;
	if (dailyData.labels.length == 0) return;
	_chtStuffRunning = true;

	var data = {
		labels: dailyData.labels,
		datasets:[
			{label:"UK", data: dailyData.uk, borderColor:Crimson, backgroundColor:Crimson, yAxisID: 'left-y-axis', fill:false, type:"line", pointRadius:2},
			{label:"US", data: dailyData.us, borderColor:SteelBlue, backgroundColor:SteelBlue, yAxisID: 'left-y-axis', fill:false, type:"line", pointRadius:2},
			{label:"Germany", data: dailyData.de, borderColor:Gold, backgroundColor:Gold, yAxisID: 'left-y-axis', fill:false, type:"line", pointRadius:2},
			{label:"India", data: dailyData.in, borderColor:Khaki, backgroundColor:Khaki, yAxisID: 'left-y-axis', fill:false, type:"line", pointRadius:2},
			{label:"Canada", data: dailyData.ca, borderColor:Red, backgroundColor:Red, yAxisID: 'left-y-axis', fill:false, type:"line", pointRadius:2},
			{label:"Japan", data: dailyData.jp, borderColor:LightPink, backgroundColor:LightPink, yAxisID: 'left-y-axis', fill:false, type:"line", pointRadius:2},
			{label:"Australia", data: dailyData.au, borderColor:MidnightBlue, backgroundColor:MidnightBlue, yAxisID: 'left-y-axis', fill:false, type:"line", pointRadius:2},
			{label:"France", data: dailyData.fr, borderColor:LightSkyBlue, backgroundColor:LightSkyBlue, yAxisID: 'left-y-axis', fill:false, type:"line", pointRadius:2},
			{label:"Spain", data: dailyData.es, borderColor:Coral, backgroundColor:Coral, yAxisID: 'left-y-axis', fill:false, type:"line", pointRadius:2},
			{label:"Italy", data: dailyData.it, borderColor:Moccasin, backgroundColor:Moccasin, yAxisID: 'left-y-axis', fill:false, type:"line", pointRadius:2},
			{label:"Mexico", data: dailyData.mx, borderColor:SeaGreen, backgroundColor:SeaGreen, fill:false, type:"line", pointRadius:2},
			{label:"Spanish (Latin America)", data: dailyData.esla, borderColor:DarkGoldenRod, backgroundColor:DarkGoldenRod, fill:false, type:"line", pointRadius:2},
			{label:"Brazil", data: dailyData.br, borderColor:LightSteelBlue, backgroundColor:LightSteelBlue, fill:false, type:"line", pointRadius:2},
			{label:"Denmark", data: dailyData.dk, borderColor:FireBrick, backgroundColor:FireBrick, fill:false, type:"line", pointRadius:2},

			{label:"DailyAvg", data: dailyData.avg, borderColor:Black, backgroundColor:Black, yAxisID: 'left-y-axis', pointRadius:1, type: "line", fill:false},
			{label:"DailyPlayers", data: dailyData.dailyplayers, borderColor:LightSlateGray, backgroundColor:LightSlateGray, yAxisID: 'left-y-axis', pointRadius:2, type: "line", fill:false},

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
	_chtHeight = axis.max || _chtHeight;
	_chtStuffRunning = false;
}

function updateCharts(data) {
	if (!data) return;
	if (data.length === 0) return;
	console.log("HERE?");
	console.log(data)
	// get days from launch as x axis
	var today = new Date();
	// console.log(_startDate, today)
	var diff = daydiff(_startDate, today, true);
	var locales = ["uk", "us", "de", "in", "ca", "jp", "au", "fr", "es", "it", "mx", "esla", "br", "dk"];

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
		for (var l = 0; l < locales.length; l++) {
			if (diff > _newUsers[locales[l]].length) resizeArr(_newUsers[locales[l]], diff, null);
		}

		if (diff > _newUsers.avg.length)resizeArr(_newUsers.avg,diff, null);
		if (diff > _newUsers.we.length) resizeArr(_newUsers.we, diff, null);
		if (diff > _newUsers.mo.length) resizeArr(_newUsers.mo, diff, null);
		if (diff > _newUsers.totals.length) resizeArr(_newUsers.totals, diff, 0);
	}

	for (var i = 0; i < data.totals.length; i++) {
		if (data.avg[i] != _newUsers.avg[i]) _newUsers.avg[i] += data.avg[i];
		if (data.totals[i] != _newUsers.totals[i]) _newUsers.totals[i] += data.totals[i];
	}

	// fadeyStuff('pc_total_today', numberWithCommas(_newUsers.totals[_newUsers.totals.length-1]));
	// fadeyStuff('pc_total_avg', numberWithCommas(Math.round(_newUsers.avg[_newUsers.avg.length-1])));

	for (var i = 0; i < data.totals.length; i++) {
		for (var l = 0; l < locales.length; l++) {
			if (data[locales[l]][i] != _newUsers[locales[l]][i]) {
				if (!_newUsers[locales[l]][i]) _newUsers[locales[l]][i] = 0;
				_newUsers[locales[l]][i] += data[locales[l]][i];
			}
		}
	}
	
	var chtData = prepDataForChart();
	chtNewUsers(_newUsersChart, chtData);
}

function prepDataForChart(data, history) {

	history = -10;

	data.sort(dynamicSort("month"));
	data.sort(dynamicSort("year")); //"-year"

	//if (history) data = data.slice(history);

	console.log(data);

	var dailyGames = [];
	var dailyLabels = [];
	var dailyTotals = [];
	var weekends = [];
	var months = [];

	var today = new Date();
	// console.log(_startDate, today)
	var diff = daydiff(_startDate, today, true);
	

	dailyLabels = new Array(diff).fill("");
	// console.log(diff)
	for (var i = 1; i < diff-1; i++) {
		var someDate = addDays(_startDate, i);
		// console.log(someDate)
		var q = someDate.toLocaleDateString().split("/");
		dailyLabels[i] = q[0] + getMonthName(q[1]-1);

		var day = someDate.getDay();
		if (day == 0 || day > 5) weekends.push(_chtHeight);
		else weekends.push(null);

        var dt = someDate.getDate();
        if (dt == 1) months.push(_chtHeight);
        else months.push(null);
	}
	dailyLabels[0] = "Launch";
	dailyLabels[diff-1] = "Today";

	var uk = new Array(diff).fill(null);
	var us = new Array(diff).fill(null);
	var de = new Array(diff).fill(null);
	var ind= new Array(diff).fill(null);
	var ca = new Array(diff).fill(null);
	var jp = new Array(diff).fill(null);
	var au = new Array(diff).fill(null);
	var fr = new Array(diff).fill(null);
	var es = new Array(diff).fill(null);
	var it = new Array(diff).fill(null);
	var mx = new Array(diff).fill(null);
	var esla=new Array(diff).fill(null);
	var br = new Array(diff).fill(null);
	var dk = new Array(diff).fill(null);

	var counter = 0;
	for (var i = 0; i < data.length; i++) {
		var month = data[i];
		var monthGames = month.games;
		// console.log(month)
		
		for (var x in month) {
	        if (month.hasOwnProperty(x)) {
	        	if (x.indexOf("d_") != 0) continue;
	        	var day = month[x];

	        	if (day.games) {
	        		dailyGames.push(day.games);
	        	} else {
	        		dailyGames.push(null);
	        	}
	        	dailyTotals.push(day.total);

	        	// get locales
            	for (var y in day) {
            		if (day.hasOwnProperty(y)) {
            			if (y.indexOf("-") == 2) {
            				var s = sumObjCounts(day[y]);
            				var locales = ["uk", "us", "de", "in", "ca", "jp", "au", "fr", "es", "it", "mx", "esla", "br", "dk"];
            				switch (y){
		    					case "en-GB":
		    						uk[counter] = s;
		    						break;
		    					case "en-US":
		    						us[counter] = s;
		    						break;
		    					case "de-DE":
		    						de[counter] = s;
		    						break;
		    					case "en-IN":
		    						ind[counter] = s;
		    						break;
		    					case "en-CA":
		    						ca[counter] = s;
		    						break;
		    					case "ja_JP":
		    						jp[counter] = s;
		    						break;
		    					case "en-AU":
		    						au[counter] = s;
		    						break;
		    					case "fr-fR":
		    						fr[counter] = s;
		    						break;
		    					case "es-ES":
		    						es[counter] = s;
		    						break;
		    					case "it-IT":
		    						it[counter] = s;
		    						break;
		    					case "es-MX":
		    						mx[counter] = s;
		    						break;
		    					case "pt-BR":
		    						br[counter] = s;
		    						break;
		    					case "da_DK":
		    						dk[counter] = s;
		    						break;
		    					default:
		    						esla[counter] = s;
		    						// uk.push(null)
		    						break;
		    				}
            			}
            		}
            	}
            	
	        }
	        // console.log(counter)
	        counter++;
	    }
	}

	var dailyData = {
		labels: dailyLabels.slice(history),

		uk: uk.slice(history),
		us: us.slice(history),
		de: de.slice(history),
		in: ind.slice(history),
		ca: ca.slice(history),
		jp: jp.slice(history),
		au: au.slice(history),
		fr: fr.slice(history),
		es: es.slice(history),
		it: it.slice(history),
		mx: mx.slice(history),
		br: br.slice(history),
		dk: dk.slice(history),
		esla: esla.slice(history),

		dailygames: dailyGames.slice(history),
		dailyplayers: dailyTotals.slice(history),
		we: weekends.slice(history),
		mo: months.slice(history)
	}
	console.log(dailyData);
	// fkeorkfer
	return dailyData;
}

function sumObjCounts(obj) {
	// console.log(obj)
	var total = 0;

	for (var x in obj) {
		if (obj.hasOwnProperty(x)) {
			total += obj[x];
		}
	}

	return total;
}

function resetLimit() {
	_limit = 10;
	document.getElementById('pc_more_count').innerHTML = _limit;
	var newUrl = paramReplace('limit', window.location.href, _limit);
	if (newUrl.indexOf('#pc_league') === -1) newUrl = newUrl + '#pc_league';
	changeUrl('', newUrl);
	clearLeague('pc_scores', buildLeague());
	clearLeague('pc_lastgames', buildLastGames());
}

function increaseLimit() {
	_limit = _limit * 2;
	document.getElementById('pc_more_count').innerHTML = _limit;
	var newUrl = paramReplace('limit', window.location.href, _limit);
	if (newUrl.indexOf('#pc_league') === -1) newUrl = newUrl + '#pc_league';
	changeUrl('', newUrl);
	buildLeague();
	buildLastGames();	
}

function getIntro() {
	httpGetByUrl(aws + "?action=getintro&locale="+_locale, function (err, data) {
		if (!data) return;
		getQuestions(5, data.msg.genre);
		fadeyStuff("pc_intro", data.msg.text);
	});	
}

function getEvent() {
	httpGetByUrl(aws + "?action=getevents&locale="+_locale, function (err, data) {
		if (!data) return;
		fadeyStuff("pc_event", data.msg.exitMsg || data.msg.msg);
	});
}

function getKeywords() {
	httpGetByUrl(aws + "?action=getkeywords&locale="+_locale, function (err, data) {
		if (!data) return;
		_keywords = data.msg;
		fadeyStuff("pc_true", _keywords.true);
		fadeyStuff("pc_false", _keywords.false);
	});
}

function getQuestions(count, genre) {
	var url = aws + "?action=getquestions&count="+count+"&genre="+genre+"&locale="+_locale;
	// console.log(url)
	httpGetByUrl(url, function (err, data) {
		// console.log(data);
		if (!data || !data.msg.questions) return;
		if (data.msg.genre) fadeyStuff("pc_question_genre", getGenreEventTitle(capitalizeFirstLetter(data.msg.genre), "Movies")); 

		var idx = randomInt(0, data.msg.questions.length-1);
		var q = data.msg.questions[idx];
		var t = cleanseText(q.echoShowText);
		fadeyStuff("pc_question", t);

		$.get(q.Poster).done(function () {
		  fadeyPic("pc_question_poster", q.Poster);
		}).fail(function (e) {
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

	var a = _answerPhrases[randomInt(0, _answerPhrases.length-1)];
	// console.log(_answerPhrases)
	var text = "";
	if (chosen === null) {
		text = "The correct answer was " + answer + ". ";
		if (correct) text += a.replace('&&', correct); // + correct;
	} else {
		if (chosen == answer) {
			var i = randomInt(0, _correctPhrases.length-1);
			text = _correctPhrases[i];
		} else {
			var i = randomInt(0, _incorrectPhrases.length-1);
			text = _incorrectPhrases[randomInt(0, i)];
		}

		if (correct) text += " - " + a.replace('&&', correct);// + correct;
	}
	fadeyStuff("pc_answer", text);

	setTimeout(function(){
		getIntro();
	}, 2500);
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

function changeUrl(title, url) {
	if (typeof (history.pushState) == "undefined") return;
	
	var obj = { id: 'homepage', pageTitle: title, Url: url, locale: _locale, device: _device, limit: _limit };
	history.pushState(obj, obj.Page, obj.Url);
}

var slider = document.getElementById("truncatePercentage");

// slider.oninput = function() {
slider.onchange = function() {
	// console.log(this.value);
	_chartSummary = this.value;
	var newUrl = paramReplace('chtsum', window.location.href, _chartSummary);
	changeUrl('', newUrl);
	// console.log('calling chtNewUsers');
	var chtData = prepDataForChart();
	chtNewUsers(_newUsersChart, chtData);
}
