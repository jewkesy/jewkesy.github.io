
function buildAmazonParts(doc, id) {
	document.getElementById(id).innerHTML = "Amazon Rating: " + doc.uk.score + " / 5<br>" + "Reviews: " + doc.uk.reviews;
}

function getCountByKey(key, arr) {
	for(var i = 0, len = arr.length; i < len; i++) {
		if( arr[ i ].key === key ) return arr[ i ].count;
	}
	return 0;
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function httpGetGameCount(theUrl, prefix){
	var xmlHttp = null;
	xmlHttp = new XMLHttpRequest();
	xmlHttp.open("GET", theUrl, true);
	xmlHttp.onreadystatechange = handleReadyStateChange;
	xmlHttp.send(null);

	function handleReadyStateChange() {
		if (xmlHttp.readyState == 4) {
			if (xmlHttp.status == 200) {
				var doc = JSON.parse(xmlHttp.responseText);
				// console.log(doc)
				document.getElementById(prefix + '_total_players').innerHTML = numberWithCommas(doc.length);

				var count = 0;
				for (var i = 0; i < doc.length; i++) {
					count += doc[i].games;
				}

				document.getElementById(prefix + '_total_games').innerHTML = numberWithCommas(count);
			}
		}
	}
}

function httpGetStats(theUrl, prefix){
	var xmlHttp = null;
	xmlHttp = new XMLHttpRequest();
	xmlHttp.open("GET", theUrl, true);
	xmlHttp.onreadystatechange = handleReadyStateChange;
	xmlHttp.send(null);

	function handleReadyStateChange() {
		if (xmlHttp.readyState == 4) {
			if (xmlHttp.status == 200) {
				// console.log(xmlHttp.responseText)
				var doc = JSON.parse(xmlHttp.responseText);
				// console.log(doc)
				buildTopTen(doc.splice(0, 10), prefix);
			}
		}
	}
}

function buildTopTen(topTen, prefix) {
	// console.log(topTen, prefix)

	for (var i = 0; i < topTen.length; i++) {
		var x = i + 1;
		var id = prefix + "_" + x;
		if (topTen[i].userId == myId) console.log(x);
		document.getElementById(id + "_score").innerHTML = numberWithCommas(topTen[i].score);
		document.getElementById(id + "_games").innerHTML = numberWithCommas(topTen[i].games);
	}
}
