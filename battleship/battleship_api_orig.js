/*

 * ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 * Copyright 2020 Amazon.com (http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
 * These materials are licensed as "Restricted Program Materials" under the Program Materials
 * License Agreement (the "Agreement") in connection with the Amazon Alexa voice service.
 * The Agreement is available at https://developer.amazon.com/public/support/pml.html.
 * See the Agreement for the specific terms and conditions of the Agreement. Capitalized
 * terms not defined in this file have the meanings given to them in the Agreement.
 * ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

*/

// conditionally initialize the alexa object depending on whether we're local
let alexaVersion = '0.2';
let alexa = null;

if (window.alexaHtmlLocalDebug) {
  // both alexaHtmlLocalDebug and LocalMessageProvider are injected into the page by alexa-html-local
  alexa = new Alexa({
    version: alexaVersion,
    messageProvider: new LocalMessageProvider()
  });
} else {
  alexa = new Alexa({
    version: alexaVersion
  });
  console.log(alexa)
}

// handle the ready message
alexa.onReady(function(msg){
  printEvent("RDY",msg);
  // Here we'll reshape the viewport to make debugging a little easier
  //   the page retains whatever space you can give it, but the viewport will
  //   be the size of the device screen. This lets you place other debug
  //   elements on the page beside the device screen.
  let viewport = document.getElementById('container');
  let { physicalWidthInPixels, physicalHeightInPixels } = alexa.capabilities.display;
  console.log(physicalWidthInPixels, physicalHeightInPixels)
  if ( physicalWidthInPixels == 0 ) {
    // debug case of 'let it be as big as the window'
    physicalWidthInPixels = window.innerWidth;
    physicalHeightInPixels = window.innerHeight;
    viewport.style.width = '100%';
    viewport.style.height = '100%';
  } else {
    viewport.style.width = `${physicalWidthInPixels}px`;
    viewport.style.height = `${physicalHeightInPixels}px`;
  }

  // whether debug or not, here we can take the opportunity to set any
  // dynamic measurements to adapt to the screen size and shape

  // face.setSize(Math.floor(physicalWidthInPixels/8));
  viewport.style.fontSize = `${Math.floor(physicalHeightInPixels/12)}px`;

  if (alexa.capabilities.display.shape == 'circle') {
    // cheapest hack for circle masking!
    viewport.style.borderRadius = '100%';
    // need to squeeze a little harder here
    viewport.style.fontSize = `${Math.floor(physicalHeightInPixels/14)}px`;
  }

  // fade in the main screen, fade out the loading one
  viewport.style.opacity = 1;
  document.getElementById('loading').style.opacity = 0;

  sendDebugCommandList();
})

function sendDebugCommandList() {
  // this instructs the dashboard to add new debug buttons
  // you can send it repeatedly, to replace the set of buttons
  sendMessage({
    cmd: 'alexa-debug-command-list',
    items: {
      'test message': {
        cmd: "hello world",
        say: "hello, html application"
      }
    }
  });
}

// install the onMessage listener
alexa.skill.onMessage(function(msg) {
  printEvent("RCV", msg);

  // one useful pattern is to have a "command" parameter that
  // fires off behaviors
  switch (msg.cmd) {

    // Response to the debug 'test message' button added above
    case 'hello world':
      sendMessage({
        cmd: 'hello back'
      });
      break;

    case 'play transformed':
      // normally this transformer result would just be a URL string,
      // but in the local testing environment it's an object with the
      // url, and the speechmarks.
      if (alexaHtmlLocalDebug) {
        speechPlayer.src = msg.textURL.url;
        speechPlayer.onplay = () => {
          runSpeechMarks(msg.textURL.speechMarks);
        }
        speechPlayer.play();
      } else {
        // in the normal case, the speechmarks are embedded in the mp3
        // so we need to use the demuxer to extract them
        alexa.speech.demux(msg.textURL);
      }
      break;

  }

  // another useful pattern is to just have specific parameters be their
  // own command. this lets you easily mix common behaviors into the same message
  // interpret the presence of a "say" parameter to mean print speech text
  if (msg.show) {
    document.getElementById('speech').innerText = msg.show;
  }
});

// listen for speech events
alexa.speech.onStarted(function() {
  printEvent("EVT", { name: "speechStarted" });
  // document.getElementById('speech-indicator').className = 'speech-playing'
});

alexa.speech.onStopped(function() {
  printEvent("EVT", { name: "speechStopped" });
  // document.getElementById('speech-indicator').className = ''
});



// bind this button to just send a "ping" message to the skill
document.getElementById('ping').addEventListener('click', () => sendMessage({ cmd:'ping'}));




// the simplest speech player is just a single audio tag, which we'll
// fill in later with URLs we get from transformed messages
let speechPlayer = document.createElement('audio');
document.body.appendChild(speechPlayer);


// This is a simple captioning scheme: hang onto sentences when we get the
// sentence speechmark, then use the word speechmarks to highlight words
// as they're spoken

let sentence = null;
function processSpeechMark(mark) {
  // this function gets called for each transformer sourced speech mark
  // that occurs, when the speech is spoken
  console.log(mark);
  switch(mark.type) {
    case "sentence": {
      face.jiggle();
      sentence = mark;
      document.getElementById('speech').innerText = stripTags(sentence.value);
    }
    break;
    case "word": {
      let text = sentence.value;
      let start = mark.start - sentence.start;
      let end = mark.end - sentence.start;
      let display = text.substr(0,start) + "<b>" + mark.value + "</b>" + text.substr(end);
      document.getElementById('speech').innerHTML = stripTags(display);
    }
    break;
    case "end": {
      document.getElementById('speech').innerText = stripTags(sentence.value);
    }
    break;
    case "ssml": {
      let [command, data] = mark.value.split(':');
      switch (command) {
        case "color": {
          document.getElementById('dot').style.backgroundColor = data;
          face.setColor(data);
        }
      }
    }
    break;
    case "viseme": {
      face.setViseme(mark.value);
    }
  }
}

stripTags = function(str) {
  return str = str.replace(/<\/?mark[^>]*>/g, '');
}


let speechMarks = null;
let nextSpeechMark = 0;
let speechMarkStart = 0;
function tickSpeechMarks() {
  // the basic tick loop of speechmarks is to check how much
  // time has elapsed since we started playing, and deliver
  // any as yet undelivered speech marks that occur before now.
  let time = (new Date) - speechMarkStart;
  for (; nextSpeechMark<speechMarks.length; ++nextSpeechMark) {
    if (speechMarks[nextSpeechMark].time > time) {
      break;
    }
    processSpeechMark(speechMarks[nextSpeechMark]);
  }
  if (nextSpeechMark < speechMarks.length) {
    requestAnimationFrame(tickSpeechMarks);
  } else {
    // send a custom speech mark to signal end of playback
    processSpeechMark({type:'end'});
    speechMarks = null;
  }
}

function runSpeechMarks(newSpeechMarks) {
  if (!speechMarks) {
    requestAnimationFrame(tickSpeechMarks);
  }
  speechMarks = newSpeechMarks;
  speechMarkStart = new Date();
  nextSpeechMark = 0;
}



// local version of skill message sending, to intercept
// outgoing messages for logging
function sendMessage(msg) {
  printEvent("SND", msg);
  alexa.skill.sendMessage(msg);
}


// a debugging function to append messages to the debug display on the page
let outputElement = document.getElementById('message-list');
let appStart = new Date
function printEvent( channel, msg ) {
  console.log( channel, msg)
  return;
  let row = document.createElement('tr');
  let time = document.createElement('td');
  let message = document.createElement('td');
  row.appendChild(time);
  row.appendChild(message);

  dt = new Date - appStart;
  time.innerHTML = (dt / 1000).toFixed(2) + `s\n${channel}`;

  output = [];
  for( key in msg ) {
    if (msg[key] && msg[key].speechMarks) {
      let marks = msg[key].speechMarks;
      msg[key].speechMarks = '[redacted]';
      output.push(`${key}: ${JSON.stringify(msg[key],null,2)}`);
      msg[key].speechMarks = marks;
    } else {
      output.push(`${key}: ${JSON.stringify(msg[key],null,2)}`);
    }
  }
  message.innerText = output.join('\n');

  outputElement.appendChild(row);
  while ( outputElement.children.length > 20 ) {
    outputElement.removeChild(outputElement.firstChild);
  }
}
