"use strict";

const alphabet = "abcdefghijklmnopqrstuvwxyz";

const flame = "./images/flame_100.png";
const splash = "./images/waves.png";
const greenship = "./images/green_square_lrg_v2.png";
// const greenship = "./images/green_square_dark.png";
const sunkship = "./images/sunk_100.png";

let alexaVersion = '1.0';
let alexa;
const params = new URLSearchParams(window.location.search);
let debugMode = params.has('debug');

let defaultAudiolevel = 0.5;
let quietAudiolevel = 0.4;
// let backgroundAudio=document.getElementById("bgAudio");
let bgAudio = new Audio('./audio/battleship_01.mp3');
bgAudio.loop = true;

let useBgAudio = false;

const success = function(result) {
	// const {alexa, message} = result;
	// Actions after Alexa client initialization is complete
	// debugMe("LOADED");
	useBgAudio = setAudioStatus(result.message.context);
	showIntro();
	initialiseGameBoards(result.message);
	alexa = result.alexa;
	alexa.speech.onStarted(speechStarted);
	alexa.speech.onStopped(speechStopped);
	alexa.skill.onMessage(skillOnMessage);
	alexa.skill.sendMessage(skillSendMessage);
	alexa.voice.onMicrophoneOpened(micOnOpened);
	alexa.voice.onMicrophoneClosed(micOnClosed);

	// NOT NEEDED
	// alexa.performance.getMemoryInfo().then((memoryInfo) => {
	// 	const minimumRequiredMemoryAtStart = 400;
	// 	const {availableMemoryInMB} = memoryInfo;
	// 	if (availableMemoryInMB <= minimumRequiredMemoryAtStart) { // Gracefully exit game, device unsupported
	// 		console.log("MEMORY CHECK - Gracefully exit game, device unsupported")
	// 	} else {
	// 		console.log("MEMORY CHECK - Continue with game")
	// 	}
	// }).catch((error) => {
	// 	const {message} = error;
	// 	console.log('Failed to retrieve memory. ' + message);
	// });
	// alexa.performance.getMemoryInfo();
	
	console.log(alexa)

	try {
		// document.getElementById('micOpen').addEventListener('click', () => micOnOpened());
		// document.getElementById('micClose').addEventListener('click', () => micOnClosed());
		// document.getElementById('toggleAudio').addEventListener('click', () => toggleAudio());
	} catch {}
};

const failure = function(error) {
	const {code, message} = error; // Actions for failure to initialize
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
	if (evt && evt.target && evt.target.dataset) {
		_gridPressed = true;
		let fireAudio = new Audio('./audio/launch.mp3');
		fireAudio.play();
		evt.target.classList.add("pulseit");
		skillSendMessage({coords: {
			col: evt.target.dataset.col,
			row: evt.target.dataset.row
		}});
	}
}

var _butPressed = false;
function buttonPressEvent(evt) {
	if (_butPressed == true) return;
	if (evt && evt.target && evt.target.dataset) {
		_butPressed = true;
		let fireAudio = new Audio('./audio/launch.mp3');
		fireAudio.play();
		console.log(evt.target.dataset.answer)
		if (evt.target.dataset.answer  == 'yes') skillSendMessage({playAgain: true});
		else skillSendMessage({playAgain: false});
	}
}

// ArrowUp, ArrowDown, ArrowLeft, ArrowRight and NumpadEnter
// document.addEventListener('ArrowUp', (evt) => logKey(evt));
// document.addEventListener('ArrowDown', (evt) => logKey(evt));
// document.addEventListener('ArrowLeft', (evt) => logKey(evt));
// document.addEventListener('ArrowRight', (evt) => logKey(evt));
// document.addEventListener('NumpadEnter', (evt) => logKey(evt));
document.addEventListener('keydown', (evt) => logKey(evt));

function logKey(e) {
	console.log(e.code);
}

function showIntro() {
	if (useBgAudio === true) bgAudio.play();

	var intro = document.getElementById('intro');
	intro.classList.add('animate__animated', 'animate__fadeOut', 'animate__delay-3_0s');

	var ship = document.getElementById('intro_ship');
	ship.classList.add('animate__animated', 'animate__zoomInUp');
	ship.innerHTML = "<img alt='ship animation' src='./images/ship.png' class='animate__animated animate__zoomInUp' />";

	var logo = document.getElementById('intro_logo');
	logo.classList.add('animate__animated', 'animate__zoomInUp');
	logo.innerHTML+= "<img alt='logo animation' src='./images/Battle-Ship.png' class='animate__animated animate__zoomInUp' />";

	intro.addEventListener('animationend', (evt) => {
		if (evt.animationName == 'fadeOut') {
			intro.style.setProperty('display', 'none');
			animate(); // Animation loop
			var gameSection = document.getElementById('game');
			gameSection.style.setProperty('display', 'inline');
			
		}
	});
}

function buildSummaryHtml(results) {
	var container = document.createElement('div');
	var gridRow = document.createElement('div');
	gridRow.classList=['gridRow'];

	var summaryLeft = document.createElement('div');
	summaryLeft.id = 'summaryLeft';
	summaryLeft.innerHTML = `Round Accuracy: ${results.accuracy}%<br/>Round Score: ${results.score}<br/>Game Streak: ${results.gameStreak}<br/>Total Won: ${results.totalWins}`;
	gridRow.appendChild(summaryLeft);

	var summaryRight = document.createElement('div');
	summaryRight.id = 'summaryRight';
	summaryRight.innerHTML = `Avg. Accuracy: ${results.avgAccuracy}%<br/>Total Score: ${results.totalScore}<br/>Max Game Streak: ${results.highestGameStreak}<br/>Total Lost: ${results.totalLoses}`
	gridRow.appendChild(summaryRight);

	var spacer = document.createElement('div');
	spacer.classList=['clear spacer'];
	gridRow.appendChild(spacer);
	container.appendChild(gridRow);

	var playAgain = document.createElement('div');
	playAgain.innerHTML = "Would you like to play another round?";
	container.appendChild(playAgain);
	var clear = document.createElement('div');
	clear.classList=['clear minispacer'];
	container.appendChild(clear);

	// var spacer = document.createElement('div');
	// spacer.classList=['clear spacer'];
	// container.appendChild(spacer);

	var btnYes = document.createElement('a');
	btnYes.autofocus = true;
	btnYes.classList = ['btnOption'];
	btnYes.innerText = '"Yes"';
	btnYes.setAttribute("href", "#");
	btnYes.setAttribute("data-type", "playAgain");
	btnYes.setAttribute("data-answer", "yes");
	btnYes.addEventListener('click', (evt) => buttonPressEvent(evt));
	container.appendChild(btnYes);
	
	var btnNo = document.createElement('a');
	btnNo.classList = ['btnOption'];
	btnNo.innerText = '"No"';
	btnNo.setAttribute("href", "#");
	btnNo.setAttribute("data-type", "playAgain");
	btnNo.setAttribute("data-answer", "no");
	btnNo.addEventListener('click', (evt) => buttonPressEvent(evt));
	container.appendChild(btnNo);


	var spacer = document.createElement('div');
	spacer.classList=['clear spacer'];
	container.appendChild(spacer);

	var rank = document.createElement('div');
	rank.innerHTML = `Rank: <strong>${results.rank}</strong><br/>Reach a score of <strong>${results.nextPromotionScore}</strong> for promotion to <strong>${results.nextPromotion}</strong>`
	container.appendChild(rank);

	var spacer = document.createElement('div');
	spacer.classList=['clear spacer'];
	container.appendChild(spacer);

	var website = document.createElement('div');
	website.innerHTML = `Visit <strong><i>www.daryljewkes.com</i></strong> to view your rank against other BattleShip players.`
	container.appendChild(website);

	return container
}

function showSummary(won, summaryHTML) {
	var summary = document.getElementById('summary');
	summary.classList.add('animate__animated', 'animate__fadeIn', 'animate__delay-6_0s');
	summary.style.setProperty('display', 'inline');

	summary.addEventListener('animationend', (evt) => {
		if (evt.target.id != 'summary') return;

		if (evt.animationName == 'fadeIn') {
			var gameDiv = document.getElementById('game');
			gameDiv.style.setProperty('display', 'none');
			gameDiv.innerHTML = '';
	
			var ship = document.getElementById('summary_ship');
			ship.classList.add('animate__animated', 'animate__zoomInUp')
			ship.innerHTML = "<img src='./images/ship.png' />";
			
			ship.addEventListener('animationend', (evt) => {
				if (evt.target.id != 'summary_ship') return;
				ship.classList = [];
				if (evt.animationName == 'zoomInUp') {
					if (won) ship.classList.add('animate__animated', 'animate__backOutRight', 'animate__delay-2_0s');
					else {
						ship.classList.add('animate__animated', 'animate__rotateOutDownLeft', 'animate__delay-2_0s');
						addAction(document.getElementById('summary_action'), "explosion-cloud", 'actionCenter' + ' action animate__animated animate__fadeIn', 'animate__delay-1s', '0.5s', '70vh', '70vw', '40px');
					}

					var resultDisplay = document.getElementById('summary_result');
					resultDisplay.classList.add('animate__animated', 'animate__fadeIn', 'animate__delay-2_0s');
					// resultDisplay.innerHTML = summaryHTML;
					resultDisplay.appendChild(summaryHTML)
				} else if (evt.animationName == 'backOutRight' || evt.animationName == 'rotateOutDownLeft') {
					ship.innerHTML = "";
				}
			})

			var logo = document.getElementById('summary_logo');
			if (won) logo.innerHTML = "<img src='./images/YouWin.png' class='animate__animated animate__zoomInUp' />";
			else logo.innerHTML = "<img src='./images/YouLose.png' class='animate__animated animate__zoomInUp' />";
		}
	});
	if (useBgAudio === true) {
		try {
			duckAudio(quietAudiolevel, bgAudio);
			bgAudio.pause();
			duckAudio(defaultAudiolevel);
			if (won) {
				let wonAudio = new Audio('./audio/won.mp3');
				wonAudio.play();
			} else {
				let lostAudio = new Audio('./audio/lost.mp3');
				lostAudio.play();
			}
		} catch {}
	}
}

function initialiseGameBoards(msg) {
	if (!msg) return;
	loadGrid('tacticalGrid', "animate__animated animate__zoomInUp", msg.gameObj.playerGameGrid, msg.gameObj.progress.playerProgress, true, msg.context, msg.gameObj.computerFleet);
	loadGrid('playerFleet', "animate__animated animate__zoomInUp", msg.gameObj.playerGrid, msg.gameObj.progress.computerProgress, false, msg.context, msg.gameObj.playerFleet);
}

function getGridCellSizeForScreen(sWidth, cellCount) {
	if (sWidth >= 1200) {
		if (cellCount >= 8) return 35
		if (cellCount >= 6) return 45
		if (cellCount >= 2) return 55
	} else if (sWidth >= 1000) {
		if (cellCount >= 8) return 40
		if (cellCount >= 6) return 50
		if (cellCount >= 2) return 60
	} else if (sWidth >= 800) {
		if (cellCount >= 7) return 30
		if (cellCount >= 5) return 40
		if (cellCount >= 2) return 50
	}
	
	return 30; // go small
}

function skillOnMessage(msg) {
	if (msg.gameObj) {
		clearHTML();
		handleGameAction(msg);
	}
}

function loadGrid(id, cssClass, gameGrid, progress, touchMode, context, fleet) {
	// console.log(context)
	var eleGrid = document.getElementById(id);
	eleGrid.innerHTML = "";
	_gridPressed = false;

	if (params.has('w') && params.has('h')) {
		context.Viewport.pixelWidth = params.get('w');
		context.Viewport.pixelHeight = params.get('h');
	} 

	let sWidth = context.Viewport.pixelWidth
	let sHeight = context.Viewport.pixelHeight
	
	let size = getGridCellSizeForScreen(sWidth, gameGrid[0].length+1);

	var style = ' width="'+size+'px" height="'+size+'px" ';

	var table = document.createElement('table');
	table.classList = [cssClass]
	table.classList.add('board')
	table.classList.add('board'+size)
	table.style.setProperty('width', size+'px');
	table.style.setProperty('height', size+'px');
	// if (touchMode) {
	// 	table.autofocus = true;
	// }

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
	var counter = 0;
	var touchAdded = false;
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
				counter++;
				var span = document.createElement('span');
				span.classList=['clicky']
				span.style.setProperty('width', size+'px');
				span.style.setProperty('height', size+'px');
				span.setAttribute("data-type", "gridPress");
				span.setAttribute("data-col", alphabet.charAt(j).toUpperCase());
				span.setAttribute("data-row", i+1);
				if (debugMode) span.innerHTML = size
				if (touchMode) {
					span.setAttribute('tabindex', counter);
					span.addEventListener('click', (evt) => gridPressEvent(evt));
					if (touchAdded === false) {
						console.log(i,j)
						span.autofocus = true;
						touchAdded = true;
					}
				}
				td.appendChild(span);
			} else {
				var img = document.createElement('img');
				img.style.setProperty('width', size+'px');
				img.style.setProperty('height', size+'px');
				if (gameGrid[i][j] == 1) {
					var icon = getShipImgXY(i, j, fleet, greenship);
					img.setAttribute("src", icon.src);
					img.classList = [icon.cls]
					img.setAttribute("alt", "ship");
				} else if (gameGrid[i][j] == 2) {
					img.setAttribute("src", splash);
					img.setAttribute("alt", "splash");

				} else if (gameGrid[i][j] == 3) {
					img.setAttribute("src", flame);
					img.setAttribute("alt", "flame");
					img.classList=['animate__animated animate__infinite animate__pulse']
					if (Math.random() >= 0.5) img.classList.add('flip180')
				} else if (gameGrid[i][j] == 4) {
					var icon = getShipImgXY(i, j, fleet, sunkship);
					img.setAttribute("src", icon.src);
					img.classList = [icon.cls]
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
	var resolution = '';
	if (debugMode) resolution = '_' + sWidth + 'x' + sHeight;
	var txt = document.createTextNode(progress+'%' + resolution);
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

	var playerAction = msg.gameObj.playerAction;
	var playerActionDisplay = playerAction.action.toLowerCase();
	if (playerActionDisplay == 'won' || playerActionDisplay == 'sunk') playerActionDisplay = 'hit';
	else if (playerActionDisplay == 'outtabounds' || playerActionDisplay == 'dupe') return;

	document.getElementById('playerAction').innerHTML  = '<div class="animate__animated animate__fadeIn"><span class="coords">'+playerAction.coords.l.toUpperCase()+playerAction.coords.n+'</span><img alt="'+playerActionDisplay+'" style="height:50%; max-height:50%;" src="./images/' + playerActionDisplay +'.png"/></div>';

	var playerGridToShow = msg.gameObj.playerGameGrid;
	if (msg.gameObj.gameOver) {
		var last = msg.gameObj.lastAction[msg.gameObj.lastAction.length-1];
		if (last.action && last.action == "WON" && last.whoShot == "computer") playerGridToShow = msg.gameObj.computerGrid;
	}

	loadGrid('tacticalGrid', "animate__animated animate__zoomInUp", playerGridToShow, msg.gameObj.progress.playerProgress, true, msg.context, msg.gameObj.computerFleet);

	var delay = 'animate__delay-4_7s'; // blank out if player won
	if (msg.gameObj.gameOver) {
		var sfx = document.getElementById('sfx');
		sfx.classList=['animate__animated animate__fadeOut']
		sfx.addEventListener('animationend', (evt) => {
			sfx.innerHTML="";
		});
		// sfx.style.setProperty('display', 'none')
		var last = msg.gameObj.lastAction[msg.gameObj.lastAction.length-1];
		if (last.action == "WON") {
			delay = '';
		}
	}

	loadGrid('playerFleet', "animate__animated animate__zoomInUp "+delay, msg.gameObj.playerGrid, msg.gameObj.progress.computerProgress, false, msg.context, msg.gameObj.playerFleet);

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
	// console.log(parentNode, imgSrc, classes, delay, duration, height, width, paddingLeft)
	var img = document.createElement("img");
	img.id =  delay+"_"+duration+"_"+height+"_"+width+"_"+paddingLeft
	img.src = './images/'+imgSrc+'.png';
	img.alt = '';
	var style = '';
	if (duration) style += "--animate-duration:"+ duration + ";";
	if (height)	style += " height:" + height + ";";
	if (width)	style += " width:" + width + ";";
	if (paddingLeft) style += " padding-left:" + paddingLeft + ";"
	img.style = style;
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
			img.style.setProperty('display', 'none')
		}
	});
	parentNode.appendChild(img);
}

function skillSendMessage(msg) {
	alexa.skill.sendMessage(msg);
}

function duckAudio(level, audioStream) {
	if (!audioStream) return;

	const soundMultiplier = 5000; 

	if (level == audioStream.volume) return;

	if (level > audioStream.volume) {
		console.log("VOLUME UP", level, audioStream.volume)
		for (var i = audioStream.volume*soundMultiplier; i <= level*soundMultiplier; i++) {
			audioStream.volume = i/soundMultiplier;
		}
	} else {
		console.log("VOLUME DOWN", level, audioStream.volume)
		level = level*soundMultiplier;
		var i = audioStream.volume*soundMultiplier;
		while (i > level) {
			audioStream.volume = i/soundMultiplier;
			i--;
		}
	}
}

function setAudioStatus(context) {
	// console.log(context)
	// console.log(params)
	// console.log(params.has('audio'))
	if (context.Viewport.mode && context.Viewport.mode == "TV") {
		if (params.has('audio')) return true;
	}
	return false;
}

// function toggleAudio() {
// 	if (!backgroundAudio) backgroundAudio=document.getElementById("bgAudio");
// 	if (backgroundAudio.paused) backgroundAudio.play();
// 	else backgroundAudio.pause();
// }

function debugMe(txt) {
	if (debugMode) document.getElementById('debug').innerHTML += "<p>" + new Date()+ " " + txt + "</p>";
}

function getShipImgXY(x, y, fleet, icon) {
	// console.log(fleet)
	var retVal = {src: icon, cls: ''};
	if (!fleet) return retVal
	var found = false;
	for (var i = 0; i < fleet.length; i++) {
		if (found === true) break;
		var v = fleet[i];
		if (!v.coords || v.coords.length == 0) return retVal;
		var bow = v.coords[0];
		var stern = v.coords[v.coords.length-1];
		if (bow.x == x && bow.y == y) {
			retVal.cls += ' bow '
		} else if (stern.x == x && stern.y == y) {
			retVal.cls = ' stern '
		} else {
			retVal.cls = ' hull '
		}

		for (var j = 0; j < v.coords.length; j++) {
			if (found === true) break;
			if (v.coords[j].x == x && v.coords[j].y == y) {
				if (v.direction == 0) retVal.cls += ' rotate90 '
				found = true;
				break;
			}
		}
	}
	return retVal
}

function micOnOpened() {}
function micOnClosed() {}
function micOnError(error) {}
function speechStarted(msg) {}
function speechStopped(msg) {}
