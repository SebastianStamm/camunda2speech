const endpoint = "http://192.168.80.143:8000/api/guess";

define(["angular"], function(angular) {
  var ngModule = angular.module("tasklist.speak", []);

  const scriptTag = document.createElement("script");
  scriptTag.setAttribute(
    "src",
    "/camunda/app/tasklist/scripts/speak/lib/hark.bundle.js"
  );
  document.head.appendChild(scriptTag);

  const interval = window.setInterval(() => {
    if (window.hark) {
      window.clearInterval(interval);

      navigator.mediaDevices
        .getUserMedia(
          // constraints - only audio needed for this app
          {
            audio: true
          }
        )

        // Success callback
        .then(function(stream) {
          var options = { threshold: -50 };
          var speechEvents = hark(stream, options);
          var mediaRecorder = new MediaRecorder(stream);
          var chunks = [];
          mediaRecorder.ondataavailable = function(e) {
            chunks.push(e.data);
          };

          speechEvents.on("speaking", function() {
            console.log("start speaking");
            mediaRecorder.start();
          });

          speechEvents.on("stopped_speaking", function() {
            console.log("stop speaking");
            mediaRecorder.stop();
          });

          mediaRecorder.onstop = function(e) {
            var blob = new Blob(chunks, { type: "audio/wav" });
            sendToServer(blob, handleResponse);
          };
        })

        // Error callback
        .catch(function(err) {
          console.log("The following getUserMedia error occured: " + err);
        });

      async function sendToServer(blob, response) {
        const resp = await fetch(endpoint, {
          method: "POST",
          body: blob,
          headers: { "Content-Type": "text/plain" }
        });

        response(resp);
      }
    }
  }, 100);

  function handleResponse(text) {
    const processed = text.toLowerCase().trim();
    if (
      processed.includes("enable nightmode") ||
      processed.includes("enable night mode")
    ) {
      document.body.style.transition = "filter 1s";
      document.body.style.filter = "invert(100%)";
    }
  }

  window.handleResponse = handleResponse;

  return ngModule;
});
