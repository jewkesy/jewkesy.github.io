"use strict";

let alexaVersion = '1.0';
let alexa;

let debugMode = false;
if (!debugMode) document.getElementById('debug').classList = ['opacityZero'];

let defaultAudiolevel = 0.6;
let quietAudiolevel = 0.1;
let backgroundAudio=document.getElementById("bgAudio");
backgroundAudio.pause();  //TODO TOGGLE WHEN LIVE
duckAudio(defaultAudiolevel);

showIntro();

const success = function(result) {
	// const {alexa, message} = result;
	// Actions after Alexa client initialization is complete
	debugMe("LOADED");
	
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
	document.getElementById('micOpen').addEventListener('click', () => micOnOpened());
	document.getElementById('micClose').addEventListener('click', () => micOnClosed());
	document.getElementById('toggleAudio').addEventListener('click', () => toggleAudio());
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

function showIntro() {
	var intro = document.getElementById('intro');
	intro.innerHTML = "<img id='intro_ship' src='./images/ship.png' class='animate__animated animate__zoomInUp' />";
	intro.innerHTML+= "<img id='intro_logo' src='./images/Battle-Ship.png' class='animate__animated animate__zoomInUp' />";

	intro.classList.add('animate__animated', 'animate__fadeOut', 'animate__delay-2_0s');

	intro.addEventListener('animationend', (evt) => {
		if (evt.animationName == 'fadeOut') {
			console.log('COMPLETE');
			intro.style.setProperty('display', 'none');

		}
	});
}

function initialiseGameBoards(msg) {
	if (!msg || !msg.data) return;
	// console.log(msg.data)
	debugMe(JSON.stringify(msg.data, null, 2));
	var tacticalGrid = msg.data.grids[0].url;
	var playerFleet  = msg.data.grids[1].url;
	loadGrid('tacticalGrid', tacticalGrid, "Tactical Grid", "animate__animated animate__zoomInUp");
	loadGrid('playerFleet', tacticalGrid, "Player Fleet", "animate__animated animate__zoomInUp");
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

function loadGrid(id, src, altTxt, cssClass) {
	var eleGrid = document.getElementById(id);
	eleGrid.innerHTML = '<img class="'+cssClass+'" alt="'+altTxt+'" height="90%" src="'+src+'"/>';
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
	if (playerActionDisplay == 'won') playerActionDisplay = 'hit';

	document.getElementById('playerAction').innerHTML  = '<div class="animate__animated animate__fadeIn"><span class="coords">'+playerAction.coords.l.toUpperCase()+playerAction.coords.n+'</span><img alt="'+playerActionDisplay+'" style="height:50%; max-height:50%;" src="./images/' + playerActionDisplay +'.png"/></div>';

	var tacticalGrid = msg.grids[0].url;
	var playerFleet  = msg.grids[1].url;

	loadGrid('tacticalGrid', tacticalGrid, "Tactical Grid", "animate__animated animate__zoomInUp");
	// var eleTacticalGrid = document.getElementById('tacticalGrid');
	// eleTacticalGrid.innerHTML = '<img class="animate__animated animate__zoomInUp" alt="Tactical Grid" height="90%" src="' + tacticalGrid +'"/>';

	var delay = 'animate__delay-4_7s'; // blank out if player won
	if (msg.gameObj.gameOver) {
		var last = msg.gameObj.lastAction[msg.gameObj.lastAction.length-1];
		if (last.action == "WON") {
			delay = '';
		}
	}

	loadGrid('playerFleet', playerFleet, "Player Fleet", "animate__animated animate__zoomInUp "+delay);
	// var elePlayerFleet = document.getElementById('playerFleet');
	// elePlayerFleet.innerHTML  = '<img class="animate__animated animate__zoomInUp '+delay+'" alt="Player Fleet" height="90%" src="' + playerFleet +'"/>';

	var playerActionResult = "explosion-cloud";

	if (playerActionDisplay == 'miss') playerActionResult = "water-splash";
	var elePlayerActionResult = document.getElementById('playerActionResult');
	var eleComputerActionResult = document.getElementById('computerActionResult');

	addAction(elePlayerActionResult, playerActionResult, 'action actionLeftSide animate__animated animate__fadeIn', 'animate__delay-0_1s', '0.5s')

	delay = 'animate__delay-4_7s';
	if (msg.gameObj.gameOver) {
		console.log("HANDLE GAME OVER")
		var last = msg.gameObj.lastAction[msg.gameObj.lastAction.length-1];
		if (last.action == "WON") {
			if (last.whoShot == "player") {
				console.log("HANDLE PLAYER WON");
				addFleetDestroyed(elePlayerActionResult, 'actionLeftSide');
				return
			} else {
				console.log("HANDLE COMPUTER WON");
				delay = 'animate__delay-0_1s';
				addFleetDestroyed(eleComputerActionResult, 'actionRightSide');
			}
		}
	} 

	var computerAction = msg.gameObj.computerAction;
	var computerActionDisplay = computerAction.action.toLowerCase();
	if (computerActionDisplay == 'won') computerActionDisplay = 'hit';
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
	// console.log(parentNode,  height, width, paddingLeft)
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

