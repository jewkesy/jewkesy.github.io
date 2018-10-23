var max = 10;
var counter = 0;


onmessage = e => {
	// console.log(e)
  const message = e.data;

  if (message.action == "summariseChtData") {

  	var retVal = summariseChtData(message.data, message.percentage);
  	postMessage({msg: "summariseChtData_response", data: retVal});
  }

  //console.log('[From Main]', message);
  // const reply = setTimeout(() => {
  // 	counter++;
  // 	if (counter >= max) close();
  // 	postMessage({msg: "Polo!", counter: counter});
  // }, 1000);
};


function summariseChtData(data, percentage) {
	if (!percentage) percentage = 75;  // lower = more recent; 100 = full, 1.2 = half
	var newSize = 10;
	console.log(data)
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
