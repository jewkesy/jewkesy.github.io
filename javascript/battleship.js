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
	var limit = _pqLimit || 10;
	fadeyStuff("bs_lastgames_limit", limit); 
	var uri = aws + "?lastgames=true&prefix=bs&limit=" + limit + "&locale=" + _bsLocale + _bsDeviceFilter;
	httpGetStats(uri, 'bs',  function (err, data) {
		if (!data) return callback();
		// console.log(data)
		buildBSLastGamesPreview(data, 'bs');
		if (callback) return callback();
	});
}

function buildBSLastGamesPreview(data, prefix) {
	var container = document.getElementById(prefix + '_lastgames');

	if (container.rows.length > 0 && container.rows[0].title == data.lastGames[0]._id) return;

	for (var i = 0; i < data.lastGames.length; i++) {
		var device = ".";
		var deviceIcon = "alexa";
		
		var game = data.lastGames[i];
		console.log(game)
		if (game.device == "EchoShow") device = ":";

		var x = i+1;

		var row = container.insertRow(-1);
		row.id = prefix + '_lastgames_' + x;
		row.title = game._id;
		var cell0 = row.insertCell(0);
		cell0.id = prefix + "_lastgames_device_" + x;

		var cell1 = row.insertCell(1);
		cell1.id = prefix + "_lastgames_tactical_" + x;
		// if (game.lg.won) cell1.className = "strong";

		var cell2 = row.insertCell(2);
		cell2.id = prefix + "_lastgames_enemy_" + x;
		// if (!game.lg.won) cell2.className = "strong";

		var cell3 = row.insertCell(3);
		cell3.id = prefix + "_lastgames_tg_" + x;

		var cell4 = row.insertCell(4);
		cell4.id = prefix + "_lastgames_wl_" + x;

		var cell5 = row.insertCell(5);
		cell5.id = prefix + "_lastgames_ts_" + x;
		cell5.className = "timeago";
		cell5.title = new Date(game.lastGame).getTime()/1000;

		var cell6 = row.insertCell(6);
		cell6.id = prefix + "_lastgames_st_" + x;
		cell6.className = "timeago";
		cell6.title = new Date(game.startDate).getTime()/1000;

		fadeyStuff(prefix + "_lastgames_device_" + x, buildIconHTML(deviceIcon, game.locale, device));
		fadeyStuff(prefix + "_lastgames_tactical_" + x, wrapWithHTML(game.lg.tGrid, 50));
		fadeyStuff(prefix + "_lastgames_enemy_" + x, wrapWithHTML(game.lg.aiGrid, 50));
		fadeyStuff(prefix + "_lastgames_tg_" + x, game.totalGames);
		fadeyStuff(prefix + "_lastgames_wl_" + x, game.totalWins + "/" + game.totalLoses);
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

var flame = "./images/bs_flame.png"
var splash = "./images/bs_ripples.png"
var greenship = "./images/bs_green.png";
var sunkship = "./images/bs_sunk.png";


function getHTMLTop(grids) {
	var width  = 30; // add initial rownums
	var height = 30; // add initial colLetters
	var cellW = 30;
	var cellH = 30;
	var borderW = 1;  //borderWidth
	var spacer = 10;

	if (grids.length == 1) spacer = 0;

	for (var i = 0; i < grids.length; i++) {
		// console.log(grids[i].grid.length)
		width = (grids[i].grid[0].length+1)*cellW + (grids[i].grid[0].length+1)*borderW + width;// + (2*borderW);
		if (i < grids.length-1) width = width + spacer;
	}

	height = ((grids[0].grid.length+1)*cellH)+15 ;//+ (grids[0].grid.length+1)*borderW + height + (2*borderW);

	// console.log("height", height);
	// console.log("width", width);

	var htmlTop = `
	  <html>
	  <head>
	  	<style>
	  		@import url('https://fonts.googleapis.com/css?family=Roboto:300,300i,400,400i,500,500i,700,700i');
	  		`+cssReset+`
	        body { font-family: Roboto, Verdana, Arial; width:  ` + width + `px; height: ` + height + `px; margin: 0px; padding: 0px; text-align: center; }
			table.layout { width: 100% }		
	        table { background-color: #63b4ff; border-collapse: collapse; text-align: center; vertical-align: middle; }
	        table.grid > th, td { border: `+borderW+`px solid maroon; padding: 0px; margin:0px; width: `+cellW+`px; height: `+cellH+`px; min-width:`+cellW+`px; min-height:`+cellH+`px; }

			.bs_stacked-bar-graph {
			  width: 100%;
			  height: 12px;
			  color:#414042;
			}

			.bs_stacked-bar-graph > span {
			    display: inline-block;
			    height:100%;
			    box-sizing: border-box;
			    float: left;
			    font-size: 8pt;
			    padding: 0px;
			    color: white;
			    -webkit-text-stroke: 0.5px #f4f4f4;
			  }

			  .bs_stacked-bar-graph > span.bar-1 {
			    background: #F7B334;
			  }

			  .bs_stacked-bar-graph > span.bar-2 {
			    background: #A7A9AC;
			  }

			  .bs_stacked-bar-graph > span.bar-3 {
			    background: #D57E00;
			  }

	      </style>
	    </head>
	  <body>`;
	  return htmlTop
}

function wrapWithHTML(grid, progress) {
	return "<div style='display: inline-block'>" + buildGrid(grid, progress) + "</div>";
}

function buildGrid(grid, progress) {
	var alphabet = "abcdefghijklmnopqrstuvwxyz";
	var retVal = "<table class='bs_grid'>";

	// for (var i = 0; i < grid[0].length; i++) {
	// 	retVal += "<td>" + alphabet.charAt(i).toUpperCase() + "</td>";
	// }
	var width = 15;
	for (var i = 0; i < grid.length; i++) {
		// retVal += "<tr><td>" + (i+1) + "</td>";
		retVal += "<tr>";
		for (var j = 0; j < grid[0].length; j++) {
			retVal += "<td class='bs_grid'>"
			if (grid[i][j] == 0) retVal += '' //'<img src="'+wave+'" alt="flame" />';
			else if (grid[i][j] == 1) retVal += '<img width="'+width+'px" src="'+greenship+'" alt="ship" />'; //ship untouched
			else if (grid[i][j] == 2) retVal += '<img width="'+width+'px" src="'+splash+'" alt="splash" />'; //miss
			else if (grid[i][j] == 3) retVal += '<img width="'+width+'px" src="'+flame+'" alt="flame" />'; //hit
			else if (grid[i][j] == 4) retVal += '<img width="'+width+'px" src="'+sunkship+'" alt="sunk" />'; //sunk
			else retVal += grid[i][j];
			retVal += "</td>";
		}
		retVal += "</tr>";
	}
	// var progress = 0;
	// var total = 100-progress;

	// retVal += "<tr><td style='border:none !important; height:10px;' colspan='" + grid[0].length+1 + "'><div class='bs_stacked-bar-graph'><span style='width: "+progress+"%; background:green;'>"+progress+"%</span><span style='width: "+total+"%;'></span></div></td></tr>";

	return retVal + "</table>";
}
