(function(){
    "use strict";
})();

var _pqLang = getParameterByName('lang') || '';

var _pqLocale = getParameterByName('locale') || '';
var _pqLimit = getParameterByName('limit') || 10;

var _pqDevice = 'ga_aa';
var _pqDeviceFilter = '';

var _popcornUrl = aws + '?action=getstats&prefix=pc&limit=' + _pqLimit;
var _popcornLastGameUrl = aws + '?last=true&prefix=pc&limit=' + _pqLimit;

var _pqStartDate = new Date("2017-05-27T02:00:00Z");
var _pqDiff = daydiff(_pqStartDate, new Date(), true);
var _pqTimeFrom = 0;
var _pqLastTimestamp = 0;
var _pqDoubleDayDivider = 1;
var _pqDaysSinceLaunch = _pqDiff;
var _pqNewUsersChart = new Chart(document.getElementById("pc_cht_new_users").getContext('2d'), { type: 'bar' });
var _pqNewUsers = {};
var _pqNewUsersLabels = [];
var _bonusCounts = 0;
var _pqGameinfo = { dailygames: [] };
var _pqChtHeight = 1000;
var _pqDailyPlayers = [];
var _pqChartSummary = getParameterByName('chtsum') || 95;
var _pqChtData = {};
var _pqDeviceCounts;

var _pqCorrectPhrases = ["Correct!"];
var _pqIncorrectPhrases = ["Incorrect!"];
var _pqAnswerPhrases = ["The answer is &&"];

Chart.defaults.bar.scales.xAxes[0].categoryPercentage = 1;
Chart.defaults.bar.scales.xAxes[0].barPercentage = 1;
Chart.defaults.bar.scales.xAxes[0].gridLines={color:"rgba(0, 0, 0, 0)"};

var _aPQInt;
var _sPQInt;

window.addEventListener('popstate', function (event) { // Render new content for the hompage
    if (history.state && history.state.id === 'homepage') {
    	_pqLang = history.state.lang;
    	_pqLocale = history.state.locale;
    	_pqDevice = history.state.device;
    	_pqLimit = history.state.limit;
    	_pqChartSummary = history.state.chartSummary;
    	startPopcornQuiz(_pqLocale);
    }
}, false);
	
function startPopcornQuiz(locale, limit, device) {
	if (locale && locale.length > 0) _pqLocale = locale;
	getKeywords();
	amazonPQTimer();
	getStats();
	setGameElements(_pqLang);
	document.getElementById('truncatePercentage').value = _pqChartSummary;
	document.getElementById('pc_more_count').innerHTML = _pqLimit;

	if (_pqLocale != '') {
		applyLocaleHeader(_pqLocale, _pqDevice);
		_popcornUrl += "&locale=" + _pqLocale;
	}
}

function amazonPQTimer() {
	getPhrases();
	getIntro();
	getEvent();
	getUpdated();
	checkNewDay();
	getMyRank();
	getGameCalendar();
	_aPQInt = setInterval(function () {
		ga('send', 'pageview', {'page': '/', 'title': ''});
		getPhrases();
		getIntro();
		getEvent();
		getUpdated();
		checkNewDay();
		getMyRank();
		getGameCalendar();
	}, 60000);
}

function statsTimer() {
	_sPQInt = setTimeout(function () {
		clearTimeout(_sPQInt);
		getStats();
	}, 5000);
}

function getStats() {
	httpGetLastPlay(_popcornLastGameUrl, 'pc', function (err, data) {
		if (err) { console.error(err); return statsTimer(); }
		if (data && _pqLastTimestamp < data[0].timestamp) {
			_pqLastTimestamp = data[0].timestamp;
			getPQGamePlay(function () {
				 return statsTimer();
			});
		} else {
			return statsTimer();
		}
	});
}

function getGameCalendar() {
	var events = new Array(10);	
	var d = new Date();
	var ts = d.getTime();

	async.eachOfSeries(events, function(ev, idx, callback){
		var url = aws + "?action=getevents&prefix=pc&locale="+_pqLang;
		if (ts) url += "&timestamp="+ts;
		httpGetByUrl(url, function (err, data) {
			events[idx] = data;
			ts += 86400000;
			return callback();
		});	
	}, function(err) {
		var container = document.getElementById('pc_event_cal');

		while (container.hasChildNodes()) {
		    container.removeChild(container.lastChild);
		}

		for (var i = 0; i < events.length; i++) {
			if (!events[i]) continue;
			if (!events[i].msg || events[i].msg.name == 'default') continue;
			var x = i + 1;
			if (!document.getElementById('pc_event_cal_' + x)) {
				var row = container.insertRow(-1);
				row.id = 'pc_event_cal_' + x;

				var cell0 = row.insertCell(0);
				cell0.id = "pc_event_cal_date_" + x;

				var cell1 = row.insertCell(1);
				cell1.id = "pc_event_cal_multiplier_" + x;

				var cell2 = row.insertCell(2);
				cell2.id = "pc_event_cal_desc_" + x;
			}
			fadeyStuff("pc_event_cal_date_" + x, new Date(events[i].msg.dateNow).toLocaleString('en-En',{weekday: "short", month: "short", day: "numeric"}));
			fadeyStuff("pc_event_cal_multiplier_" + x, (function(){
				if (events[i].msg.multiplier == 3) return "<strong>x"+events[i].msg.multiplier+"</strong>";
				return "x"+events[i].msg.multiplier;
			})() );
			fadeyStuff("pc_event_cal_desc_" + x, (function() {
				return events[i].msg.msg;
			})());
		}
	});
}

function getPQGamePlay(callback) {
	async.parallel([
	    function(callback) {
	        buildPQLeague(function () {
	        	callback(null, 'buildPQLeague');
	        });
	    },
	    function(callback) {
	        buildPQLastGames(function () {
	        	callback(null, 'buildPQLastGames');
	        });
	    },
	    function(callback) {
	    	getPQDailyGames(function () {
	    		callback(null, 'getPQDailyGames');
	    	});
	    }
	],
	function(err, results) {
		if (err) console.error(err);
	    if (callback) return callback();
	});
}

function buildPQLeague(callback) {
	var uri = aws + "?league=true&prefix=pc&limit=" + _pqLimit + "&locale=" + _pqLocale + _pqDeviceFilter;
	httpGetStats(uri, 'pc',  function (err, data) {
		buildPopcornLeague(data, 'pc');
		if (callback) return callback();
	});
}

function buildPQLastGames(callback) {
	var uri = aws + "?lastgames=true&prefix=pc&limit=" + _pqLimit + "&locale=" + _pqLocale + _pqDeviceFilter;
	httpGetStats(uri, 'pc',  function (err, data) {
		buildPopcornLastGames(data, 'pc');
		if (callback) return callback();
	});
}

function getPQDailyGames(callback) {
	httpGetByUrl(aws + "?getdailygames=true&prefix=pc&limit=0&locale=" + _pqLocale + "&timefrom=" + _pqTimeFrom + _pqDeviceFilter, function (err, data) {
		if (err) console.error(err);
		if (!data) return callback();
		buildPQDailyGames(err, data);
		return callback();
	});
}

function switchLocale(locale) {
	_pqLocale = locale;

	applyLocaleHeader(locale, _pqDevice);
	getIntro();
	getKeywords();
	getPhrases();
	document.getElementById('pc_truefalse').setAttribute('style', 'display:none;');
	
	setGameElements(locale);
	
	clearInterval(sInt);
	statsTimer();
	_pqDailyPlayers = [];
	clearLeague('pc_scores', null);
	clearLeague('pc_lastgames', null);
	getPQGamePlay();
}

function switchDevice(device) {
	if (!device) device = "ga_aa";
	_pqTimeFrom = 0;
	if (device == 'Google') {
		_pqDevice = 'ga';
		_pqDeviceFilter = "&device=Google,Google%20Phone,Google%20Surface,Google%20Speaker";
	} else if (device == 'Echo') {
		_pqDevice = 'aa';
		_pqDeviceFilter = "&device=Echo,Echo%20Show,$exists:false";
	} else {
		_pqDevice = 'ga_aa';
		_pqDeviceFilter = "";
	}

	var elements = document.getElementsByClassName('devicelist');
	for(var i=0, l=elements.length; i<l; i++){
	 elements[i].classList.remove("selected");
	}

	document.getElementById("th_"+_pqDevice).classList.add('selected');
	_pqDailyPlayers = [];
	clearLeague('pc_scores', null);
	clearLeague('pc_lastgames', null);
	getPQGamePlay();
	setGameElements(_pqLang);
}

function setGameElements(locale) {
	var l = locale.split('-')[0];
	if (l != "en") document.getElementById("desc_en").classList.add("hidden");

	var el = document.getElementById("desc_"+l);
	if (el) el.classList.remove("hidden");

	fadeyStuff("pc_pq_name", "Popcorn Quiz");
	fadeyStuff("pc_h1_name", "Popcorn Quiz");

	var wakeWord = "Alexa";
	var playWord = ", ";
	if (_pqKeywords) playWord += _pqKeywords.play;
	else playWord += "play";

	if (_pqDevice == 'ga') {
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
	_pqDiff =  daydiff(_pqStartDate, today, true);
	_pqNewUsers = {};
	_pqNewUsersLabels = [];
	_pqGameinfo = { dailygames: [] };
	_pqDaysSinceLaunch = _pqDiff;
	_pqTimeFrom = 0;
}

function checkNewDay() { //if new day, rebuild saved stats
	var today = new Date();
	var diff =  daydiff(_pqStartDate, today, true);
	if (_pqDaysSinceLaunch > 0 && _pqDaysSinceLaunch != diff) reset();
}

function getPhrases() {
	var l = _pqLocale;
	if (l == '') l = 'en-GB';
	var url = aws + "?action=getphrases&prefix=pc&locale="+l;
	httpGetStats(url, 'pc',  function (err, data) {
		if (!data) return;
		_pqAnswerPhrases = data.msg.answerPhrases;

		for (var i = 0; i < data.msg.correct.length; i++) {
			data.msg.correct[i] = data.msg.correct[i].replace('<say-as interpret-as="interjection">', '');
			data.msg.correct[i] = data.msg.correct[i].replace('</say-as>', '');
			data.msg.correct[i] = capitalizeFirstLetter(data.msg.correct[i]);
		}
		_pqCorrectPhrases = data.msg.correct;

		for (var i = 0; i < data.msg.incorrect.length; i++) {
			data.msg.incorrect[i] = data.msg.incorrect[i].replace('<say-as interpret-as="interjection">', '');
			data.msg.incorrect[i] = data.msg.incorrect[i].replace('</say-as>', '');
			data.msg.incorrect[i] = capitalizeFirstLetter(data.msg.incorrect[i]);
		}
		_pqIncorrectPhrases = data.msg.incorrect;
	});
}

function getMyRank() {
	httpGetStats(aws + "?getmyrank=true&prefix=pc&limit=" + _pqLimit + "&locale=" + _pqLocale, 'pc',  function (err, data) {
		if (!data) return;
		fadeyStuff("approxPlayers", numberWithCommas(data.myRank.total));
		fadeyStuff('pc_total_players', numberWithCommas(data.myRank.total));
		fadeyStuff('pc_total_avg', numberWithCommas( Math.round(data.myRank.total/_pqDiff)) );
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

function buildPQDailyGames(err, content) {
	console.log(err, content)
	if (err) {console.error(err); return;}
	if (!content) {console.log('no data'); return;}
	if (!content.g) return;

	updateDeviceTypes(content.g);
	updateBonusPanel(content.g);
	updateBoosterPanel(content.boo);

	_pqChtData = content.g;

	var chtData = prepDataForChart(content.g, calculateHistory(content.g.length));
	chtNewUsers(_pqNewUsersChart, chtData);

	var d = new Date();
    var formattedDate = "d_"+ formatDate(d);

    if (!content.g[content.g.length-1][formattedDate]) return;
	var today = content.g[content.g.length-1][formattedDate].games;
	
	var total = 0;
	var days = 0;
	for (var i = 0; i < content.g.length; i++) {
		if (content.g[i].games === 0) continue;
		total += content.g[i].games;
		for (k in content.g[i]) {
			if (k.indexOf('d_') == 0) days++;
		}
	}

	fadeyStuff("pc_games_today", numberWithCommas(today));

	var avg = Math.round(total/days);
	fadeyStuff('pc_games_avg', numberWithCommas(avg));

	fadeyStuff('pc_total_games', numberWithCommas(total));
	fadeyStuff("approxGames", numberWithCommas(total));		
	document.getElementById('pc_total_games').setAttribute('total', total);
	fadeyStuff('pc_total_today', numberWithCommas(content.g[content.g.length-1][formattedDate].total));
}

function countDevices(obj, stack) {
    for (var property in obj) {
        if (obj.hasOwnProperty(property)) {
            if (typeof obj[property] == "object") {
                countDevices(obj[property], stack + '.' + property);
            } else {
            	if (property.toLowerCase().indexOf('echo') == 0) {
            		_pqDeviceCounts.Echo += obj[property];
            	} else if (property.toLowerCase().indexOf('google') == 0) {
            		_pqDeviceCounts.Google += obj[property];
            	}
            }
        }
    }
}

function updateDeviceTypes(obj) {
	_pqDeviceCounts = {Echo: 0, Google: 0, Total: 0};
	countDevices(obj, '');
	_pqDeviceCounts.Total = _pqDeviceCounts.Echo + _pqDeviceCounts.Google;

	var aWidth = percentage(_pqDeviceCounts.Echo, _pqDeviceCounts.Total);
	var gWidth = percentage(_pqDeviceCounts.Google, _pqDeviceCounts.Total);

	document.getElementById('barAlexa').setAttribute('style', 'width:'+aWidth+'%');
	document.getElementById('barGoogle').setAttribute('style','width:'+gWidth+'%');

	if (aWidth > gWidth) {
		fadeyStuff("barAlexa", aWidth.toFixed(2)+'%');
		fadeyStuff("barGoogle", '');
	} else {
		fadeyStuff("barAlexa", '');
		fadeyStuff("barGoogle", gWidth.toFixed(2)+'%');
	}

	fadeyStuff("pc_pqDevice_alexa", numberWithCommas(_pqDeviceCounts.Echo));
	fadeyStuff("pc_pqDevice_google", numberWithCommas(_pqDeviceCounts.Google));
}

function countBonuses(obj, stack) {
    for (var property in obj) {
        if (obj.hasOwnProperty(property)) {
            if (typeof obj[property] == "object") {
                countBonuses(obj[property], stack + '.' + property);
            } else {
            	if (stack.indexOf(".bonus.") > 0 ) {
            			 if (property == "wins") _bonusCounts.Wins += obj[property];
            		else if (property == "loses") _bonusCounts.Loses += obj[property];
                	else if (property == "skips") _bonusCounts.Skips += obj[property];
            	}
            }
        }
    }
}

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

function updateBoosterPanel(obj) {
	var boos = obj[0].boosterStats;
	if (!boos.booster_30) boos.booster_30 = 0;
	if (!boos.booster_50) boos.booster_50 = 0;
	if (!boos.booster_100)boos.booster_100= 0;

	var boosterTotal = boos.booster_30 + boos.booster_50 + boos.booster_100;
	
	var aWidth = percentage(boos.booster_30, boosterTotal);
	var bWidth = percentage(boos.booster_50, boosterTotal);
	var cWidth = percentage(boos.booster_100,boosterTotal);

	fadeyStuff("pc_booster_30", numberWithCommas(boos.booster_30));
	fadeyStuff("pc_booster_50", numberWithCommas(boos.booster_50));
	fadeyStuff("pc_booster_100",numberWithCommas(boos.booster_100));

	document.getElementById('bar30').setAttribute('style', 'width:'+aWidth+'%');
	document.getElementById('bar50').setAttribute('style','width:'+bWidth+'%');
	document.getElementById('bar100').setAttribute('style','width:'+cWidth+'%');
	if (aWidth > 13) fadeyStuff("bar30", aWidth.toFixed(2)+'%');
	if (bWidth > 13) fadeyStuff("bar50", bWidth.toFixed(2)+'%');
	if (cWidth > 13) fadeyStuff("bar100", cWidth.toFixed(2)+'%');	
}

function buildPopcornLastGames(data, prefix) {
	if(!data) return;

	var container = document.getElementById(prefix + '_lastgames');
	var games = data.lastGame;
	for (var i = 0; i < games.length; i++) {
		var x = i + 1;		
		var sym = "";
		var booster = "";
		var device = ".";
		var deviceIcon = "alexa";
		var g = games[i];

		if (g.d == "Echo Show")    device = ":";
		else if (g.d == "Google")		 { device = ""; deviceIcon = "google"; }
		else if (g.d == "Google Surface"){ device = ":"; deviceIcon = "google"; }
		else if (g.d == "Google Phone")  { device = "."; deviceIcon = "google"; }
		else if (g.d == "Google Speaker"){ device = ""; deviceIcon = "google"; }

		if (g.i == 'star')       {sym = " ⭐";}
		else if (g.i == 'sun')   {sym = " 🌞";}
		else if (g.i == 'note')  {sym = " 🎵";}
		else if (g.i == 'hash')  {sym = " 🌭";}
		else if (g.i == 'phone') {sym = " 📱";}
		else if (g.i == 'en-us') {sym = " 🍔";}
		else if (g.i == 'llama') {sym = " 🦙";}

		if (g.tpb && g.tpb >= 0) {booster = " 🚀";}

		var cell1;
		if (!document.getElementById(prefix + '_lastgames_rank_' + x)) {			
			var row = container.insertRow(-1);
			row.id = prefix + '_lastgames_' + x;

			var cell0 =  row.insertCell(0);
			cell0.id = prefix + "_lastgames_pqDevice_" + x;
			cell1 = row.insertCell(1);
			cell1.id = prefix + "_lastgames_rank_" + x;
			var cell2 = row.insertCell(2);
			cell2.id = prefix + "_lastgames_score_" + x;
			var cell3 = row.insertCell(3);
			cell3.id = prefix + "_lastgames_games_" + x;

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
			cell9.id = prefix + "_lastgames_pqLocale_" + x;
		} else {	
			document.getElementById(prefix + '_lastgames_ts_' + x).title = g.t/1000;
			document.getElementById(prefix + '_lastgames_st_' + x).title = g.st/1000;
		}
		
		fadeyStuff(prefix + "_lastgames_pqDevice_" + x, buildIconHTML(deviceIcon, g.l, device));

		if (g.r == 1) {
			fadeyStuff(prefix + "_lastgames_rank_" + x, "<span class='font26'>🥇</span>" + sym);
		} else if (g.r == 2) {
			fadeyStuff(prefix + "_lastgames_rank_" + x, "<span class='font26'>🥈</span>" + sym);
		} else if (g.r == 3) {
			fadeyStuff(prefix + "_lastgames_rank_" + x, "<span class='font26'>🥉</span>" + sym);
		} else {
			fadeyStuff(prefix + "_lastgames_rank_" + x, numberWithCommas(g.r) + sym);
		}

		var needed = "";
		var boostersLeft = "";
		if (g.tpb || g.tpb ===0) boostersLeft = "<br>🚀 "+numberWithCommas(g.tpb)+"";
		if (g.n && +g.n > -1) needed = "<br/><i>Need:&nbsp;"+numberWithCommas(g.n)+"</i>";

		fadeyStuff(prefix + "_lastgames_score_" + x, numberWithCommas(g.s)+boostersLeft);
		fadeyStuff(prefix + "_lastgames_games_" + x, numberWithCommas(g.ls)+needed);
		
		if (!g.lg) g.lg = "";
		var bonusInfo = "";
		if (g.b) bonusInfo = "<br/>"+g.b.wins+" / "+g.b.loses+" / "+g.b.skips;

		fadeyStuff(prefix + "_lastgames_lg_" + x, g.lg+booster+getGenreEventTitle(g.ge)+bonusInfo);

		if (g.bs) g.gs += "<br/><i>Best:&nbsp;" + numberWithCommas(g.bs) + "</i>"; 
		fadeyStuff(prefix + "_lastgames_gs_" + x, g.gs);

		fadeyStuff(prefix + "_lastgames_ts_" + x, humanTime((g.t/1000)+""));
		fadeyStuff(prefix + "_lastgames_st_" + x, humanTime((g.st/1000)+""));
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
		var booster = "";
		var device = ".";
		var deviceIcon = "alexa";
		if (topTen[i].d == "Echo Show")    device = ":";
		else if (topTen[i].d == "Google")        { device = "";  deviceIcon = "google"; }
		else if (topTen[i].d == "Google Surface"){ device = ":"; deviceIcon = "google"; }
		else if (topTen[i].d == "Google Phone")  { device = "."; deviceIcon = "google"; }
		else if (topTen[i].d == "Google Speaker"){ device = "";  deviceIcon = "google"; }

		if (topTen[i].i == 'star')       {sym = " ⭐";}
		else if (topTen[i].i == 'sun')   {sym = " 🌞";}
		else if (topTen[i].i == 'note')  {sym = " 🎵";}
		else if (topTen[i].i == 'hash')  {sym = " 🌭";}
		else if (topTen[i].i == 'phone') {sym = " 📱";}
		else if (topTen[i].i == 'en-us') {sym = " 🍔";}

		if (topTen[i].tpb || topTen[i].tpb ===0) booster = "<br>🚀 "+numberWithCommas(topTen[i].tpb)+"";
		
		var cell1;
		var needed = "-";
		if (i > 0) needed = (topTen[i-1].s - topTen[i].s)+1;

		if (!document.getElementById(prefix + '_league_' + x)) {
			var row = container.insertRow(-1);
			row.id = prefix + '_league_' + x;
			var cell0 = row.insertCell(0);
			cell0.id = prefix + "_league_pqDevice_" + x;
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
		} else {
			document.getElementById(prefix + '_league_ts_' + x).title = topTen[i].t/1000;
			document.getElementById(prefix + '_league_st_' + x).title = topTen[i].st/1000;
		}
		
		fadeyStuff(prefix + "_league_pqDevice_" + x, buildIconHTML(deviceIcon, topTen[i].l, device));
		
		if (x == 1) 	 fadeyStuff(prefix + "_league_rank_" + x, "<span class='font26'>🥇</span>" + sym);
		else if (x == 2) fadeyStuff(prefix + "_league_rank_" + x, "<span class='font26'>🥈</span>" + sym);
		else if (x == 3) fadeyStuff(prefix + "_league_rank_" + x, "<span class='font26'>🥉</span>" + sym);
		else {
			if (cell1) cell1.className = "font16 strong";
			fadeyStuff(prefix + "_league_rank_" + x, numberWithCommas(x) + sym);
		}
		if (!topTen[i].b) topTen[i].b = {wins:"-", loses:"-", skips:"-"};

		fadeyStuff(prefix + "_league_score_" + x, numberWithCommas(topTen[i].s)+booster);
		fadeyStuff(prefix + "_league_games_" + x, numberWithCommas(needed));
		fadeyStuff(prefix + "_league_bonus_" + x, numberWithCommas(topTen[i].b.wins) + " / " + numberWithCommas(topTen[i].b.loses) + " / " + numberWithCommas(topTen[i].b.skips));
		fadeyStuff(prefix + "_league_ts_" + x, humanTime((topTen[i].t/1000)+""));
		fadeyStuff(prefix + "_league_st_" + x, humanTime((topTen[i].st/1000)+""));
	}
	fadeyStuff(prefix + '_count', numberWithCommas(i));
	document.getElementById(prefix + '_scores').setAttribute('total', total);
}

var _chtStuffRunning = false;
function chtNewUsers(chart, dailyData, total) {	
	if (_chtStuffRunning || dailyData.labels.length == 0) return;
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

			{label:"DailyPlayers", data: dailyData.dailyplayers, borderColor:LightSlateGray, backgroundColor:LightSlateGray, yAxisID: 'left-y-axis', pointRadius:2, type: "line", fill:false},
			{label:"Games", data: dailyData.dailygames, backgroundColor:LightGreen, borderColor:LightGreen, yAxisID: 'right-y-axis', type: "bar", borderWidth: 1},
			{label:"Weekends", data: dailyData.we, backgroundColor:AliceBlue, borderColor:AliceBlue, yAxisID: 'right-y-axis', type: "bar", borderWidth: 1},
			{label:"Months", data: dailyData.mo, backgroundColor:BurlyWood, borderColor:BurlyWood, yAxisID: 'right-y-axis', type: "bar", borderWidth: 1}
		],
		
		options: {
	        legend: { display: isBigEnough() },
			responsive: true, maintainAspectRatio: true, aspectRatio: 0,
			scales: {
				yAxes: [{
	            	id: 'left-y-axis', type: 'linear', position: 'left',
	                ticks: { beginAtZero:true },
	                scaleLabel: { display: true, labelString: "Player Counts" }
	            },{
	            	id: 'right-y-axis', type: 'linear', position: 'right',
	                ticks: { beginAtZero:true },
	                scaleLabel: { display: true, labelString: "Games Per Day" }
	            }]
	        }
		}
    };

	chart.data = data;
	chart.options = data.options;

	chart.update();
	var axis = chart.scales["right-y-axis"];
	_pqChtHeight = axis.max;
	_chtStuffRunning = false;
}

function isBigEnough() {
	var x = document.getElementById('pc_cht_new_users').width || 1200;
	if (x > 1200) return true;
	return false;
}

function prepDataForChart(data, history) {
	data.sort(dynamicSort("month"));
	data.sort(dynamicSort("year"));

	var dailyGames = [];
	var dailyLabels = [];
	var dailyTotals = [];
	var weekends = [];
	var months = [];

	var today = new Date();

	dailyLabels = new Array(_pqDiff).fill("");
	for (var i = 0; i < _pqDiff; i++) {
		var someDate = addDays(_pqStartDate, i);
		var q = someDate.toLocaleDateString().split("/");
		dailyLabels[i] = q[0] + getMonthName(q[1]-1);

		var day = someDate.getDay();
		if (day == 0 || day > 5) weekends.push(_pqChtHeight);
		else weekends.push(null);

        var dt = someDate.getDate();
        if (dt == 1) months.push(_pqChtHeight);
        else months.push(null);
	}
	dailyLabels[0] = "Launch";
	dailyLabels[_pqDiff-1] = "Today";

	var uk = new Array(_pqDiff).fill(null);
	var us = new Array(_pqDiff).fill(null);
	var de = new Array(_pqDiff).fill(null);
	var ind= new Array(_pqDiff).fill(null);
	var ca = new Array(_pqDiff).fill(null);
	var jp = new Array(_pqDiff).fill(null);
	var au = new Array(_pqDiff).fill(null);
	var fr = new Array(_pqDiff).fill(null);
	var es = new Array(_pqDiff).fill(null);
	var it = new Array(_pqDiff).fill(null);
	var mx = new Array(_pqDiff).fill(null);
	var esla=new Array(_pqDiff).fill(null);
	var br = new Array(_pqDiff).fill(null);
	var dk = new Array(_pqDiff).fill(null);

	var counter = 0;
	for (var i = 0; i < data.length; i++) {
		var month = data[i];
		var monthGames = month.games;
		
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
		    						break;
		    				}
            			}
            		}
            	}
            	
	        }
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
	return dailyData;
}

function resetLimit() {
	_pqLimit = 10;
	document.getElementById('pc_more_count').innerHTML = _pqLimit;
	var newUrl = paramReplace('limit', window.location.href, _pqLimit);
	if (newUrl.indexOf('#pc_league') === -1) newUrl = newUrl + '#pc_league';
	changeUrl('', newUrl);
	clearLeague('pc_scores', buildPQLeague());
	clearLeague('pc_lastgames', buildPQLastGames());
}

function increaseLimit() {
	_pqLimit = _pqLimit * 2;
	document.getElementById('pc_more_count').innerHTML = _pqLimit;
	var newUrl = paramReplace('limit', window.location.href, _pqLimit);
	if (newUrl.indexOf('#pc_league') === -1) newUrl = newUrl + '#pc_league';
	changeUrl('', newUrl);
	buildPQLeague();
	buildPQLastGames();	
}

function getIntro() {
	httpGetByUrl(aws + "?action=getintro&prefix=pc&locale="+_pqLang, function (err, data) {
		if (!data) return;
		if (data.msg.text == ". ") data.msg.text = "Ok!";
		if (cachedQuestions.length == 0) fadeyStuff("pc_intro", data.msg.text);
		getQuestions(15, data.msg.genre);
	});	
}

function getUpdated() {
	var count = 10;
	var url = aws + "?action=getupdated&prefix=pc&locale="+_pqLang+"&count="+count;
	httpGetByUrl(url, function (err, data) {
		if (!data || !data.msg || data.msg.length == 0) return;
		buildUpdated(data);
	});
}

function buildUpdated(data) {
	var parent = document.getElementById('pc_recent_trivia');
	var att = parent.getAttribute("last_updated")
	if (data.msg[0].imdbID == att) return;
	parent.innerHTML = "";

	for (var i = 0; i < data.msg.length; i++) {
		var m = data.msg[i];
		var dt = new Date(m.m).getTime()/1000;
		if (m.type == "actors") {
			if (m.pic) m.Poster = m.pic;
			if (m.name) m.Title = m.name;
		} else {
			if (m.poster) m.Poster = m.poster;
		}

		if (m.Poster == "N/A" || m.Poster == "NA") m.Poster = "./images/popcorn_s.png";
		var img = document.createElement("img");
		img.classList.add("posterThumb");
		img.src = m.Poster;
		var imgDiv = document.createElement("div");
		imgDiv.setAttribute('style', 'float:left;margin-right:4px;');
		imgDiv.appendChild(img);

		var span = document.createElement("span");
		span.innerHTML = m.Title;
		if (m.Year) span.innerHTML += " (" + m.Year + ")";

		span.innerHTML += "<br/><i class='timeago' style='white-space: nowrap; min-width: 105px;' title='" + dt+ "'>"+ humanTime(dt+"") + "</i>"

		var container = document.createElement("div");
		container.classList.add("updatedMovie");
		container.setAttribute("id", "pc_recent_trivia_"+i);
		container.setAttribute('style', 'display:none; min-width: 155px;');

		container.appendChild(imgDiv);
		container.appendChild(span);

		parent.appendChild(container);

		fadeyElement("pc_recent_trivia_"+i);
	}
	parent.setAttribute("last_updated", data.msg[0].imdbID)
}

function getEvent(ts) {
	var url = aws + "?action=getevents&prefix=pc&locale="+_pqLang;
	if (ts) url += "&timestamp="+ts;
	httpGetByUrl(url, function (err, data) {
		if (!data) return;
		fadeyStuff("pc_event", data.msg.exitMsg || data.msg.msg);
	});
}

function calculateHistory(historyLength) {
	if (!_pqChartSummary || _pqChartSummary > 10) return -10;

	if (_pqChartSummary==10) return -10;
	if (_pqChartSummary==0) return 0;
	var d = (_pqDiff/10)*_pqChartSummary;
	var p = (_pqDiff) - d;
	return Math.abs(+p) * -1
}

function changeUrl(title, url) {
	if (typeof (history.pushState) == "undefined") return;
	
	var obj = { id: 'homepage', pageTitle: title, Url: url, locale: _pqLocale, device: _pqDevice, limit: _pqLimit };
	history.pushState(obj, obj.Page, obj.Url);
}

var slider = document.getElementById("truncatePercentage");

slider.onchange = function() {
	_pqChartSummary = this.value;
	var newUrl = paramReplace('chtsum', window.location.href, _pqChartSummary);
	changeUrl('', newUrl);
	_pqChtHeight = 1000;
	var chtData = prepDataForChart(_pqChtData, calculateHistory(_pqChtData.length));
	chtNewUsers(_pqNewUsersChart, chtData);
}
