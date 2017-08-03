"use strict";

var trifleCountUrl = aws + 'getHomePageContent?action=getcounts&prefix=tf';
var trifleUrl = aws + 'getHomePageContent?action=getscores&prefix=tf';

httpGetStats(trifleUrl, 'tr');
httpGetGameCount(trifleCountUrl, 'tr');
buildAmazonParts({
	uk: {
		reviews: 'Awaiting publish',
		score: 'NA'
	}
}, 'trifle_amazon_score');

setInterval(function () {
	// console.log('getting');
	httpGetStats(trifleUrl, 'tr');
	httpGetGameCount(trifleCountUrl, 'tr');
	// console.log('got');
}, 60000);

function httpGetAmazon(theUrl){
	var xmlHttp = null;
	xmlHttp = new XMLHttpRequest();
	xmlHttp.open("GET", theUrl, true);
	xmlHttp.onreadystatechange = handleReadyStateChange;
	xmlHttp.send(null);

	function handleReadyStateChange() {
		if (xmlHttp.readyState == 4) {
			if (xmlHttp.status == 200) {
				var doc = JSON.parse(xmlHttp.responseText)[0];
				// console.log(doc)
				buildAmazonParts(doc, 'trifle_amazon_score');
			}
		}
	}
}

