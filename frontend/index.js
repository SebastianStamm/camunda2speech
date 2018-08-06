const endpoint = "http://192.168.80.143:8000/api/guess";

define(["angular"], function(angular) {
  var ngModule = angular.module("tasklist.speak", []);

  const recognition = new webkitSpeechRecognition();

  recognition.continuous = true;
  recognition.lang = "en-US";

  recognition.onend = function() {
    recognition.start();
  };

  recognition.onresult = function(event) {
    for (var i = event.resultIndex; i < event.results.length; ++i) {
      handle(event.results[i][0].transcript);
    }
  };

  recognition.start();

  function handle(text) {
    const processed = text.toLowerCase().trim();
    if (
      processed.includes("enable night mode") ||
      processed.includes("activate night mode")
    ) {
      document.body.style.transition = "filter 1s";
      document.body.style.filter = "invert(100%)";
    }
  }

  return ngModule;
});
