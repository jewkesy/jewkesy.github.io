var me = "amzn1.ask.account.AEYVZX3MSGMLIKSHCAT3YCQIKASZYEYE2MEZSERJB4ALC7YDASS7HKZZ4MKB6JKEZTYVMBSBELRJN7EEZBYUMVMTNMVNXUWX73H6RBIBXH5RQ42CUDOYQWM2ZDS5S2KHWCRZ7KBQGC4OJVSPMK3OCVYJFY7COYNWZJPRTAYSUDFVKNEHOTUTE6VTMLQBQPV3A4VELGVNJCFEHGI";

var displayCount = getParameterByName('count') || 10;

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
				buildTopTen(doc.splice(0, displayCount), prefix);
			}
		}
	}
}

function buildTopTen(topTen, prefix) {
	console.log(topTen, prefix)

	for (var i = 0; i < topTen.length; i++) {
		var x = i + 1;
		var id = prefix + "_" + x;
		var star = "";
		if (topTen[i].userId == me) star = "*";
		if (document.getElementById(id)) document.getElementById(id).innerHTML = x + star
		document.getElementById(id + "_score").innerHTML = numberWithCommas(topTen[i].score);
		document.getElementById(id + "_games").innerHTML = numberWithCommas(topTen[i].games);
		if (topTen[i].locale) {
			document.getElementById(id + "_locale").innerHTML =  "<img class='locale' src='./images/" + topTen[i].locale + ".png' />";
		}
	}
}

function getParameterByName(name, url) {
    if (!url) {
      url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
