
var _pqKeywords;
const s3Url = "https://popcornquiz.s3-eu-west-1.amazonaws.com/"
const gameTime = 30;

function getKeywords() {
	httpGetByUrl(aws + "?action=getkeywords&prefix=pc&locale="+_pqLang, function (err, data) {
		if (!data) return;
		_pqKeywords = data.msg;
		fadeyStuff("pc_true", _pqKeywords.true);
		fadeyStuff("pc_false", _pqKeywords.false);
		if (_pqKeywords.shortDesc) fadeyStuff("pc_short_desc", _pqKeywords.shortDesc);
		setGameElements(_pqLang);
		// console.log(_pqKeywords)
	});
}

var cachedQuestions = [];

function getQuestions(count, genre, skipReset = false) {
	if (!skipReset && cachedQuestions.length != 0) {
		displayQuestion(count, genre);
		return;
	}

	var url = aws + "?action=getquestions&prefix=pc&count="+count+"&genre="+genre+"&locale="+_pqLang;
	httpGetByUrl(url, function (err, data) {
		if (!data || !data.msg.questions) return;
		
		if (!skipReset)
			if (data.msg.genre) fadeyStuff("pc_question_genre", getGenreEventTitle(capitalizeFirstLetter(data.msg.genre), "Movies")); 

		cachedQuestions.push(...data.msg.questions);
		updateStillInfo();
		if (!skipReset) displayQuestion(count, genre);
	});
}

function updateStillInfo() {
	var stills = cachedQuestions.filter(x => x.t == 'Still')
	if (stills.length == 0) return
	
	// pick a random?
	for ( var i = 0; i < stills.length; i++) {
		var x = stills[i]
		var t = ""
		if (x.answer == true) {
			t = x.echoShowText
		} else {
			t = x.correct
		}

		var a = t.split(">")[1].split("<")[0]

		$.get(x.Poster).done(function () {
		  fadeyPic("stillRandomImg", x.Poster);
		}).fail(function (e) {
			console.log(e)
		   fadeyPic("stillRandomImg", './images/popcorn_l.png');
		});
		fadeyStuff("stillRandomTitle", a);
		break;
	}
}

function displayQuestion(count, genre) {
	var q = cachedQuestions.pop();
	if (cachedQuestions.length < 2) getQuestions(count, genre, true);

	var t = cleanseText(q.echoShowText);

	var mosaic = document.getElementById('pc_poster_mosaic');

	var mosaics = ["mosaic_1.png", "mosaic_2.png", "mosaic_3.png", "mosaic_4.png", "mosaic_5.png", "mosaic_6.png", "mosaic_7.png", "mosaic_8.png" ];

	if (q.t == "Poster" || q.t == "TitleSwap") { // show mosaic
		let m = s3Url+mosaics[Math.floor(Math.random() * (mosaics.length))];

		mosaic.setAttribute('src', m);
		// https://popcornquiz.s3-eu-west-1.amazonaws.com/mosaic_1.png
		mosaic.setAttribute('style', "display: inline;");
		mosaic.classList = ["mosaic animate__animated animate__zoomIn"]
		mosaic.addEventListener('animationend', (evt) => {
		  if (evt.animationName == "zoomIn") {
		  	mosaic.classList = ["mosaic animate__animated animate__rubberBand animate__slower"]
		  }
		});

	} else { // hide mosiac
		mosaic.setAttribute('style', "display: none;");
	}

	fadeyStuff("pc_question", t);

	$.get(q.Poster).done(function () {
		// console.log(q.Poster)
	  fadeyPic("pc_question_poster", q.Poster);
	}).fail(function (e) {
		console.log(e)
	   fadeyPic("pc_question_poster", './images/popcorn_l.png');
	});
	// console.log(q);
	var c = "";

	if (q.correct) {
		//console.log(q.correct)
		c = cleanseText(q.correct+"");
		c = c.replace('<emphasis level="reduced">', '');
		c = c.replace('</emphasis>', '');
	}

	document.getElementById('pc_true').onclick = function () {showAnswer(true, q.answer, c, q.t, q.comment);};
	document.getElementById('pc_false').onclick = function () {showAnswer(false, q.answer, c, q.t, q.comment);};

	startProgressBar(gameTime, q.answer, c);
}

var pg;
function showAnswer(chosen, answer, correct, type, comment){
	// console.log(chosen, answer, correct, type);
	var mosaic = document.getElementById('pc_poster_mosaic');
	mosaic.setAttribute('style', "display: none;");
	if (!type) type = "";
	clearInterval(pg);
	document.getElementById('pc_progressbar').setAttribute('style', "width:100%;");
	document.getElementById('pc_truefalse').setAttribute('style', 'display:none;');

	var a = _pqAnswerPhrases[randomInt(0, _pqAnswerPhrases.length-1)];
	// console.log(_pqAnswerPhrases);

	var text = "";
	if (chosen === null) {
		if (correct) {
			if (type != "Quote" && type != "Taglines" && type != "Poster" && type != "TitleSwap" && type != "Still") {
				text = "The correct answer was " + answer + ". ";
				text += a.replace('&&', correct); // + correct;
			}
			else text = cleanseText(correct);
		}
	} else {
		if (chosen == answer) {
			var i = randomInt(0, _pqCorrectPhrases.length-1);
			text = _pqCorrectPhrases[i];
		} else {
			var i = randomInt(0, _pqIncorrectPhrases.length-1);
			text = _pqIncorrectPhrases[randomInt(0, i)];
		}

		if (correct) {
			if (type != "Quote" && type != "Taglines" && type != "Poster" && type != "TitleSwap" && type != "Still")
				text += " - " + a.replace('&&', correct);// + correct;
			else text += "<hr>" + cleanseText(correct);
		}
	}

	if (comment) text += "<hr>" + comment;

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
