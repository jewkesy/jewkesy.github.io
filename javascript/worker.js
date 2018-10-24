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
