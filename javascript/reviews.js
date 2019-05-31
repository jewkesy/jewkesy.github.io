(function(){
    "use strict";
})();

var _amazonUrl = aws + '?amazon=true';
var _intervalid;
var _interval = 60000;

function getAmazonReviews() {
	_intervalid = setInterval(function () {
		console.log('reviews timer');
		// clearTimeout(_intervalid);
		httpGetAmazon(_amazonUrl, function (err, data) {
			console.log(data)
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
				return callback(null, doc.reviews[0]);
			}
		}
	}
}

function buildAmazonReview(data) {
	// console.log(data)
	if (!data.uk) data.uk = {score:0,reviews:0};
	if (!data.us) data.us = {score:0,reviews:0};
	if (!data.de) data.de = {score:0,reviews:0};
	if (!data.in) data.in = {score:0,reviews:0};
	if (!data.ca) data.ca = {score:0,reviews:0};
	if (!data.jp) data.jp = {score:0,reviews:0};
	if (!data.au) data.au = {score:0,reviews:0};
	if (!data.fr) data.fr = {score:0,reviews:0};
	if (!data.fr_ca) data.fr_ca = {score:0,reviews:0};
	if (!data.es) data.es = {score:0,reviews:0};
	if (!data.it) data.it = {score:0,reviews:0};
	if (!data.mx) data.mx = {score:0,reviews:0};
	if (!data.br) data.br = {score:0,reviews:0};
	if (!data.es_us) data.es_us = {score:0,reviews:0};
	if (!data.ga) data.ga = {score:0,reviews:0};

	var arIds = ['pc_uk_stars', 'pc_us_stars', 'pc_de_stars', 'pc_in_stars', 'pc_ca_stars', 'pc_jp_stars', 'pc_au_stars', 'pc_fr_stars', 'pc_fr_ca_stars', 'pc_es_stars', 'pc_it_stars', 'pc_mx_stars', 'pc_br_stars', 'pc_es_us_stars', 'pc_ga_stars'];
	var arClasses = ['a-star-0', 'a-star-0-5', 'a-star-1', 'a-star-1-5', 'a-star-2', 'a-star-2-5', 'a-star-3', 'a-star-3-5', 'a-star-4', 'a-star-4-5', 'a-star-5'];

	for (var i = 0; i < arIds.length; i++) {
		var e = document.getElementById(arIds[i]);
		if (!e) continue;
		for (var j = 0; j < arClasses.length; j++) {
			e.classList.remove(arClasses[j]);
		}

		     if (i ===0) e.classList.add(getCssStar(data.uk.score));
		else if (i == 1) e.classList.add(getCssStar(data.us.score));
		else if (i == 2) e.classList.add(getCssStar(data.de.score));
		else if (i == 3) e.classList.add(getCssStar(data.in.score));
		else if (i == 4) e.classList.add(getCssStar(data.ca.score));
		else if (i == 5) e.classList.add(getCssStar(data.jp.score));
		else if (i == 6) e.classList.add(getCssStar(data.au.score));
		else if (i == 7) e.classList.add(getCssStar(data.fr.score));
		else if (i == 8) e.classList.add(getCssStar(data.fr_ca.score));
		else if (i == 9) e.classList.add(getCssStar(data.es.score));
		else if (i ==10) e.classList.add(getCssStar(data.it.score));
		else if (i ==11) e.classList.add(getCssStar(data.mx.score));
		else if (i ==12) e.classList.add(getCssStar(data.br.score));
		else if (i ==13) e.classList.add(getCssStar(data.es_us.score));
		else if (i ==14) e.classList.add(getCssStar(Math.ceil(data.ga.score)));
	}

	fadeyStuff('pc_uk_reviews', numberWithCommas(data.uk.reviews));
	fadeyStuff('pc_us_reviews', numberWithCommas(data.us.reviews));
	fadeyStuff('pc_de_reviews', numberWithCommas(data.de.reviews));
	fadeyStuff('pc_in_reviews', numberWithCommas(data.in.reviews));
	fadeyStuff('pc_ca_reviews', numberWithCommas(data.ca.reviews));
	fadeyStuff('pc_jp_reviews', numberWithCommas(data.jp.reviews));
	fadeyStuff('pc_au_reviews', numberWithCommas(data.au.reviews));
	fadeyStuff('pc_fr_reviews', numberWithCommas(data.fr.reviews));
	fadeyStuff('pc_fr_ca_reviews', numberWithCommas(data.fr_ca.reviews));
	fadeyStuff('pc_es_reviews', numberWithCommas(data.es.reviews));
	fadeyStuff('pc_it_reviews', numberWithCommas(data.it.reviews));
	fadeyStuff('pc_mx_reviews', numberWithCommas(data.mx.reviews));
	fadeyStuff('pc_br_reviews', numberWithCommas(data.br.reviews));
	fadeyStuff('pc_es_us_reviews', numberWithCommas(data.es_us.reviews));
	fadeyStuff('pc_ga_reviews', numberWithCommas(data.ga.reviews));
}

$(document).ready(function() {
	httpGetAmazon(_amazonUrl, function(e, r) { buildAmazonReview(r); getAmazonReviews(); });
});
