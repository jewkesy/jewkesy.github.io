
var _pqKeywords;

function getKeywords() {
	httpGetByUrl(aws + "?action=getkeywords&locale="+_pqLang, function (err, data) {
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

function getQuestions(count, genre) {
	if (cachedQuestions.length != 0) {
		displayQuestion();
		return;
	}

	var url = aws + "?action=getquestions&count="+count+"&genre="+genre+"&locale="+_pqLang;
	// console.log(url)
	httpGetByUrl(url, function (err, data) {
		// console.log(data);
		if (!data || !data.msg.questions) return;
		if (data.msg.genre) fadeyStuff("pc_question_genre", getGenreEventTitle(capitalizeFirstLetter(data.msg.genre), "Movies")); 

		cachedQuestions = data.msg.questions;

		displayQuestion();
	});
}

function displayQuestion() {
	// console.log('displaying')
	// console.log(cachedQuestions.length, cachedQuestions)
	// var idx = randomInt(0, cachedQuestions.length-1);
	var q = cachedQuestions.pop();
	// cachedQuestions = cachedQuestions
	var t = cleanseText(q.echoShowText);

	fadeyStuff("pc_question", t);

	$.get(q.Poster).done(function () {
		// console.log(q.Poster)
	  fadeyPic("pc_question_poster", q.Poster);
	}).fail(function (e) {
		// console.log(e)
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

	startProgressBar(30, q.answer, c);
}

var pg;
function showAnswer(chosen, answer, correct, type, comment){
	// console.log(chosen, answer, correct, type);
	if (!type) type = "";
	clearInterval(pg);
	document.getElementById('pc_progressbar').setAttribute('style', "width:100%;");
	document.getElementById('pc_truefalse').setAttribute('style', 'display:none;');

	var a = _pqAnswerPhrases[randomInt(0, _pqAnswerPhrases.length-1)];
	// console.log(_pqAnswerPhrases);
	// console.log(a)
	var text = "";
	if (chosen === null) {
		text = "The correct answer was " + answer + ". ";
		if (correct) {
			if (type != "Quote" && type != "Taglines")
				text += a.replace('&&', correct); // + correct;
			else if (type == "Quote") text = cleanseText(correct);
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
			if (type != "Quote" && type != "Taglines") 
				text += " - " + a.replace('&&', correct);// + correct;
			else if (type == "Quote") text += "<hr>" + cleanseText(correct);
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
