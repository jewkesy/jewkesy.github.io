(function(){
    "use strict";
})();


var _bsStartDate = new Date("2020-05-27T02:00:00Z");
var _bsDiff = daydiff(_pqStartDate, new Date(), true);
var _bsLocale = getParameterByName('locale') || '';
var _bsLimit = 0;  //10
var _bsDeviceFilter = '';
var _bsTimeFrom = "";
var _aBSInt; //interval timer for Lambda

window.addEventListener('popstate', function (event) { // Render new content for the hompage
    if (history.state && history.state.id === 'homepage') {
    	// _bsLang = history.state.lang;
    	_bsLocale = history.state.locale;
    	// _bsDevice = history.state.device;
    	// _bsLimit = history.state.limit;
    	// _bsChartSummary = history.state.chartSummary;
    	startBattleShip(_bsLocale);
    }
}, false);

function startBattleShip(locale, limit, device) {
	amazonBSTimer();
}

function amazonBSTimer() {
	getBSGamePlay();
	_aBSInt = setInterval(function () {
		getBSGamePlay();
	}, 30000); // 5000
}

function getBSGamePlay(callback) {
	// TODO Only update if there has been a new game
	async.parallel([
	    function(callback) {
	        buildBSLeague(function () {
	        	callback(null, 'buildBSLeague');
	        });
	    },
	    function(callback) {
	        buildBSLastGames(function () {
	        	callback(null, 'buildBSLastGames');
	        });
	    },
	    function(callback) {
	    	getBSDailyGames(function () {
	    		callback(null, 'getBSDailyGames');
	    	});
	    },
	    function(callback) {
	    	getBSAIStats(function () {
	    		callback(null, 'getBSAIStats');
	    	});
	    }
	],
	function(err, results) {
		if (err) console.error(err);
	    if (callback) return callback();
	});
}

function buildBSLeague(callback) {
	var uri = aws + "?league=true&prefix=bs&limit=" + _bsLimit + "&locale=" + _bsLocale + _bsDeviceFilter;
	httpGetStats(uri, 'bs',  function (err, data) {
		if (!data) return callback();
		// buildPopcornLeague(data, 'pc');
		// console.log(data.league.length)
		fadeyStuff("bs_total_players", displayDots(data.league.length)); 
		if (callback) return callback();
	});
}

function buildBSLastGames(callback) {
	var limit = 10;
	fadeyStuff("bs_lastgames_limit", limit); 
	var uri = aws + "?lastgames=true&prefix=bs&limit=" + limit + "&locale=" + _bsLocale + _bsDeviceFilter;
	httpGetStats(uri, 'bs',  function (err, data) {
		if (!data) return callback();
		console.log(data)
		buildBSLastGamesPreview(data, 'bs');
		if (callback) return callback();
	});
}

function buildBSLastGamesPreview(data, prefix) {
	console.log(data)

	var container = document.getElementById(prefix + '_lastgames');

	if (container.rows.length > 0 && container.rows[0].title == data.lastGames[0]._id) return;

	for (var i = 0; i < data.lastGames.length; i++) {
		var device = ".";
		var deviceIcon = "alexa";
		var game = data.lastGames[i];
		var x = i+1;

		var row = container.insertRow(-1);
		row.id = prefix + '_lastgames_' + x;
		row.title = game._id;
		var cell0 = row.insertCell(0);
		cell0.id = prefix + "_lastgames_device_" + x;

		var cell1 = row.insertCell(1);
		cell1.id = prefix + "_lastgames_tactical_" + x;
		if (game.lg.won) cell1.className = "strong";

		var cell2 = row.insertCell(2);
		cell2.id = prefix + "_lastgames_enemy_" + x;
		if (!game.lg.won) cell2.className = "strong";

		var cell3 = row.insertCell(3);
		cell3.id = prefix + "_lastgames_ts_" + x;
		cell3.className = "timeago";
		cell3.title = new Date(game.lastGame).getTime()/1000;

		var cell4 = row.insertCell(4);
		cell4.id = prefix + "_lastgames_st_" + x;
		cell4.className = "timeago";
		cell4.title = new Date(game.startDate).getTime()/1000;

		fadeyStuff(prefix + "_lastgames_device_" + x, buildIconHTML(deviceIcon, game.locale, device));
		fadeyStuff(prefix + "_lastgames_tactical_" + x, "TACTICAL");
		fadeyStuff(prefix + "_lastgames_enemy_" + x, "ENEMY");
	}
}

function getBSDailyGames(callback) {
	httpGetByUrl(aws + "?getdailygames=true&prefix=bs&limit=0&locale=" + _bsLocale + "&timefrom=" + _bsTimeFrom + _bsDeviceFilter, function (err, data) {
		if (err) console.error(err);
		if (!data) return callback();
		// console.log(data)
		var tots = 0;
		for (var i = 0; i < data.g.length; i++) {
			tots+=data.g[i].games;
		}

		var att = +document.getElementById('bs_total_games').getAttribute("total");
		// console.log(att, tots)
		if (+att !== +tots) {
			// console.log("SETTING", tots)
			document.getElementById('bs_total_games').setAttribute('total', tots);
			fadeyStuff("bs_total_games", displayDots(tots)); 
		}

		return callback();
	});
}

function getBSAIStats(callback) {
	var uri = aws + "?getbsaistats=true&prefix=bs&limit=0&locale=" + _bsLocale + _bsDeviceFilter;
	httpGetStats(uri, 'bs',  function (err, data) {
		if (!data) return callback();
		setAIStats(data);
		if (callback) return callback();
	});
}

function setAIStats(data) {
	// console.log(data)
	var tot = data.w + data.l;
	var humanWidth = percentage(data.w, tot);
	var aiWidth = percentage(data.l, tot);

	document.getElementById('bsBarWins').setAttribute('style', 'width:'+humanWidth+'%');
	document.getElementById('bsBarLoses').setAttribute('style','width:'+aiWidth+'%');

	fadeyStuff("bsBarWins", humanWidth.toFixed(2)+'%');
	fadeyStuff("bsBarLoses", aiWidth.toFixed(2)+'%');

	fadeyStuff("bs_wins", numberWithCommas(data.w));
	fadeyStuff("bs_loses", numberWithCommas(data.l));

}

function displayDots(size) {
	return size;
	var b = "&bull;";
	var retVal = "";
	for (var i = 1; i <= size; i++) {
		retVal += b;
		if (i % 5 === 0)  retVal += " ";
	}
	return retVal;
}

// function reset() {
// 	// console.log(reset)
// 	var today = new Date();
// 	_diff =  daydiff(_startDate, today, true);
// 	_newUsers = {};
// 	_newUsersLabels = [];
// 	_gameinfo = {
// 		dailygames: []
// 	};
// 	_daysSinceLaunch = _diff;
// 	_timeFrom = 0;
// }

// function checkNewDay() { //if new day, rebuild saved stats
// 	console.log("HERE")
// 	var today = new Date();
// 	var diff =  daydiff(_startDate, today, true);
// 	// console.log(diff);
// 	// console.log(_daysSinceLaunch);
// 	if (_daysSinceLaunch > 0 && _daysSinceLaunch != diff) reset();
// }
