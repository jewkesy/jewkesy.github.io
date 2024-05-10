"use strict";

var aws = "https://e94s2o5jyb.execute-api.eu-west-1.amazonaws.com/prod/getHomePageContent";

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

function buildIconHTML(deviceIcon, locale, deviceType) {
	var lIcon = "<img class='locale' width='16' title='"+locale+"' src='./flags/"+locale+".png' />";
	var dIcon = "<img width='18' class='device iconMergeCorner' title='"+deviceIcon+"' alt='"+deviceIcon+"' src='./images/"+deviceIcon+".png' />";
	return "<div class='iconMerge' style='white-space: nowrap;' alt='"+locale+"' >" + lIcon + dIcon + "&nbsp;<strong>" + deviceType + "</strong></div>";
	// return "<span>"+deviceType+"</span><div class='iconMerge' alt='"+locale+"' >" + lIcon + dIcon + "</div>";
}

function getDeviceInfo(device, playerIcon, boosterIcon, boosterDetails) {
	var sym = "";
	var booster = "";
	var deviceType = "⚇";
	var deviceIcon = "alexa";
	var symbolOverride;

	if (device == "Echo Show" || device == "EchoShow") 	deviceType = "🖥️";
	else if (device == "FireTV")						deviceType = "📺";
	else if (device == "EchoSpot")						deviceType = "🕳️";
	else if (device == "Google")		 { deviceType = ""; deviceIcon = "google"; }
	else if (device == "Google Surface"){ deviceType = ":";deviceIcon = "google"; }
	else if (device == "Google Phone")  { deviceType = ".";deviceIcon = "google"; }
	else if (device == "Google Speaker"){ deviceType = ""; deviceIcon = "google"; }

	if (playerIcon == 'star')       symbolOverride = "<img title='Daryl' class='profilepic' height='40px' src='https://avatars2.githubusercontent.com/u/1673570'/>";//sym = " ⭐";
	else if (playerIcon == 'sun')   sym = " 🌞";
	else if (playerIcon == 'note')  sym = " 🎵";
	else if (playerIcon == 'hash')  sym = " 🌭";
	else if (playerIcon == 'phone') sym = " 📱";
	else if (playerIcon == 'en-us') sym = " 🍔";
	else if (playerIcon == 'dev')   sym = " 💻";
	else if (playerIcon == 'llama') sym = " 🦙";
	else if (playerIcon == 'Gary')  symbolOverride = "<img title='Gary' class='profilepic' height='40px' src='https://avatars.githubusercontent.com/u/37657036'/>"

	if (boosterIcon >= 0 && Object.keys(boosterDetails).length !== 0) booster = " 🚀";
	return {device: deviceType, deviceIcon: deviceIcon, sym: sym, booster: booster, symbolOverride: symbolOverride}
}

function getGenreEventTitle(genre, suffix) {
	var br = "<br/>";
	var l = _pqLocale.split('-')[0];
	if (genre == "Horror_Seasonal") {
			 if (l == 'es') return br + "🎃 Evento de halloween";
		else if (l == 'it') return br + "🎃 Evento di Halloween";
		else if (l == 'fr') return br + "🎃 Événement d'Halloween";
		else if (l == 'de') return br + "🎃 Halloween-Veranstaltung";
		else if (l == "pt") return br + "🎃 Evento de Halloween";
		else if (l == "da") return br + "🎃 Halloween begivenhed";
		else if (l == "nl") return br + "🎃 Halloween-evenement";
		else if (l == 'ja') return br + "🎃 ハロウィーンイベント";
		return br + "🎃 Halloween Event";
	} else if (genre == "Romance_Seasonal") {
		return br + "🥰 Valentines Event";
	}
	genre = genre.replace("_", " ");
	if (suffix && suffix.length > 0) return genre + " " + suffix;
	if (genre.length > 0) return br + genre;
	return "";
}

function dynamicSort(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

function percentage(partialValue, totalValue) {
	return (100 * partialValue) / totalValue;
} 

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
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

var gettingLastPlay = {};
function httpGetLastPlay(theUrl, prefix, callback) {
	// console.log(theUrl, gettingLastPlay, prefix)
	if (gettingLastPlay[prefix] === true) {console.log("Getting Last Plays Already!", prefix); return callback(null, null);}
	gettingLastPlay[prefix] = true;
	var xmlHttp = null;
	xmlHttp = new XMLHttpRequest();

	xmlHttp.onreadystatechange = function (oEvent) {
		gettingLastPlay[prefix] = false;
		if (xmlHttp.readyState == 4) {
			if (xmlHttp.status == 200) {
				var doc = JSON.parse(xmlHttp.responseText);
				// console.log(doc)
				if (callback) return callback(null, doc);
			}
			if (callback) return callback(xmlHttp.status);
		}
	}
	xmlHttp.open("GET", theUrl, true);
	xmlHttp.send(null);
}

var gettingStats = {};
function httpGetStats(theUrl, prefix, callback){
	// console.log(gettingStats, prefix)
	if (gettingStats[prefix] === true) {console.log("Getting Stats Already!", prefix); return callback(null, null);}
	gettingStats[prefix] = true;
	var xmlHttp = null;
	xmlHttp = new XMLHttpRequest();
	
	xmlHttp.onreadystatechange = function (oEvent) {
		gettingStats[prefix] = false;
		if (xmlHttp.readyState === 4) {  
	        if (xmlHttp.status === 200) {  
				var doc = JSON.parse(xmlHttp.responseText);
				// console.log(doc)
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
    just: " %d seconds",
    seconds: "less than a minute",
    minute: "a minute",
    minutes: "%d mins",
    hour: "an hour",
    hours: "%d hrs",
    day: "a day",
    days: "%d days",
    month: "a month",
    months: "%d months",
    yearExact: "a year",
    year: "a year",
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
    		seconds < 30 && template('just', seconds) || 
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
	setTimeout(function(){
	    var elements = document.getElementsByClassName('timeago');

	    for (var i in elements) {
	        var $this = elements[i];
	        if (typeof $this === 'object') {
	            $this.innerHTML = humanTime($this.getAttribute('title') || $this.getAttribute('datetime'));
	        }
	    }
	    requestAnimationFrame(timeAgo);
	}, 5000);
})();

function getCssStar(score) {
	var retVal = 'a-star-' + (Math.round(score*2)/2).toString().replace(".", "-");
	return retVal;
}

function daydiff(first, second, includeLast) {
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

function getDaysAgo(dayAgo) {
	var d = new Date();
	var dateAgo = new Date(d.setDate(d.getDate() - dayAgo));
	// console.log(dateAgo)
	var retVal = dateAgo.getFullYear()+"-"+(dateAgo.getMonth()+1)+"-"+dateAgo.getDate();
	// console.log(retVal)
	// 2020-5-27
	return retVal || 0;
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
		else x = Math.ceil(x/slots);
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

function fadeyStuff(id, val, attr) {
	// if (!val) return;
	if (!document.getElementById(id)) return;

	if (document.getElementById(id).innerHTML == val) return;

	$("#"+id).fadeOut(666, function () {
		if (!document.getElementById(id)) return false;
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

function fadeyElement(id) {
	$("#"+id).fadeOut(666, function () {
		$("#"+id).fadeIn();
	});
}

function cleanseText(txt) {
	txt = txt.replaceAll('\n', '<hr>');
	txt = txt.replaceAll(".?", "?");
	txt = txt.replaceAll('<emphasis level="reduced">', '<span class="standout">');
	txt = txt.replaceAll('</emphasis>', '</span>');

	txt = txt.replaceAll('<i>', '<i>"');
	txt = txt.replaceAll('</i>', '"</i>');

	txt = txt.replaceAll(' "<i>"', ' <i>"');
	txt = txt.replaceAll('"</i>"?', '"</i>?');

	txt = txt.replaceAll(' <i>""', ' <i>"');
	txt = txt.replaceAll('""</i>?', '"</i>?');

	txt = txt.replaceAll('<i>"<hr>', '<i>"');
	
	//console.log(txt)
	return txt;
}

function randomInt(low, high) {
  return Math.floor(Math.random() * (high));
}

function summariseChtData(data, percentage) {
	if (!percentage) percentage = 75;  // lower = more recent; 100 = full, 1.2 = half
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

	// var trunc_length = Math.ceil(l / fraction); // no of days to compress
	var trunc_length = (l/100)*percentage;
	// console.log(l, percentage, trunc_length)

	var summarised = {};
	
	for (var property in data) {
	    if (data.hasOwnProperty(property)) {
	    	summarised[property] = data[property].splice(0, trunc_length);
	    }
	}

	for (var property in summarised) {
	    if (summarised.hasOwnProperty(property)) {
	    	if (property == 'labels') {
	    		summarised[property] = [];
	    		resizeArr(summarised[property], newSize, "");
	    		summarised[property][0] = initialLabel;
	    		var mid = Math.round(summarised[property].length/2);
	    		summarised[property][mid] = +(trunc_length).toFixed(0) + " days avg";
	    	} else if (property == 'we' || property == 'mo') {
	    		summarised[property] = [];
	    		resizeArr(summarised[property], newSize, null);
	    	} else {
	    		summarised[property] = reduceArr(summarised[property], newSize);
	    	}
	    }
	}

	// merge new left side
	for (var property in summarised) {
	    if (summarised.hasOwnProperty(property)) {
	    	summarised[property] = summarised[property].concat(data[property]);
	    }
	}
	// console.log(summarised)
	return summarised;
}

function sumObjCounts(obj) {
	// console.log(obj)
	var total = 0;

	for (var x in obj) {
		if (obj.hasOwnProperty(x)) {
			total += obj[x];
		}
	}

	return total;
}
