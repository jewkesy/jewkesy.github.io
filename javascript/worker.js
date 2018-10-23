var max = 10;
var counter = 0;
onmessage = e => {
	// console.log(e)
  const message = e.data;
  //console.log('[From Main]', message);
  const reply = setTimeout(() => {
  	counter++;
  	if (counter >= max) close();
  	postMessage({msg: "Polo!", counter: counter});
  }, 1000);
};