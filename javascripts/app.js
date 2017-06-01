var me = "amzn1.ask.account.AEYVZX3MSGMLIKSHCAT3YCQIKASZYEYE2MEZSERJB4ALC7YDASS7HKZZ4MKB6JKEZTYVMBSBELRJN7EEZBYUMVMTNMVNXUWX73H6RBIBXH5RQ42CUDOYQWM2ZDS5S2KHWCRZ7KBQGC4OJVSPMK3OCVYJFY7COYNWZJPRTAYSUDFVKNEHOTUTE6VTMLQBQPV3A4VELGVNJCFEHGI";
var me = "amzn1.ask.account.AEWWKGN7CXOP6MTGYXCV73OIJ6VKVJPJETC2Q6UUMT6UKVONYGKP6POBU4MOSAACFVF53LMFUYC57BSKE57BDBFF7X4S6JIOXBKSWUCK462NIT2ISYV2JSS7456WF5N4Q7GYDEKMZ5D4DLLRYIOAUKZVCJZJ67HGPDAAKITZ54DMRJZTGHGXMNQMUEZBCVEKDJZ5DUGDUGRBG3Q";
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
	// console.log(topTen, prefix)

	var container = document.getElementById(prefix + '_scores')
	// if (document.getElementById(container)) document.getElementById(container).innerHTML = x + star

	for (var i = 0; i < topTen.length; i++) {
		var x = i + 1;
		var id = prefix + "_" + x;
		var star = "";
		if (topTen[i].userId == me) star = "*";

		if (!document.getElementById(prefix + '_' + x)) {
			var row = container.insertRow(-1);
			row.id = prefix + '_' + x;
			var cell1 = row.insertCell(0);
			var cell2 = row.insertCell(1);
			var cell3 = row.insertCell(2);
			var cell4 = row.insertCell(3);			
		}

		cell1.innerHTML = x + star;
		cell2.innerHTML = topTen[i].score;
		cell3.innerHTML = topTen[i].games;
		if (topTen[i].locale) {
			cell4.innerHTML =  "<img class='locale' src='./images/" + topTen[i].locale + ".png' />";
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
