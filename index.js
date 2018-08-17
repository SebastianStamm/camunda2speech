define(["angular"], function(angular) {
  var ngModule = angular.module("tasklist.speak", []);

  let finalTranscript = "";

  const scroller = document.createElement("div");
  scroller.style.position = "fixed";
  scroller.style.bottom = "20px";
  scroller.style.width = "100vw";
  scroller.style.fontSize = "4em";
  scroller.style.zIndex = "10000";
  scroller.style.padding = "0.5em";
  scroller.style.backgroundColor = "rgba(255,255,255,0.8)";
  scroller.style.pointerEvents = "none";
  scroller.style.textShadow = "2px 2px 2px lightgray";
  scroller.style.whiteSpace = "nowrap";
  scroller.style.overflow = "hidden";

  document.body.appendChild(scroller);

  // scroller.textContent = "Hell world, this should work now";

  const recognition = new webkitSpeechRecognition();

  let state = "";

  recognition.continuous = true;
  recognition.lang = "en-US";
  recognition.interimResults = true;

  recognition.onend = function() {
    recognition.start();
  };

  recognition.onresult = function(event) {
    console.log("got a result", event);
    let interimTranscript = "";
    for (var i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += " " + event.results[i][0].transcript;
        handle(event.results[i][0].transcript);
      } else {
        interimTranscript += " " + event.results[i][0].transcript;
      }
      scroller.innerHTML =
        finalTranscript +
        ' <span style="color: #ccc;">' +
        interimTranscript +
        "</span>";
      scroller.scrollLeft = Number.MAX_SAFE_INTEGER;
    }
  };

  recognition.start();

  function handle(text) {
    console.log("recognized text", text);

    const processed = text.toLowerCase().trim();
    if (/(enable|activate).*(night|dark).*mode/gi.test(processed)) {
      document.body.style.transition = "filter 1s";
      document.body.style.filter = "invert(100%)";
      document.body.style.height = "100vh";
    }

    if (/(refresh|reload).*page/gi.test(processed)) {
      window.location.reload();
      return;
    }

    if (state === "") {
      if (/start.*process/gi.test(processed)) {
        document.querySelectorAll('[ng-click="open()"]')[1].click();
        state = "processStart";
        return;
      }

      // goto filter
      const matches = new RegExp("go.*filter (.*)$", "gi").exec(processed);
      if (matches) {
        const filters = document.querySelectorAll(".task-filter");
        for (let i = 0; i < filters.length; i++) {
          if (filters[i].textContent.toLowerCase().includes(matches[1])) {
            filters[i].querySelector("a").click();
            window.setTimeout(() => {
              document.querySelector(".task .clickable").click();
            }, 900);
          }
        }
        return;
      }

      // next task
      if (/next task/gi.test(processed)) {
        document
          .querySelector(".task.active")
          .nextElementSibling.querySelector(".clickable")
          .click();
        return;
      }

      // previous task
      if (/previous task/gi.test(processed)) {
        document
          .querySelector(".task.active")
          .previousElementSibling.querySelector(".clickable")
          .click();
        return;
      }

      if (/complete.*task/gi.test(processed)) {
        document.querySelector('button[ng-click="complete()"]').click();
        window.setTimeout(() => {
          document.querySelector(".task .clickable").click();
        }, 900);
        return;
      }

      // claim task
      if (/claim.*task/gi.test(processed)) {
        const claimButton = document.querySelector(".claim");
        if (claimButton) {
          claimButton.click();
        } else {
          document.querySelector(".unclaim").click();
          window.setTimeout(
            () => document.querySelector(".claim").click(),
            900
          );
        }
        return;
      }

      const inputFields = document.querySelectorAll(
        "[cam-tasklist-form] input:not([readonly])"
      );
      for (let i = 0; i < inputFields.length; i++) {
        const label = inputFields[i].parentNode.textContent
          .toLowerCase()
          .trim()
          .replace(/\W/g, "");
        if (processed.replace(/\W/g, "").includes(label)) {
          if (/\Wyes\W/gi.test(" " + processed + " ")) {
            inputFields[i].checked = true;
          }
          if (/\Wno\W/gi.test(" " + processed + " ")) {
            inputFields[i].checked = false;
          }
        }
      }
    }

    if (state === "processStart") {
      const processes = document.querySelectorAll(
        'a[ng-click="selectProcessDefinition(processDefinition)"]'
      );
      for (let i = 0; i < processes.length; i++) {
        const process = processes[i];
        if (processed.includes(process.textContent.toLowerCase().trim())) {
          process.click();
          state = "processStartForm";
          break;
        }
      }
    }

    if (state === "processStartForm") {
      if (/(submit.*form|start.*process)/gi.test(processed)) {
        document
          .querySelector('.modal-footer button[type="submit"]')
          .removeAttribute("disabled");
        document.querySelector('.modal-footer button[type="submit"]').click();
        state = "";
      }

      const fields = document.querySelectorAll(".modal-body form .form-group");

      for (let i = 0; i < fields.length; i++) {
        const label = fields[i]
          .querySelector("label")
          .textContent.toLowerCase();
        const matches = new RegExp(`${label}.*(?:is|be) (.*)$`, "gi").exec(
          processed
        );
        if (matches) {
          if (fields[i].querySelector("input")) {
            fields[i].querySelector("input").value = matches[1];
          } else if (fields[i].querySelector("select")) {
            const options = fields[i].querySelectorAll("option");

            for (let j = 0; j < options.length; j++) {
              if (matches[1] === options[j].textContent.toLowerCase()) {
                fields[i].querySelector("select").value =
                  options[j].textContent;
                return;
              }
            }
          }
        }
      }
    }
  }

  window.handle = handle;

  return ngModule;
});
