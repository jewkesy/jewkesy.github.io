"use strict";

var aws = "https://e94s2o5jyb.execute-api.eu-west-1.amazonaws.com/prod/";

var displayCount = getParameterByName('count') || 10;
var displayLocale = getParameterByName('locale') || '';

var weekday = new Array(7);
weekday[0] = "Sunday";
weekday[1] = "Monday";
weekday[2] = "Tuesday";
weekday[3] = "Wednesday";
weekday[4] = "Thursday";
weekday[5] = "Friday";
weekday[6] = "Saturday";

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

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
	if (!x) return("0");
	var retVal = x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	// console.log(x, retVal);
    return retVal;
}

function resizeArr(arr, newSize, defaultValue) {
    while(newSize > arr.length)
        arr.push(defaultValue);
    arr.length = newSize;
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
				document.getElementById(prefix + '_total_players').innerHTML = numberWithCommas(doc.length);

				var count = 0;
				for (var i = 0; i < doc.length; i++) {
					count += doc[i].g;
				}

				document.getElementById(prefix + '_total_games').innerHTML = numberWithCommas(count);
			}
		}
	}
}

function httpGetByUrl(theUrl, callback) {
	var xmlHttp = null;
	xmlHttp = new XMLHttpRequest();
	xmlHttp.open("GET", theUrl, true);
	xmlHttp.onreadystatechange = handleReadyStateChange;
	xmlHttp.send(null);

	function handleReadyStateChange() {
		if (xmlHttp.readyState == 4) {
			if (xmlHttp.status == 200) {
				var doc = JSON.parse(xmlHttp.responseText);
				if (callback) return callback(null, doc);
			}
			if (callback) return callback(xmlHttp.status);
		}
	}
}

function httpGetLastPlay(theUrl, prefix, callback) {
	var xmlHttp = null;
	xmlHttp = new XMLHttpRequest();
	xmlHttp.open("GET", theUrl, true);
	xmlHttp.onreadystatechange = handleReadyStateChange;
	xmlHttp.send(null);

	function handleReadyStateChange() {
		if (xmlHttp.readyState == 4) {
			if (xmlHttp.status == 200) {
				var doc = JSON.parse(xmlHttp.responseText);
				if (callback) return callback(null, doc);
			}
			if (callback) return callback(xmlHttp.status);
		}
	}
}

function httpGetStats(theUrl, prefix, callback){
	var xmlHttp = null;
	xmlHttp = new XMLHttpRequest();
	
	xmlHttp.onreadystatechange = function (oEvent) {
		if (xmlHttp.readyState === 4) {  
	        if (xmlHttp.status === 200) {  
				// console.log(xmlHttp.responseText);
				var doc = JSON.parse(xmlHttp.responseText);
				buildTopTen(doc, prefix);
				if (callback) return callback(null, doc);
			} else {  
	           console.log("Error", theUrl, xmlHttp.status, xmlHttp.statusText);
	           if (callback) return callback(xmlHttp.status);
	        }  
	    }
	}
	xmlHttp.open("GET", theUrl, true);
	xmlHttp.send();
}

function buildTopTen(topTen, prefix) {
	var container = document.getElementById(prefix + '_scores')

	for (var i = 0; i < topTen.length; i++) {
		if (i >= displayCount) break;
		var x = i + 1;
		var id = prefix + "_" + x;
		var sym = "";
		if (topTen[i].icon == 'star') {sym = " &#9734;";}
		else if (topTen[i].icon == 'sun') {sym = " &#9788;";}
		else if (topTen[i].icon == 'note') {sym = " &#9834;";}

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

var templates = {
    prefix: "",
    suffix: " ago",
    seconds: "less than a minute",
    minute: "about a minute",
    minutes: "%d mins",
    hour: "about an hour",
    hours: "about %d hrs",
    day: "a day",
    days: "%d days",
    month: "about a month",
    months: "%d months",
    yearExact: "a year",
    year: "about a year",
    years: "%d years"
};

var template = function(t, n) {
    return templates[t] && templates[t].replace(/%d/i, Math.abs(Math.round(n)));
};    

function humanTime(time) {
	if (!time) return;
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
            days < 360 && template('months', days / 30) ||
            days < 390 && template('yearExact', 1) ||
            years < 1.5 && template('year', 1) ||
            template('years', years)
        ) + templates.suffix;
}

(function timeAgo(selector) {
    var elements = document.getElementsByClassName('timeago');

    for (var i in elements) {
        var $this = elements[i];
        if (typeof $this === 'object') {
            $this.innerHTML = humanTime($this.getAttribute('title') || $this.getAttribute('datetime'));
        }
    }
    // update time every minute
    setTimeout(timeAgo, 10000);
})();

function getCssStar(score) {
	var retVal = 'a-star-' + score.toString().replace(".", "-");
	return retVal;
}

function daydiff(first, second, includeLast) {
	// console.log(first.getDate(), first.getUTCDate())
	// console.log(second.getDate(), second.getUTCDate())
    // Copy date parts of the timestamps, discarding the time parts.
    var one = new Date(first.getFullYear(), first.getMonth(), first.getUTCDate());
    var two = new Date(second.getFullYear(), second.getMonth(), second.getUTCDate());

    // Do the math.
    var millisecondsPerDay = 1000 * 60 * 60 * 24;
    var millisBetween = two.getTime() - one.getTime();
    var days = millisBetween / millisecondsPerDay;

    if (includeLast) days++;
    // Round down.
    var retVal = Math.floor(days);
    return retVal;
}

function addDays(startDate,numberOfDays) {
	var returnDate = new Date(
		startDate.getFullYear(),
		startDate.getMonth(),
		startDate.getUTCDate()+numberOfDays,
		startDate.getHours(),
		startDate.getMinutes(),
		startDate.getSeconds());
	return returnDate;
}

function getMonthName(mon) {
	var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	return " " + monthNames[+mon];
}

function reduceArr(arr, count) {

	var slots = Math.ceil(arr.length/count);
	var chk = chunkArray(arr, slots);
	var retVal = [];

	for (var i = 0; i < chk.length; i++) {
		var x = chk[i].reduce(function(acc, val) { return acc + val; });
		if (x == 0) x = null;
		else x = Math.round(x/slots);
		retVal.push(x);
	}

	return retVal;
}

function chunkArray(myArray, chunk_size){
    var index = 0;
    var arrayLength = myArray.length;
    var tempArray = [];
    
    for (index = 0; index < arrayLength; index += chunk_size) {
        var myChunk = myArray.slice(index, index+chunk_size);
        // Do something if you want with the group
        tempArray.push(myChunk);
    }

    return tempArray;
}

// Update the appropriate href query string parameter
function paramReplace(param, url, value) {
	// console.log(param, url, value);

	var inline = "";
	if (url.indexOf("#") > -1) {
		inline = "#" + url.split("#")[1];
		url =  url.split("#")[0];
	}

	if (url.indexOf(param) === -1) {
		if (url.indexOf("?") === -1) {
			return url + "?" + param + "=" + value;
		}
		return url + "&" + param + "="+value;
	}
  // Find the param with regex
  // Grab the first character in the returned string (should be ? or &)
  // Replace our href string with our new value, passing on the name and delimiter
  var re = new RegExp("[\\?&#]" + param + "=([^&#]*)");
  var pos = re.exec(url);
  var delimiter = pos[0].charAt(0);

  if (!value || value === null) return url.replace(re, delimiter + param);
  var newString = url.replace(re, delimiter + param + "=" + value);
 
  return newString + inline;
}

function fadeyStuff(id, val) {
	if (!val) return;
	if (!document.getElementById(id)) return;

	if (document.getElementById(id).innerHTML == val) return;

	$("#"+id).fadeOut(666, function () {
		document.getElementById(id).innerHTML = val;
		$("#"+id).fadeIn();
	});
}

function fadeyPic(id, val) {
	if (!val) return;

	if (document.getElementById(id).src == val) return;

	$("#"+id).fadeOut(666, function () {
		document.getElementById(id).src = val;
		$("#"+id).fadeIn();
	});
}

function cleanseText(txt) {
	txt = txt.replaceAll(".?", "?");
	txt = txt.replaceAll('<emphasis level="reduced">', '<span class="standout">');
	txt = txt.replaceAll('</emphasis>', '</span>');

	txt = txt.replaceAll('<i>', '<i>"');
	txt = txt.replaceAll('</i>', '"</i>');
	return txt;
}

function randomInt(low, high) {
  return Math.floor(Math.random() * (high));
}

function summariseChtData(data, fraction) {
	if (!fraction) fraction = 1.2;  // lower = more recent; 100 = full, 1.2 = half
	var newSize = 10;
	// console.log(data)
	// check all same length;
	var initialLabel = data.labels[0];
	var l = -1;
	for (var property in data) {
	    if (data.hasOwnProperty(property)) {
	    	if (l == -1) { l = data[property].length; continue; }
	    	if (data[property].length != l) { 
	    		// console.log("Length mismatch, resetting", l, data[property].length, property, data); 
	    		reset(); 
	    		return data; 
	    	}
	    }
	}
	
	var trunc_length = Math.ceil(l / fraction);
	var leftSide = {};
	
	for (var property in data) {
	    if (data.hasOwnProperty(property)) {
	    	leftSide[property] = data[property].splice(0, trunc_length);
	    }
	}

	for (var property in leftSide) {
	    if (leftSide.hasOwnProperty(property)) {
	    	if (property == 'labels') {
	    		leftSide[property] = [];
	    		resizeArr(leftSide[property], newSize, "");
	    		leftSide[property][0] = initialLabel;
	    		var mid = Math.round(leftSide[property].length/2);
	    		leftSide[property][mid] = trunc_length + " days avg";
	    	} else if (property == 'we' || property == 'mo') {
	    		leftSide[property] = [];
	    		resizeArr(leftSide[property], newSize, null);
	    	} else {
	    		leftSide[property] = reduceArr(leftSide[property], newSize);
	    	}
	    }
	}

	// merge new left side
	for (var property in leftSide) {
	    if (leftSide.hasOwnProperty(property)) {
	    	leftSide[property] = leftSide[property].concat(data[property]);
	    }
	}

	return leftSide;
}
