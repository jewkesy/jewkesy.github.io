
var aws = "https://e94s2o5jyb.execute-api.eu-west-1.amazonaws.com/prod/";
// var me = "amzn1.ask.account.AEYVZX3MSGMLIKSHCAT3YCQIKASZYEYE2MEZSERJB4ALC7YDASS7HKZZ4MKB6JKEZTYVMBSBELRJN7EEZBYUMVMTNMVNXUWX73H6RBIBXH5RQ42CUDOYQWM2ZDS5S2KHWCRZ7KBQGC4OJVSPMK3OCVYJFY7COYNWZJPRTAYSUDFVKNEHOTUTE6VTMLQBQPV3A4VELGVNJCFEHGI";
var me = "amzn1.ask.account.AEWWKGN7CXOP6MTGYXCV73OIJ6VKVJPJETC2Q6UUMT6UKVONYGKP6POBU4MOSAACFVF53LMFUYC57BSKE57BDBFF7X4S6JIOXBKSWUCK462NIT2ISYV2JSS7456WF5N4Q7GYDEKMZ5D4DLLRYIOAUKZVCJZJ67HGPDAAKITZ54DMRJZTGHGXMNQMUEZBCVEKDJZ5DUGDUGRBG3Q";
var sun = "amzn1.ask.account.AG4FEV4HAGMGK5BTWSRXHVJYXRET55324SFXHI5K56U3V3PSERXVQJDBHWP3MGFSLZVNVALJ5DEUPIN6SAK5IJDFCGYOGCW4NOOLIVNTPWKJWUCS5W7DVBYND6WQUJ66PG64HTJQX23RF3DS335O3VKFU3MFDYRSWONH4AMQ5TBNL5P2DXLI2HBL3NTJGY527LBVW5GN657QNYA";
var note  = "amzn1.ask.account.AHRKNEDAF5QOKJWAGSGGTEGJMK3SEXFU4ZTXKQNLYKAKNP66QI2TAXXJVFRHGZJZPQ6FCJ4E6IBM2B6QIKQ4CD6PZ4WTEN5YJMF7JIJ5DOACMQZIEG2BDVSW54HAGUIP33BE7BWEM24APYTHXMYWRLOQFNTS36KA733RORFKRIQLYRIHPIXHWONHRZ34P7GOYWGROMMBOGAJO6Y";

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

function keyExists(name, arr) {
  for(var i = 0, len = arr.length; i < len; i++) {
    if( arr[ i ].key === name ) return i;
  }
  return -1;
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

function httpGetLastPlay(theUrl, prefix) {
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
				var t = doc[0]
				t.rank = 1;
				for (var i = 1; i < doc.length; i++) {
					if (doc[i].timestamp > t.timestamp) {
						t = doc[i];
						t.rank = i+1;
					}
				}

				document.getElementById(prefix + '_lp_rank').innerHTML = numberWithCommas(t.rank);
				document.getElementById(prefix + '_lp_score').innerHTML = numberWithCommas(t.score);
				document.getElementById(prefix + '_lp_games').innerHTML = numberWithCommas(t.games);

				document.getElementById(prefix + '_lp_avg').innerHTML = ((+t.score)/(+t.games)).toFixed(2);
				document.getElementById(prefix + '_lp_ts').innerHTML = "...";
				document.getElementById(prefix + '_lp_ts').setAttribute('title', t.timestamp/1000);
				document.getElementById(prefix + '_lp_locale').innerHTML =  "<img class='locale' src='./images/" + t.locale + ".png' />";

			}
		}
	}
}

function httpGetStats(theUrl, prefix, callback){
	var xmlHttp = null;
	xmlHttp = new XMLHttpRequest();
	xmlHttp.open("GET", theUrl, true);
	xmlHttp.onreadystatechange = handleReadyStateChange;
	xmlHttp.send(null);

	function handleReadyStateChange() {
		if (xmlHttp.readyState == 4) {
			if (xmlHttp.status == 200) {
				var doc = JSON.parse(xmlHttp.responseText);
				buildTopTen(doc, prefix);
				if (callback) return callback(null, doc);
			}
			if (callback) return callback(xmlHttp.status);
		}
	}
}

function buildTopTen(topTen, prefix) {
	// console.log(topTen, prefix)

	var container = document.getElementById(prefix + '_scores')

	// if (document.getElementById(container)) document.getElementById(container).innerHTML = x + star

	for (var i = 0; i < topTen.length; i++) {
		if (i >= displayCount) break;
		var x = i + 1;
		var id = prefix + "_" + x;
		var sym = "";
		if (topTen[i].userId == me) {sym = " &#9734;";}
		else if (topTen[i].userId == sun) {sym = " &#9788;";}
		else if (topTen[i].userId == note) {sym = " &#9834;";}
		// if (topTen[i].userId == me)

		if (!document.getElementById(prefix + '_' + x)) {
			var row = container.insertRow(-1);
			row.id = prefix + '_' + x;
			var cell1 = row.insertCell(0);
			cell1.id = prefix + "_rank_" + x;
			var cell2 = row.insertCell(1);
			cell2.id = prefix + "_score_" + x;
			var cell3 = row.insertCell(2);
			cell3.id = prefix + "_games_" + x;
			var cell4 = row.insertCell(3);
			cell4.id = prefix + "_avg_" + x;

			var cell5 = row.insertCell(4)
			cell5.id = prefix + "_ts_" + x;
			cell5.className = "timeago";
			cell5.title = topTen[i].timestamp/1000;
			var cell6 = row.insertCell(5);
			cell6.id = prefix + "_locale_" + x;

			cell1.innerHTML = x + sym;
			cell2.innerHTML = topTen[i].score;
			cell3.innerHTML = topTen[i].games;
			cell4.innerHTML = ((+topTen[i].score)/(+topTen[i].games)).toFixed(2);
			cell5.innerHTML = "...";

			if (topTen[i].locale) {
				cell6.innerHTML =  "<img class='locale' src='./images/" + topTen[i].locale + ".png' />";
			}
			
		} else {
			document.getElementById(prefix + '_rank_' + x).innerHTML = x + sym;
			document.getElementById(prefix + '_score_' + x).innerHTML = topTen[i].score;
			document.getElementById(prefix + '_games_' + x).innerHTML = topTen[i].games;
			document.getElementById(prefix + '_ts_' + x).title = topTen[i].timestamp/1000;
			if (topTen[i].locale) {
				document.getElementById(prefix + '_locale_' + x).innerHTML =  "<img class='locale' src='./images/" + topTen[i].locale + ".png' />";
			}
		}
		document.getElementById(prefix + '_count').innerHTML = i+1;
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

(function timeAgo(selector) {
    var templates = {
        prefix: "",
        suffix: " ago",
        seconds: "less than a minute",
        minute: "about a minute",
        minutes: "%d minutes",
        hour: "about an hour",
        hours: "about %d hours",
        day: "a day",
        days: "%d days",
        month: "about a month",
        months: "%d months",
        year: "about a year",
        years: "%d years"
    };
    var template = function(t, n) {
        return templates[t] && templates[t].replace(/%d/i, Math.abs(Math.round(n)));
    };

    var timer = function(time) {
        if (!time)
            return;
        time = time.replace(/\.\d+/, ""); // remove milliseconds
        time = time.replace(/-/, "/").replace(/-/, "/");
        time = time.replace(/T/, " ").replace(/Z/, " UTC");
        time = time.replace(/([\+\-]\d\d)\:?(\d\d)/, " $1$2"); // -04:00 -> -0400
        time = new Date(time * 1000 || time);

        var now = new Date();
        var seconds = ((now.getTime() - time) * .001) >> 0;
        var minutes = seconds / 60;
        var hours = minutes / 60;
        var days = hours / 24;
        var years = days / 365;

        return templates.prefix + (
                seconds < 45 && template('seconds', seconds) ||
                seconds < 90 && template('minute', 1) ||
                minutes < 45 && template('minutes', minutes) ||
                minutes < 90 && template('hour', 1) ||
                hours < 24 && template('hours', hours) ||
                hours < 42 && template('day', 1) ||
                days < 30 && template('days', days) ||
                days < 45 && template('month', 1) ||
                days < 365 && template('months', days / 30) ||
                years < 1.5 && template('year', 1) ||
                template('years', years)
                ) + templates.suffix;
    };

    var elements = document.getElementsByClassName('timeago');
    // console.log(elements)
    for (var i in elements) {
        var $this = elements[i];
        if (typeof $this === 'object') {
            $this.innerHTML = timer($this.getAttribute('title') || $this.getAttribute('datetime'));
        }
    }
    // update time every minute
    setTimeout(timeAgo, 5000);
})();

