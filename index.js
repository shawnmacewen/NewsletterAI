const express = require("express");
// Create instance of application
const app = express();


//Cors 
const cors = require('cors');

  app.use(cors());

//import body parser for the app to parse JSON
const bodyParser = require("body-parser");


// FRONT END WORK
// front end express setup and serve static files
app.use(express.static('public'))

// Serve the main index file for the root route
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Middleware
//use body parsewr middle ware to parse incoming JSOn
app.use(bodyParser.json());

//import chatGPT endpoint module
const chatGPTRoutes = require("./routes/chatGPT");

// use chatgpt endpoint module to handle request to "/chatGPT" endpoint
app.use("/chatGPT", chatGPTRoutes);



//error handling 
// handle errors with status message
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Internal Server Error - SM1");
});



// Basic route for testing
    app.get('/test', (req, res) => {
    res.json({ message: "Server is currently active. - SM7" });
    });


// decalre port variable
const PORT = process.env.PORT || 3000;

//start the server and listen on port 
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
    console.log('Filecheck: 8')
});


