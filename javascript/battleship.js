(function(){
    "use strict";
})();


var _bsStartDate = new Date("2020-05-27T02:00:00Z");
var _bsDiff = daydiff(_pqStartDate, new Date(), true);
var _bsLocale = getParameterByName('locale') || '';
var _bsLimit = getParameterByName('limit') || 10;
var _bsDeviceFilter = '';
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
	    }
	],
	function(err, results) {
		if (err) console.error(err);
	    if (callback) return callback();
	});
}

function buildBSLeague(callback) {
	var uri = aws + "?league=true&prefix=bs&limit=" + _pqLimit + "&locale=" + _pqLocale + _pqDeviceFilter;
	httpGetStats(uri, 'bs',  function (err, data) {
		// buildPopcornLeague(data, 'pc');
		console.log(data.league.length)
		if (callback) return callback();
	});
}

function buildBSLastGames(callback) {
	var uri = aws + "?lastgames=true&prefix=bs&limit=" + _bsLimit + "&locale=" + _bsLocale + _bsDeviceFilter;
	httpGetStats(uri, 'bs',  function (err, data) {
		// buildPopcornLastGames(data, 'pc');
		// console.log(data)
		if (callback) return callback();
	});
}

function getBSDailyGames(callback) {
	httpGetByUrl(aws + "?getdailygames=true&prefix=bs&limit=0&locale=" + _pqLocale + "&timefrom=" + _pqTimeFrom + _pqDeviceFilter, function (err, data) {
		if (err) console.error(err);
		if (!data) return callback();
		// console.log(data)
		// buildDailyGames(err, data);
		return callback();
	});
}

function switchLocale(locale) {
	_bsLocale = locale;
	getBSGamePlay();
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
