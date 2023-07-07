
![GitHub package.json version (branch)](https://img.shields.io/github/package-json/v/GEEGABYTE1/ECommerce/main)
# RestEcon

Ecommerce Simulator made only with RestfulAPIs with express-js backend. The interaction is completely through the terminal with an optimized PostgreSQL database. The database is optimized for transactions, searching, creating your own marketplace, and all other functionalities you would find in an ecommerce application.

There is also Swagger Documentation for reference on how to use the APIs. This is written and shipped as an HTML/Express app.


## Launching RestEcon
RestEcon can be launched through the project's root directory. With the `index.js` file located, they can run the command in the terminal within the project directory
```bash
    node index.js 
```
The app will respond as so when ran successfully
```bash
    Server is Running on Port: ${PORT}
```
Given this message, the user can navigate to their localhost
```bash
    https://localhost:PORT
```
The initial webpage is for registration and login. The user MUST register first, otherwise they will run into an error. If the user successfully registers and logs in, the user will be faced with a "success" page that tells them that they have successfully logged in.

After logging in, they can interact with their simulator with an application that can call API requests like Postman.


## Accessing Swagger API Documentation

Swagger Documentation for the different APIs can be found by:

```bash
  git clone https://github.com/GEEGABYTE1/ECommerce.git
  cd ECommerce
```

```bash
    npm install
```
Now that you have all node dependencies, you can navigate to the `ECommerce OpenAPI Doc` directory
```bash
    cd Ecommerce\ OpenAPI\ Doc/
```
To download all of Swagger's in-built node dependencies, we will run the npm command again within the Swagger directory
```bash 
    npm install
```

Now you run the `main.js` file with Node in your terminal within the Swagger directory:
```bash
    node main.js
```
Given that the port that the app will listen to is `8002` (which is documented on `main.js`), the Swagger documentation can be found by navigating to
```bash
    https://localhost:8002
```

### Configuring Launch Port for localhost
One can easily change the port the Swagger Documentation runs on. In the root directory of the project, navigate to the `Ecommerce OpenAPI Doc` directory:
```bash
    cd Ecommerce\ OpenAPI\ Doc/
```
In `main.js` the last line will be the port where the express server will be launched. You can change this to any port you want
```bash
//main.js

var express = require("express")

var app = express();
var docs_handler = express.static(__dirname + '/docs/');
app.use(docs_handler);

//  the server will start on port 
app.listen(PORT_NUMBER);
```
After changing the port, you can run the Swagger file by initializing `main.js` with Node within the Swagger directory
```bash
 node main.js
```
The localhost does not print on the user's console, and so it is required that they manually navigate to it from their browser as so:
```bash
    https://localhost:{PORT_NUMBER_FOUND_ON_MAIN.JS}
```

## License

[MIT](https://choosealicense.com/licenses/mit/)


## Extra Information and Support

**Note**: The database is currently not live, but will be in the future. There will be a new release when that happens.


[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/) 
![GitHub commit activity (branch)](https://img.shields.io/github/commit-activity/t/GEEGABYTE1/Ecommerce)
![GitHub Repo stars](https://img.shields.io/github/stars/GEEGABYTE1/ECommerce)


Any concerns or comments can be communicated to me by my socials, which can be found on my [website](www.jaivalpatel.com).
