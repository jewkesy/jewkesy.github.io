
var _keywords;

function getKeywords() {
	httpGetByUrl(aws + "?action=getkeywords&locale="+_locale, function (err, data) {
		if (!data) return;
		_keywords = data.msg;
		fadeyStuff("pc_true", _keywords.true);
		fadeyStuff("pc_false", _keywords.false);
	});
}

function getQuestions(count, genre) {
	var url = aws + "?action=getquestions&count="+count+"&genre="+genre+"&locale="+_locale;
	// console.log(url)
	httpGetByUrl(url, function (err, data) {
		// console.log(data);
		if (!data || !data.msg.questions) return;
		if (data.msg.genre) fadeyStuff("pc_question_genre", getGenreEventTitle(capitalizeFirstLetter(data.msg.genre), "Movies")); 

		var idx = randomInt(0, data.msg.questions.length-1);
		var q = data.msg.questions[idx];
		var t = cleanseText(q.echoShowText);
		fadeyStuff("pc_question", t);

		$.get(q.Poster).done(function () {
		  fadeyPic("pc_question_poster", q.Poster);
		}).fail(function (e) {
		   fadeyPic("pc_question_poster", './images/popcorn_l.png');
		});
		// console.log(q);
		var c;

		if (q.correct) {
			// console.log(q.correct)
			c = q.correct+"";
			c = c.replace('<emphasis level="reduced">', '');
			c = c.replace('</emphasis>', '');
		}
		// console.log(c);
		document.getElementById('pc_true').onclick = function () {showAnswer(true, q.answer, c, q.t);};
		document.getElementById('pc_false').onclick = function () {showAnswer(false, q.answer, c, q.t);};

		startProgressBar(30, q.answer, c);
	});
}

var pg;
function showAnswer(chosen, answer, correct, type){
	// console.log(chosen, answer, correct, type);
	if (!type) type = "";
	clearInterval(pg);
	document.getElementById('pc_progressbar').setAttribute('style', "width:100%;");
	document.getElementById('pc_truefalse').setAttribute('style', 'display:none;');

	var a = _answerPhrases[randomInt(0, _answerPhrases.length-1)];
	// console.log(_answerPhrases);
	// console.log(a)
	var text = "";
	if (chosen === null) {
		text = "The correct answer was " + answer + ". ";
		if (correct) {
			if (type != "Quote" && type != "Taglines")
				text += a.replace('&&', correct); // + correct;
			else if (type == "Quote") text = correct;
		}
	} else {
		if (chosen == answer) {
			var i = randomInt(0, _correctPhrases.length-1);
			text = _correctPhrases[i];
		} else {
			var i = randomInt(0, _incorrectPhrases.length-1);
			text = _incorrectPhrases[randomInt(0, i)];
		}

		if (correct) {
			if (type != "Quote" && type != "Taglines") 
				text += " - " + a.replace('&&', correct);// + correct;
			else if (type == "Quote") text += " - " + correct;
		}
	}

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