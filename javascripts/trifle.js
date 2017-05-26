"use strict";

var trifleCountUrl = 'https://api.mongolab.com/api/1/databases/trifle/collections/game?f={"games":1,"_id":0}&apiKey=qbjPCckU4aqtUj_i5wyxpwEizWa5Ccp9';
var trifleUrl = 'https://api.mongolab.com/api/1/databases/trifle/collections/game?s={"score":-1,"timestamp":1}&apiKey=qbjPCckU4aqtUj_i5wyxpwEizWa5Ccp9';
var trifleAmazonUkUrl = "https://api.mongolab.com/api/1/databases/twentyquestions/collections/amazon?q={}&apiKey=qbjPCckU4aqtUj_i5wyxpwEizWa5Ccp9";

var myId = "amzn1.ask.account.AFJST3SHUEGBJ6AIWIBJHTJHHCU6NOUCAYBPAASUEPR6CAOPWB2MNH4T5JWE5GHTBVHRXXJFDV7TGAA4LLYETT3WIGRGKS2LEU5MR6X3HTEJW467IU7XNGI3OTBHYKZB4TMD5QYVTQ423HKYVT4J74TSCWHRGPYPJEWHFIGNJRKBOOKX4C7LSUX47V7CVIN5Q3KADVTT63FHE2A";

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
	// httpGetAmazon(trifleAmazonUkUrl);
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

