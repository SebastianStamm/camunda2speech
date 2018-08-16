define(["angular"], function(angular) {
  var ngModule = angular.module("tasklist.speak", []);

  const recognition = new webkitSpeechRecognition();

  let state = "";

  recognition.continuous = true;
  recognition.lang = "en-US";

  recognition.onend = function() {
    recognition.start();
  };

  recognition.onresult = function(event) {
    console.log("got a result", event);
    for (var i = event.resultIndex; i < event.results.length; ++i) {
      handle(event.results[i][0].transcript);
    }
  };

  recognition.start();

  function handle(text) {
    console.log("recognized text", text);

    const processed = text.toLowerCase().trim();
    if (/(enable|activate).*night.*mode/gi.test(processed)) {
      document.body.style.transition = "filter 1s";
      document.body.style.filter = "invert(100%)";
    }

    if (state === "") {
      if (/start.*process/gi.test(processed)) {
        document.querySelectorAll('[ng-click="open()"]')[1].click();
        state = "processStart";
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
            }, 700);
          }
        }
      }

      // next task
      if (/next task/gi.test(processed)) {
        document
          .querySelector(".task.active")
          .nextElementSibling.querySelector(".clickable")
          .click();
      }

      // previous task
      if (/previous task/gi.test(processed)) {
        document
          .querySelector(".task.active")
          .previousElementSibling.querySelector(".clickable")
          .click();
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
            700
          );
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
