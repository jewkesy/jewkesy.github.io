"use strict";

const flame = "data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RkMxOTAwNUVBODIxMTFFN0JCNzE4MDU3RDQ4NzZFODIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RkMxOTAwNUZBODIxMTFFN0JCNzE4MDU3RDQ4NzZFODIiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpGQzE5MDA1Q0E4MjExMUU3QkI3MTgwNTdENDg3NkU4MiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpGQzE5MDA1REE4MjExMUU3QkI3MTgwNTdENDg3NkU4MiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PkH9+coAAARcSURBVHjarFZNbBtFFH4zu7bXdtqkNDRpk7bEtE1FgdJSKLQgiqhAPSHoCVqKkBACUQFC4saFAxIHQHAAgbghEBzoBTiAeoITqCCKSg8tSCDRJJAQJ27c+mezs3xvdhyPN15jh4z0aXdnZue9971v3owov9VH/7PdCjwGvNDLT7KHuWsBp03/j8CDQAUYXm3DdwGvAkHC+HuAB/wKbF1Nw58BOzqM/2aenLdvAHc1DN8NDAGpDnNy1jtH/NpqGL7PPO8FtiTMORz7ftJQ37VhpmpNrG/Eev8wwbETsb5+4GAvhp8Adsb6Ktb7PcDvwIvAQ8DbwOmEtbd3MmyL4E6zF6+PzTkb+74OeKPL7ddVxK8D+TZzvlphYal2Y7gAHABm28yZBH5ZgeGpbqh+xDzHjMDKsXmZFRg+36aP19kPTHDENwAPmIEs8Gxs8sMtQhGCKFQU1mudjM4BF9v08/rPAYc44j3AbmuQN/9G4GvgCHCy5dcgIJHxSOb7aHFmmkQ6DSCQMLRn/QEstjE8DhzlSuea/MYV+LzB8gYD4aJP2X37SZVKVD33E6nKVZLZvGbCtHoCE483eGOqr+kpc45DqrxAQWmenBt3U+7gIZJgIKxWojREbZfRit04t8+Yd08mULIUXYzC5hCM0/wcifWD5O25jUjh4FLKroCngFFTx48B31q/K6Z6etmq7DlyyZSKNJdc27iIPpksnseRD28id9Mo+ZOXQPnSeXE/8GdCSEWO+ILZqy2RKqg2s20cC2UpDKxjmPMoBTkDA+BqcckpZ3CDHXGndpnLLhv+AThjR6uulCmFCFL7UEWlpLBiyjUWDuavYGwzyQ0Qfq0WMQAH2EHhuC2shewYO93MfePGckaaaD+3t4vE9siMQx9+ndJj23SEwUJZ7910YQt5t+yNom2oGA6JVFoLr6GJEE45a/ux7dZEDjTbF8xyo2R+aiggBXW6I5tJDKxDJv5B/jZSHsrN3gQF336APM0CDNSqzUgCROxltYNhva4dUgtwurAda41GijczgY/sWn0VeLORXwdKjfKFhStVkuuvpdTOXSSHQC8vwhRL2VJUKJfTmmBBKqQmMz5GztYxkrm82bW68TE6Ez8WX4HREyKTKejJvt+MqFpZrvplZ1GVUoUd5PSvi9I1hAsnomcmpOdxINNw9uX2FwGljgk3FeVLBb0dCcwQNCChbontpVlBOhAIbmspsK+O25eK+A3kO0T9KDkyymNC8Wjb9OERRuyghGrhscqj/qeRtdPJV59o0ieqWDyuF8EBsOLmprVEgrniU2DjfRFLj0yoxR8HU5duRt4mSW8Tt6darh2u12aDqYk71OXSB8JxurveCuRE1Wrn/L8mR9TszEnya/N6QfQv0WezZI/5fhn/vORPTQxC3d/zWv912WtWRWOcS2VQKr6DY+9dqPMIhHKUXHcvKtQwaOyLypwqh379bxSUn+HsKezZL1E8AuFiaUZCGf1XgAEAddZ6axBdZ8EAAAAASUVORK5CYII="
const splash = "data:image/png;base64,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"
const greenship = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAABmJLR0QA/wD/AP+gvaeTAAAAB3RJTUUH5AQQBgUh0QuawgAABBJJREFUSMd9V0GSI0UMzFSVbeAXHPYN+wiCExeORBC8g+ADcOBCBPyCI6d9AW8ggk+s3aXkIKmqumcDe3rctmtKylSmSsP3H959bs1+6q1/06y5wSAIkiQI7g7J4RBcDkmQHABiHQBI2B+q3/FDwSWJEtxov/397z+/9EOvX+94fH/vD79bN2MDSQCMIJEEJM/7CAjNsBk3gxMzqVgWCbscQ0PDx8/vv3yH7vJvb+2GR7vj0R/qdkOzBoIgF5hCwdgPknZsC2EFnkk7hg8MDRx++MfjY3uO53cdxGdmhm7dbu2GW7ujW4fBEvlCMancEe70XtgopoYOvPzAazzNI5EvOkERBjNDY8PNOrrd0NhAC8rJc4QKyUl2JFcJRUBNmoc3AAZJaHyCpDpBGAmjwazB2NAsLtISLMFCdUUPzQ8JQay6Cy7BfQAAmhzmsScA9jNhW/pR5biLxTMU5xrlu0qL+Z3gEAiBJpgIMi6FO9RBBU0EQAGWr/PaNqU+kcCyUwkL+WdUiBEGYAhiOMPh6Ev6myC25+SAmpg8dF18RIKb3kSsOu/PspYP9D1EeNQzJ8vNtRGYZG4eruDiYqC8nrQinsvPLkeXBLmyO9UCAfKJigAkpniqtpvTFDA9mQEAn6oeGPJ49fC0y9FBJO+hSGV4TDxXzKupTK0z7lV/lh3Oa184nIvLoYEurbRVVMA371TwtIpXzbmahoR0SSpME4zDs8dnGtlU+lq0gg6NDBQbrdpllgvoaipDmWC5K328gZFGvldQnUWaqJW6dfHc9Ke4ptK27y81n4L1dcWuAIS+rJcZQmAWqw6JN3K6dh2tpGZO4VA4lminewD0ibUWyUEtOnc8mvzyLDKdrVUrfKNbSXF5u7PsQWGvt6SMnYeESlxlqZNpoyWKSdPKW2XRwpqY+maAJf2pZaQnC56iK/naoGrCkwtWSXKOSauu9X06VEtYEGf73xMrdHO6KIKllazK8Vvgk7gCUjfmgZ/lcQCW2+xhSxzcapsFXs1GgpHYijRJLrGShBnRyaXHys63jjVtdunpy9x7igwLbuf3HJOqxNnlOmmlhxmg7uZ8tQVftK9g3O9SZCFIntJGIqZZqbrqEcJRuYJ7OtoCXo1cARUbZ+tkaWKOQshOOMWleWxtPW/rQNqQ781kI1Ulrvq0EsgxaGOMIHsp2t0xNqvMg+NK8RRXbsIT0djDVp+f85cG6pTp0SoHhoeYLKS3QpX/tsP/U481jeTEtHl6TpzuGGmrfvhxcLA5nHROa52nq3141/8EXnirYKX8CCwNHxw+nv05nn8d4/W1WXMStlrS5b+EN5I6nUeXqZcni1XTKdSC/9lf/vzBh/8h6CsQx7VxnO6ka4TzUvJNAlijPlOAv7fefvwP7a7X70nQInwAAAAldEVYdGRhdGU6Y3JlYXRlADIwMjAtMDQtMTZUMDY6MDU6MzMtMDc6MDCD5hv0AAAAJXRFWHRkYXRlOm1vZGlmeQAyMDIwLTA0LTE2VDA2OjA1OjMzLTA3OjAw8rujSAAAAABJRU5ErkJggg==";
const sunkship = "data:image/png;base64,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";
const alphabet = "abcdefghijklmnopqrstuvwxyz";

let alexaVersion = '1.0';
let alexa;

let debugMode = false;
if (!debugMode) document.getElementById('debug').classList = ['opacityZero'];

let defaultAudiolevel = 0.6;
let quietAudiolevel = 0.4;
let backgroundAudio=document.getElementById("bgAudio");
// backgroundAudio.pause();  //TODO TOGGLE WHEN LIVE
duckAudio(defaultAudiolevel);



const success = function(result) {
	// const {alexa, message} = result;
	// Actions after Alexa client initialization is complete
	debugMe("LOADED");
	showIntro();
	initialiseGameBoards(result.message);
	alexa = result.alexa;
	alexa.speech.onStarted(speechStarted);
	alexa.speech.onStopped(speechStopped);
	alexa.skill.onMessage(skillOnMessage);
	alexa.skill.sendMessage(skillSendMessage);
	alexa.voice.onMicrophoneOpened(micOnOpened);
	alexa.voice.onMicrophoneClosed(micOnClosed);

	alexa.performance.getMemoryInfo().then((memoryInfo) => {
		const minimumRequiredMemoryAtStart = 400;
		const {availableMemoryInMB} = memoryInfo;
		if (availableMemoryInMB <= minimumRequiredMemoryAtStart) {
		// Gracefully exit game, device unsupported
			console.log("MEMORY CHECK - Gracefully exit game, device unsupported")
		} else {
		// Continue with game
			console.log("MEMORY CHECK - Continue with game")
		}
	}).catch((error) => {
		const {message} = error;
		console.log('Failed to retrieve memory. ' + message);
		// Gracefully exit game
	});
	alexa.performance.getMemoryInfo();
	
	console.log(alexa)
	console.log(alexa.capabilities)

	// document.getElementById('loading').style.opacity = 0;
	// document.getElementById('ping').addEventListener('click', () => skillSendMessage({ cmd:'ping'}));
	try {
		document.getElementById('micOpen').addEventListener('click', () => micOnOpened());
		document.getElementById('micClose').addEventListener('click', () => micOnClosed());
		document.getElementById('toggleAudio').addEventListener('click', () => toggleAudio());
	} catch {}
};

const failure = function(error) {
	const {code, message} = error;
	// Actions for failure to initialize
	debugMe(error);
	console.log(error)
};
try {
	//debugMe("window.alexaHtmlLocalDebug: " + window.alexaHtmlLocalDebug);
	if (window.alexaHtmlLocalDebug) {
	  // both alexaHtmlLocalDebug and LocalMessageProvider are injected into the page by alexa-html-local
	  	Alexa.create({ version: alexaVersion, messageProvider: new LocalMessageProvider() }).then(success).catch(failure);
	} else {
		Alexa.create({ version: alexaVersion }).then(success).catch(failure);
	}
} catch (err) {
	console.log("Alexa Load Error", err)
}

function gridPressEvent(evt) {
	console.log(evt.target)
	if (evt && evt.target && evt.target.type == 'gridPress') {
		console.log("CLICKED", evt)
	}
}

function showIntro() {
	var intro = document.getElementById('intro');
	intro.classList.add('animate__animated', 'animate__fadeOut', 'animate__delay-3_0s');

	var ship = document.getElementById('intro_ship');
	ship.classList.add('animate__animated', 'animate__zoomInUp');
	ship.innerHTML = "<img src='./images/ship.png' class='animate__animated animate__zoomInUp' />";

	var logo = document.getElementById('intro_logo');
	logo.classList.add('animate__animated', 'animate__zoomInUp');
	logo.innerHTML+= "<img src='./images/Battle-Ship.png' class='animate__animated animate__zoomInUp' />";

	intro.addEventListener('animationend', (evt) => {
		if (evt.animationName == 'fadeOut') {
			console.log('COMPLETE');
			intro.style.setProperty('display', 'none');
			var gameSection = document.getElementById('game');
			gameSection.style.setProperty('display', 'inline');
		}
	});
}

function buildSummaryHtml(results) {

	let retVal = `<div class='gridRow'><div id='summaryLeft'>Round Accuracy: ${results.accuracy}%
					<br/>Round Score: ${results.score}
					<br/>Game Streak: ${results.gameStreak}
					<br/>Total Won: ${results.totalWins}</div>
				  <div id='summaryRight'>Avg. Accuracy: ${results.avgAccuracy}%
					<br/>Total Score: ${results.totalScore}
					<br/>Max Game Streak: ${results.highestGameStreak}
					<br/>Total Lost: ${results.totalLoses}</div>
				  </div>
				  <div class='clear spacer'></div>
				  <div>Rank: <strong>${results.rank}</strong>
				    <br/>Reach a score of <strong>${results.nextPromotionScore}</strong> for promotion to <strong>${results.nextPromotion}</strong></div>
				  <div class='clear spacer'></div>
				  <div><i>Yes</i> or <i>No</i>, would you like to play another round?</div>
				  <div class='clear spacer'></div>
				  <div>Visit <strong><i>www.daryljewkes.com</i></strong> to view your rank against other BattleShip players.</div>
				  `
	return retVal
}

function showSummary(won, summaryHTML) {
	var summary = document.getElementById('summary');
	summary.classList.add('animate__animated', 'animate__fadeIn', 'animate__delay-4_0s');
	summary.style.setProperty('display', 'inline');
	
	summary.addEventListener('animationend', (evt) => {
		if (evt.target.id != 'summary') return;

		// console.log("ENDED", evt.animationName,  evt.target.id)
		if (evt.animationName == 'fadeIn') {
			var ship = document.getElementById('summary_ship');
			ship.classList.add('animate__animated', 'animate__zoomInUp')
			ship.innerHTML = "<img src='./images/ship.png' />";
			
			ship.addEventListener('animationend', (evt) => {
				if (evt.target.id != 'summary_ship') return;
				ship.classList = [];
				// console.log("ENDED", evt.animationName,  evt.target.id)
				if (evt.animationName == 'zoomInUp') {
					if (won) ship.classList.add('animate__animated', 'animate__backOutRight', 'animate__delay-2_0s');
					else {
						ship.classList.add('animate__animated', 'animate__rotateOutDownLeft', 'animate__delay-2_0s');
						addAction(document.getElementById('summary_action'), "explosion-cloud", 'actionCenter' + ' action animate__animated animate__fadeIn', 'animate__delay-1s', '0.5s', '70vh', '70vw', '40px');
					}
					var resultDisplay = document.getElementById('summary_result');
					resultDisplay.classList.add('animate__animated', 'animate__fadeIn', 'animate__delay-2_0s');
					resultDisplay.innerHTML = summaryHTML;
				} else if (evt.animationName == 'backOutRight' || evt.animationName == 'rotateOutDownLeft') {
					ship.innerHTML = "";
				}
			})

			var logo = document.getElementById('summary_logo');
			if (won) logo.innerHTML+= "<img src='./images/YouWin.png' class='animate__animated animate__zoomInUp' />";
			else logo.innerHTML+= "<img src='./images/YouLose.png' class='animate__animated animate__zoomInUp' />";
		}
	});
}

function initialiseGameBoards(msg) {
	debugMe(JSON.stringify(msg, null, 2));
	if (!msg) return;
	console.log(msg)
	
	// var tacticalGrid = msg.grids[0].url;
	// var playerFleet  = msg.grids[1].url;
	loadGrid('tacticalGrid', "animate__animated animate__zoomInUp", msg.gameObj.playerGameGrid, msg.gameObj.progress.playerProgress, true);
	loadGrid('playerFleet', "animate__animated animate__zoomInUp", msg.gameObj.playerGrid, msg.gameObj.progress.computerProgress, false);
}

function speechStarted(msg){
	debugMe("SPEECH STARTED");
	debugMe(JSON.stringify(msg, null, 2));
	console.log("SPEECH STARTED");
	duckAudio(quietAudiolevel);
}

function speechStopped(msg) {
	debugMe("SPEECH STOPPED");
	debugMe(JSON.stringify(msg, null, 2));
	console.log("SPEECH STOPPED");
	duckAudio(defaultAudiolevel);
}

function skillOnMessage(msg) {
	console.log("ON MESSAGE", msg)
	// console.log(msg.sessionAttributes.gameObj)
	debugMe("skillOnMessage");
	debugMe(JSON.stringify(msg, null, 2));
	// if (msg.description) document.getElementById('description').innerText = new Date()+ " "+ msg.description;
	if (msg.gameObj) {
		clearHTML();
		handleGameAction(msg);
	}
}

function loadGrid(id, cssClass, gameGrid, progress, touchMode) {
	// console.log(gameGrid, progress)
	var eleGrid = document.getElementById(id);
	eleGrid.innerHTML = "";

	var size = 30; // if Echo Show, switch to 50?
	var style = ' width="'+size+'px" height="'+size+'px" ';

	var table = document.createElement('table');
	table.classList = [cssClass]
	table.classList.add('board')
	table.classList.add('board'+size)
	table.style.setProperty('width', size+'px');
	table.style.setProperty('height', size+'px');

	var tr = document.createElement('tr'); 
	var td = document.createElement('td');
	tr.appendChild(td);
	for (var i = 0; i < gameGrid.length; i++) {
		var td = document.createElement('td');
		var txt = document.createTextNode(alphabet.charAt(i).toUpperCase());
		td.appendChild(txt);
		tr.appendChild(td);
	}
	table.appendChild(tr);


	for (var i = 0; i < gameGrid.length; i++) {
		var tr = document.createElement('tr'); 
		var td = document.createElement('td');
		var txt = document.createTextNode(i+1);
		td.appendChild(txt);
		tr.appendChild(td);
		for (var j = 0; j < gameGrid[0].length; j++) {
			var td = document.createElement('td');
			td.classList = ['boardCell'];

			if (gameGrid[i][j] == 0) {
				var span = document.createElement('span');
				span.style.setProperty('width', size+'px');
				span.style.setProperty('height', size+'px');
				span.setAttribute("type", "gridPress");
				span.setAttribute("col", alphabet.charAt(i).toUpperCase());
				span.setAttribute("row", j+1);
				if (touchMode) {
					span.addEventListener('click', (evt) => gridPressEvent(evt));
				}
				td.appendChild(span);
			} else {
				var img = document.createElement('img');
				img.style.setProperty('width', size+'px');
				img.style.setProperty('height', size+'px');
				if (gameGrid[i][j] == 1) {
					img.setAttribute("src", greenship);
					img.setAttribute("alt", "ship");
				} else if (gameGrid[i][j] == 2) {
					img.setAttribute("src", splash);
					img.setAttribute("alt", "splash");
				} else if (gameGrid[i][j] == 3) {
					img.setAttribute("src", flame);
					img.setAttribute("alt", "flame");
				} else if (gameGrid[i][j] == 4) {
					img.setAttribute("src", sunkship);
					img.setAttribute("alt", "sunk");
				}
				td.appendChild(img);
			}
			tr.appendChild(td);
		}
		table.appendChild(tr);
	}

	var total = 100-progress;

	var tr = document.createElement('tr'); 
	var td = document.createElement('td');
	td.style.setProperty('height', '10px');
	td.setAttribute("colspan", gameGrid.length+1);

	var div = document.createElement('div');
	div.classList = ['stacked-bar-graph']

	var spanP = document.createElement('span');
	spanP.style.setProperty('background', 'green');
	spanP.style.setProperty('width', progress+'%');
	var txt = document.createTextNode(progress+'%');
	spanP.appendChild(txt);

	var spanW = document.createElement('span');
	spanW.style.setProperty('width', total+'%');

	div.appendChild(spanP)
	div.appendChild(spanW)

	td.appendChild(div);
	tr.appendChild(td);
	table.appendChild(tr);

	eleGrid.appendChild(table);
}


function clearHTML() {
	document.getElementById('playerAction').innerHTML = '';
	document.getElementById('computerAction').innerHTML  = '';
	document.getElementById('playerActionResult').innerHTML = '';
	document.getElementById('computerActionResult').innerHTML = '';
}

function handleGameAction(msg) {
	console.log(msg)
	debugMe(JSON.stringify(msg, null, 2));
	
	var playerAction = msg.gameObj.playerAction;
	var playerActionDisplay = playerAction.action.toLowerCase();
	if (playerActionDisplay == 'won' || playerActionDisplay == 'sunk') playerActionDisplay = 'hit';
	else if (playerActionDisplay == 'outtabounds' || playerActionDisplay == 'dupe') return;

	document.getElementById('playerAction').innerHTML  = '<div class="animate__animated animate__fadeIn"><span class="coords">'+playerAction.coords.l.toUpperCase()+playerAction.coords.n+'</span><img alt="'+playerActionDisplay+'" style="height:50%; max-height:50%;" src="./images/' + playerActionDisplay +'.png"/></div>';

	// var tacticalGrid = msg.grids[0].url;
	// var playerFleet  = msg.grids[1].url;

	loadGrid('tacticalGrid', "animate__animated animate__zoomInUp", msg.gameObj.playerGameGrid, msg.gameObj.progress.playerProgress, true);

	var delay = 'animate__delay-4_7s'; // blank out if player won
	if (msg.gameObj.gameOver) {
		var last = msg.gameObj.lastAction[msg.gameObj.lastAction.length-1];
		if (last.action == "WON") {
			delay = '';
		}
	}

	loadGrid('playerFleet', "animate__animated animate__zoomInUp "+delay, msg.gameObj.playerGrid, msg.gameObj.progress.computerProgress, false);

	var playerActionResult = "explosion-cloud";

	if (playerActionDisplay == 'miss') playerActionResult = "water-splash";
	var elePlayerActionResult = document.getElementById('playerActionResult');
	var eleComputerActionResult = document.getElementById('computerActionResult');

	addAction(elePlayerActionResult, playerActionResult, 'action actionLeftSide animate__animated animate__fadeIn', 'animate__delay-0_1s', '0.5s')

	delay = 'animate__delay-4_7s';
	if (msg.gameObj.gameOver) {
		var last = msg.gameObj.lastAction[msg.gameObj.lastAction.length-1];
		if (last.action == "WON") {
			var summaryHTML = buildSummaryHtml(msg.results);
			if (last.whoShot == "player") {
				addFleetDestroyed(elePlayerActionResult, 'actionLeftSide');
				showSummary(true, summaryHTML);
			} else {
				delay = 'animate__delay-0_1s';
				addFleetDestroyed(eleComputerActionResult, 'actionRightSide');
				showSummary(false, summaryHTML);
			}
			return;
		}
	} 

	var computerAction = msg.gameObj.computerAction;
	var computerActionDisplay = computerAction.action.toLowerCase();
	if (computerActionDisplay == 'won' || computerActionDisplay == 'sunk') computerActionDisplay = 'hit';
	document.getElementById('computerAction').innerHTML  = '<div class="animate__animated animate__fadeIn '+delay+'"><img alt="'+computerActionDisplay+'" style="height:50%; max-height:50%;" src="./images/' + computerActionDisplay +'.png"/><span class="coords">'+computerAction.coords.l.toUpperCase()+computerAction.coords.n+'</span></div>';

	var computerActionResult = "explosion-cloud";
	if (computerActionDisplay == 'miss') computerActionResult = "water-splash";

	addAction(eleComputerActionResult, computerActionResult, 'action actionRightSide animate__animated animate__fadeIn', delay, '0.5s');
}

function addFleetDestroyed(parentNode, cssSide) {
	addAction(parentNode, "explosion-cloud", cssSide + ' action animate__animated animate__fadeIn', 'animate__delay-1s', '0.5s', '70vh', '70vw', '40px');
	addAction(parentNode, "explosion-cloud", cssSide + ' action animate__animated animate__fadeIn', 'animate__delay-0_9s', '0.5s', '80vh', '60vw', '10px');
	addAction(parentNode, "explosion-cloud", cssSide + ' action animate__animated animate__fadeIn', 'animate__delay-0_7s', '0.5s', '50vh', '50vw', '20px');
	addAction(parentNode, "explosion-cloud", cssSide + ' action animate__animated animate__fadeIn', 'animate__delay-0_4s', '0.5s', '30vh', '30vw');
	addAction(parentNode, "explosion-cloud", cssSide + ' action animate__animated animate__fadeIn', 'animate__delay-0_2s', '0.5s', '40vh', '40vw', '140px');	
}

function addAction(parentNode, imgSrc, classes, delay, duration, height, width, paddingLeft) {
	console.log(parentNode, imgSrc, classes, delay, duration, height, width, paddingLeft)
	var img = document.createElement("img");
	img.id =  delay+"_"+duration+"_"+height+"_"+width+"_"+paddingLeft
	img.src = './images/'+imgSrc+'.png';
	var style = '';
	if (duration) style += "--animate-duration:"+ duration + ";";
	if (height)	style += " height:" + height + ";";
	if (width)	style += " width:" + width + ";";
	if (paddingLeft) style += " padding-left:" + paddingLeft + ";"
	img.style = style;
	// console.log(img.style)
	img.classList = classes;
	if (delay) img.classList.add(delay);
	
	img.addEventListener('animationend', (evt) => {
		if (evt.animationName == 'fadeIn') {
			img.style.setProperty('--animate-duration', '1s');
			if (delay) img.classList.remove('animate__fadeIn', delay)
			img.classList.add('animate__rubberBand', 'animate__delay-0_3s');
		} else if (evt.animationName == 'rubberBand') {
			img.classList.remove('animate__rubberBand')
			img.classList.add('animate__bounceOut');
		} else if (evt.animationName == 'bounceOut') {
			console.log("ANIMATION END")
			img.style.setProperty('display', 'none')
		}
	});
	parentNode.appendChild(img);
}

function skillSendMessage(msg) {
	debugMe("SEND MESSAGE");
	debugMe(JSON.stringify(msg, null, 2));
	console.log("SEND MESSAGE", msg)
	alexa.skill.sendMessage(msg);
}

function duckAudio(level) {
	if (!backgroundAudio) backgroundAudio=document.getElementById("bgAudio");
	// console.log(backgroundAudio.volume)

	const soundMultiplier = 5000; 

	if (level == backgroundAudio.volume) return;

	if (level > backgroundAudio.volume) {
		console.log("VOLUME UP", level, backgroundAudio.volume)
		for (var i = backgroundAudio.volume*soundMultiplier; i <= level*soundMultiplier; i++) {
			backgroundAudio.volume = i/soundMultiplier;
		}
	} else {
		console.log("VOLUME DOWN", level, backgroundAudio.volume)
		level = level*soundMultiplier;
		var i = backgroundAudio.volume*soundMultiplier;
		while (i > level) {
			backgroundAudio.volume = i/soundMultiplier;
			i--;
		}
	}
}

// function buildGrid(grid, progress, cssClass, touchMode) {
// 	var size = 30; // if Echo Show, switch to 50?
// 	var retVal = "<table class='board board"+size+" "+cssClass+"'><tr><td></td>";

// 	var style = ' width="'+size+'px" height="'+size+'px" ';

// 	for (var i = 0; i < grid[0].length; i++) {
// 		retVal += "<td>" + alphabet.charAt(i).toUpperCase() + "</td>";
// 	}

// 	for (var i = 0; i < grid.length; i++) {
// 		retVal += "<tr><td>" + (i+1) + "</td>";
// 		for (var j = 0; j < grid[0].length; j++) {
// 			retVal += "<td class='boardCell'>"
// 			if (grid[i][j] == 0) retVal += '<span type="gridPress" '+style+' />' //'<img src="'+wave+'" alt="flame" />';
// 			else if (grid[i][j] == 1) retVal += '<img '+style+' src="'+greenship+'" alt="ship" />'; //ship untouched
// 			else if (grid[i][j] == 2) retVal += '<img '+style+' src="'+splash+'" alt="splash" />'; //miss
// 			else if (grid[i][j] == 3) retVal += '<img '+style+' src="'+flame+'" alt="flame" />'; //hit
// 			else if (grid[i][j] == 4) retVal += '<img '+style+' src="'+sunkship+'" alt="sunk" />'; //sunk
// 			else retVal += grid[i][j];
// 			retVal += "</td>";
// 		}
// 		retVal += "</tr>";
// 	}
// 	// var progress = 0;
// 	var total = 100-progress;

// 	retVal += "<tr><td style='height:10px;' colspan='" + grid[0].length+1 + "'><div class='stacked-bar-graph'><span style='width: "+progress+"%; background:green;'>"+progress+"%</span><span style='width: "+total+"%;'></span></div></td></tr>";

// 	return retVal + "</table>";
// }

function toggleAudio() {
	if (!backgroundAudio) backgroundAudio=document.getElementById("bgAudio");
	console.log(backgroundAudio)
	console.log(backgroundAudio.paused)
	if (backgroundAudio.paused) backgroundAudio.play();
	else backgroundAudio.pause();
}

function micOnOpened() {
	debugMe("MIC OPENED");
	console.log("MIC OPENED")
	// dimScreen();
	duckAudio(quietAudiolevel);
}

function micOnClosed() {
	debugMe("MIC CLOSED");
	console.log("MIC CLOSED")
	// undimScreen();
	duckAudio(defaultAudiolevel);
}

function micOnError(error) {
	debugMe("MIC ERROR");
	console.log("MIC ERROR", error)
}

function debugMe(txt) {
	// console.log(txt)
	if (debugMode) document.getElementById('debug').innerHTML += "<p>" + new Date()+ " " + txt + "</p>";
}
