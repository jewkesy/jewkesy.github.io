"use strict";

const alphabet = "abcdefghijklmnopqrstuvwxyz";

const flame = "./images/flame_100.png";
const splash = "./images/waves.png";
const greenship = "./images/green_square_lrg.png";
const sunkship = "./images/sunk_100.png";

let alexaVersion = '1.0';
let alexa;
// let _gameObj;

let debugMode = false;
if (!debugMode) document.getElementById('debug').classList = ['opacityZero'];

let defaultAudiolevel = 0.6;
let quietAudiolevel = 0.4;
let backgroundAudio=document.getElementById("bgAudio");
// let launchAudio=document.getElementById("fireAudio");
// let fireAudio = new Audio('./audio/launch.mp3');
// backgroundAudio.pause();  //TODO TOGGLE WHEN LIVE
// duckAudio(defaultAudiolevel);

const success = function(result) {
	// const {alexa, message} = result;
	// Actions after Alexa client initialization is complete
	// debugMe("LOADED");
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
	if (window.alexaHtmlLocalDebug) { // both alexaHtmlLocalDebug and LocalMessageProvider are injected into the page by alexa-html-local
	  	Alexa.create({ version: alexaVersion, messageProvider: new LocalMessageProvider() }).then(success).catch(failure);
	} else {
		Alexa.create({ version: alexaVersion }).then(success).catch(failure);
	}
} catch (err) {
	console.log("Alexa Load Error", err)
}

var _gridPressed = false;
function gridPressEvent(evt) {
	if (_gridPressed == true) return;
	// console.log(evt.target.dataset)
	if (evt && evt.target && evt.target.dataset) {
		// _gridPressed = true;
		let fireAudio = new Audio('./audio/launch.mp3');
		fireAudio.play();
		evt.target.classList.add("pulseit");
		skillSendMessage({coords: {
			col: evt.target.dataset.col,
			row: evt.target.dataset.row
		}});
	}
}

function showIntro() {
	// let bgAudio = new Audio('./audio/battleship_01.mp3');
	// bgAudio.play();

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
	summary.classList.add('animate__animated', 'animate__fadeIn', 'animate__delay-6_0s');
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
	try {
		if (won) {
			let wonAudio = new Audio('./audio/won.mp3');
			wonAudio.play();
		} else {
			let lostAudio = new Audio('./audio/lost.mp3');
			lostAudio.play();
		}
	} catch {}
}

function initialiseGameBoards(msg) {
	// debugMe(JSON.stringify(msg, null, 2));
	if (!msg) return;
	// console.log(msg)
	loadGrid('tacticalGrid', "animate__animated animate__zoomInUp", msg.gameObj.playerGameGrid, msg.gameObj.progress.playerProgress, true, msg.context);
	loadGrid('playerFleet', "animate__animated animate__zoomInUp", msg.gameObj.playerGrid, msg.gameObj.progress.computerProgress, false, msg.context);
}

function getGridCellSizeForScreen(sWidth, cellCount) {
	// console.log(sWidth, cellCount)

	// sWidth = 1920
	if (sWidth > 1900) {
		if (cellCount >= 8) return 60
		if (cellCount >= 5) return 80
	} else if (sWidth >= 1200) {
		if (cellCount >= 8) return 50
		if (cellCount >= 5) return 60
	} else if (sWidth >= 1000) {
		if (cellCount >= 9) return 40
		if (cellCount >= 5) return 50
	} else if (sWidth >= 800) {
		if (cellCount >= 9) return 30
		if (cellCount >= 5) return 40
	}
	// go small
	return 30;
}

function speechStarted(msg){
	// debugMe("SPEECH STARTED");
	// debugMe(JSON.stringify(msg, null, 2));
	// console.log("SPEECH STARTED");
	// duckAudio(quietAudiolevel);
}

function speechStopped(msg) {
	// debugMe("SPEECH STOPPED");
	// debugMe(JSON.stringify(msg, null, 2));
	// console.log("SPEECH STOPPED");
	// duckAudio(defaultAudiolevel);
}

function skillOnMessage(msg) {
	// console.log("ON MESSAGE", msg)
	// console.log(msg.sessionAttributes.gameObj)
	// debugMe("skillOnMessage");
	// debugMe(JSON.stringify(msg, null, 2));
	// if (msg.description) document.getElementById('description').innerText = new Date()+ " "+ msg.description;
	if (msg.gameObj) {
		// _gameObj = msg.gameObj;
		clearHTML();
		handleGameAction(msg);
	}
}

function loadGrid(id, cssClass, gameGrid, progress, touchMode, context) {
	// console.log(gameGrid, progress)
	var eleGrid = document.getElementById(id);
	eleGrid.innerHTML = "";
	_gridPressed = false;

	// var size = 50; // if Echo Show, switch to 50?

	let sWidth = context.Viewport.pixelWidth
	// let sHeight = context.Viewport.pixelHeight
	
	let size = getGridCellSizeForScreen(sWidth, gameGrid[0].length+1);
console.log(size)
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
	for (var i = 0; i < gameGrid[0].length; i++) {
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
				span.setAttribute("data-type", "gridPress");
				span.setAttribute("data-col", alphabet.charAt(j).toUpperCase());
				span.setAttribute("data-row", i+1);
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
	td.setAttribute("colspan", gameGrid[0].length+1);

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
	// debugMe(JSON.stringify(msg, null, 2));
	
	// let bgAudio = new Audio('./audio/battleship_01.mp3');
	// bgAudio.play();

	var playerAction = msg.gameObj.playerAction;
	var playerActionDisplay = playerAction.action.toLowerCase();
	if (playerActionDisplay == 'won' || playerActionDisplay == 'sunk') playerActionDisplay = 'hit';
	else if (playerActionDisplay == 'outtabounds' || playerActionDisplay == 'dupe') return;

	document.getElementById('playerAction').innerHTML  = '<div class="animate__animated animate__fadeIn"><span class="coords">'+playerAction.coords.l.toUpperCase()+playerAction.coords.n+'</span><img alt="'+playerActionDisplay+'" style="height:50%; max-height:50%;" src="./images/' + playerActionDisplay +'.png"/></div>';

	loadGrid('tacticalGrid', "animate__animated animate__zoomInUp", msg.gameObj.playerGameGrid, msg.gameObj.progress.playerProgress, true, msg.context);

	var delay = 'animate__delay-4_7s'; // blank out if player won
	if (msg.gameObj.gameOver) {
		var last = msg.gameObj.lastAction[msg.gameObj.lastAction.length-1];
		if (last.action == "WON") {
			delay = '';
		}
	}

	loadGrid('playerFleet', "animate__animated animate__zoomInUp "+delay, msg.gameObj.playerGrid, msg.gameObj.progress.computerProgress, false, msg.context);

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
	// debugMe("SEND MESSAGE");
	// debugMe(JSON.stringify(msg, null, 2));
	// console.log("SEND MESSAGE", msg)
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

function toggleAudio() {
	if (!backgroundAudio) backgroundAudio=document.getElementById("bgAudio");
	console.log(backgroundAudio)
	console.log(backgroundAudio.paused)
	if (backgroundAudio.paused) backgroundAudio.play();
	else backgroundAudio.pause();
}

function micOnOpened() {
	// debugMe("MIC OPENED");
	// console.log("MIC OPENED")
	// dimScreen();
	duckAudio(quietAudiolevel);
}

function micOnClosed() {
	// debugMe("MIC CLOSED");
	// console.log("MIC CLOSED")
	// undimScreen();
	duckAudio(defaultAudiolevel);
}

function micOnError(error) {
	// debugMe("MIC ERROR");
	// console.log("MIC ERROR", error)
}

function debugMe(txt) {
	// console.log(txt)
	if (debugMode) document.getElementById('debug').innerHTML += "<p>" + new Date()+ " " + txt + "</p>";
}
