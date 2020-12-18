(function(){
    "use strict";
})();

var _amazonUrl = aws + '?amazon=true';
var _intervalid;
var _interval = 60000;

function getAmazonReviews() {
	_intervalid = setInterval(function () {
		// console.log('reviews timer');
		// clearTimeout(_intervalid);
		httpGetAmazon(_amazonUrl, function (err, data) {
			// console.log(data)
			buildAmazonReview(data);
		});
	}, _interval);
}

function httpGetAmazon(theUrl, callback){
	var xmlHttp = null;
	xmlHttp = new XMLHttpRequest();
	xmlHttp.open("GET", theUrl, true);
	xmlHttp.onreadystatechange = handleReadyStateChange;
	xmlHttp.send(null);

	function handleReadyStateChange() {
		if (xmlHttp.readyState == 4) {
			if (xmlHttp.status == 200) {
				var doc = JSON.parse(xmlHttp.responseText);
				return callback(null, doc.reviews);
			}
		}
	}
}

const arClasses = ['a-star-0', 'a-star-0-5', 'a-star-1', 'a-star-1-5', 'a-star-2', 'a-star-2-5', 'a-star-3', 'a-star-3-5', 'a-star-4', 'a-star-4-5', 'a-star-5'];
const arIds = ['pc_uk_stars', 'pc_us_stars', 'pc_de_stars', 'pc_in_stars', 'pc_ca_stars', 'pc_jp_stars', 'pc_au_stars', 'pc_fr_stars', 'pc_fr_ca_stars', 
	'pc_es_stars', 'pc_it_stars', 'pc_mx_stars', 'pc_br_stars', 'pc_es_us_stars', 'pc_ga_stars',
	'bs_uk_stars', 'bs_us_stars', 'bs_au_stars', 'bs_ca_stars', 'bs_in_stars'
];

function buildAmazonReview(data) {
	if (!data.popcorn_quiz.uk) data.popcorn_quiz.uk = {score:0,reviews:0};
	if (!data.popcorn_quiz.us) data.popcorn_quiz.us = {score:0,reviews:0};
	if (!data.popcorn_quiz.de) data.popcorn_quiz.de = {score:0,reviews:0};
	if (!data.popcorn_quiz.in) data.popcorn_quiz.in = {score:0,reviews:0};
	if (!data.popcorn_quiz.ca) data.popcorn_quiz.ca = {score:0,reviews:0};
	if (!data.popcorn_quiz.jp) data.popcorn_quiz.jp = {score:0,reviews:0};
	if (!data.popcorn_quiz.au) data.popcorn_quiz.au = {score:0,reviews:0};
	if (!data.popcorn_quiz.fr) data.popcorn_quiz.fr = {score:0,reviews:0};
	if (!data.popcorn_quiz.fr_ca) data.popcorn_quiz.fr_ca = {score:0,reviews:0};
	if (!data.popcorn_quiz.es) data.popcorn_quiz.es = {score:0,reviews:0};
	if (!data.popcorn_quiz.it) data.popcorn_quiz.it = {score:0,reviews:0};
	if (!data.popcorn_quiz.mx) data.popcorn_quiz.mx = {score:0,reviews:0};
	if (!data.popcorn_quiz.br) data.popcorn_quiz.br = {score:0,reviews:0};
	if (!data.popcorn_quiz.es_us) data.popcorn_quiz.es_us = {score:0,reviews:0};
	if (!data.popcorn_quiz.ga) data.popcorn_quiz.ga = {score:0,reviews:0};

	if (!data.battle_ship.uk) data.battle_ship.uk = {score:0,reviews:0};
	if (!data.battle_ship.us) data.battle_ship.us = {score:0,reviews:0};
	if (!data.battle_ship.au) data.battle_ship.au = {score:0,reviews:0};
	if (!data.battle_ship.ca) data.battle_ship.ca = {score:0,reviews:0};
	if (!data.battle_ship.in) data.battle_ship.in = {score:0,reviews:0};

	for (var i = 0; i < arIds.length; i++) {
		var e = document.getElementById(arIds[i]);
		if (!e) continue;
		for (var j = 0; j < arClasses.length; j++) e.classList.remove(arClasses[j]);

		     if (i ===0) e.classList.add(getCssStar(data.popcorn_quiz.uk.score));
		else if (i == 1) e.classList.add(getCssStar(data.popcorn_quiz.us.score));
		else if (i == 2) e.classList.add(getCssStar(data.popcorn_quiz.de.score));
		else if (i == 3) e.classList.add(getCssStar(data.popcorn_quiz.in.score));
		else if (i == 4) e.classList.add(getCssStar(data.popcorn_quiz.ca.score));
		else if (i == 5) e.classList.add(getCssStar(data.popcorn_quiz.jp.score));
		else if (i == 6) e.classList.add(getCssStar(data.popcorn_quiz.au.score));
		else if (i == 7) e.classList.add(getCssStar(data.popcorn_quiz.fr.score));
		else if (i == 8) e.classList.add(getCssStar(data.popcorn_quiz.fr_ca.score));
		else if (i == 9) e.classList.add(getCssStar(data.popcorn_quiz.es.score));
		else if (i ==10) e.classList.add(getCssStar(data.popcorn_quiz.it.score));
		else if (i ==11) e.classList.add(getCssStar(data.popcorn_quiz.mx.score));
		else if (i ==12) e.classList.add(getCssStar(data.popcorn_quiz.br.score));
		else if (i ==13) e.classList.add(getCssStar(data.popcorn_quiz.es_us.score));
		else if (i ==14) e.classList.add(getCssStar(Math.ceil(data.popcorn_quiz.ga.score)));

		else if (i ==15) e.classList.add(getCssStar(data.battle_ship.uk.score));
		else if (i ==16) e.classList.add(getCssStar(data.battle_ship.us.score));
		else if (i ==17) e.classList.add(getCssStar(data.battle_ship.au.score));
		else if (i ==18) e.classList.add(getCssStar(data.battle_ship.ca.score));
		else if (i ==19) e.classList.add(getCssStar(data.battle_ship.in.score));
	}

	fadeyStuff('pc_uk_reviews', numberWithCommas(data.popcorn_quiz.uk.reviews));
	fadeyStuff('pc_us_reviews', numberWithCommas(data.popcorn_quiz.us.reviews));
	fadeyStuff('pc_de_reviews', numberWithCommas(data.popcorn_quiz.de.reviews));
	fadeyStuff('pc_in_reviews', numberWithCommas(data.popcorn_quiz.in.reviews));
	fadeyStuff('pc_ca_reviews', numberWithCommas(data.popcorn_quiz.ca.reviews));
	fadeyStuff('pc_jp_reviews', numberWithCommas(data.popcorn_quiz.jp.reviews));
	fadeyStuff('pc_au_reviews', numberWithCommas(data.popcorn_quiz.au.reviews));
	fadeyStuff('pc_fr_reviews', numberWithCommas(data.popcorn_quiz.fr.reviews));
	fadeyStuff('pc_fr_ca_reviews', numberWithCommas(data.popcorn_quiz.fr_ca.reviews));
	fadeyStuff('pc_es_reviews', numberWithCommas(data.popcorn_quiz.es.reviews));
	fadeyStuff('pc_it_reviews', numberWithCommas(data.popcorn_quiz.it.reviews));
	fadeyStuff('pc_mx_reviews', numberWithCommas(data.popcorn_quiz.mx.reviews));
	fadeyStuff('pc_br_reviews', numberWithCommas(data.popcorn_quiz.br.reviews));
	fadeyStuff('pc_es_us_reviews', numberWithCommas(data.popcorn_quiz.es_us.reviews));
	fadeyStuff('pc_ga_reviews', numberWithCommas(data.popcorn_quiz.ga.reviews));

	fadeyStuff('bs_uk_reviews', numberWithCommas(data.battle_ship.uk.reviews));
	fadeyStuff('bs_us_reviews', numberWithCommas(data.battle_ship.us.reviews));
	fadeyStuff('bs_au_reviews', numberWithCommas(data.battle_ship.au.reviews));
	fadeyStuff('bs_ca_reviews', numberWithCommas(data.battle_ship.ca.reviews));
	fadeyStuff('bs_in_reviews', numberWithCommas(data.battle_ship.in.reviews));
}

$(document).ready(function() {
	httpGetAmazon(_amazonUrl, function(e, r) { buildAmazonReview(r); getAmazonReviews(); });
});
