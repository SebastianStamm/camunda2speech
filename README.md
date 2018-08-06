# camunda2speech

Control Your Camuda With Your Voice

# Install Frontend

Copy the contents of the frontend folder into a new directory called `speak` in the `app/tasklist/scripts/` folder in your Camunda webapp distribution. For the Tomcat distribution, this would be `server/apache-tomcat-X.X.XX/webapps/camunda/app/tasklist/scripts/speak`.

Add the following content to the `customScripts` object in the `app/tasklist/scripts/config.js` file:

```
  // …
  customScripts: {
    ngDeps: ['tasklist.speak'],

    deps: ['speak'],

    // RequreJS path definitions
    paths: {
      'speak': 'scripts/speak/index'
    }
  }
  // …
```
