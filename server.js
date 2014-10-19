var express = require('express'); //Main framework for all routing
var morgan = require('morgan'); //Morgan helps log everything with our server
var bodyParser = require('body-parser'); //Body parse helps parse bodies sent in
var mongoose = require('mongoose'); //Mongoose is the middleware to connect to mongodb
var config = require('./config'); //load up config file

var app = express(); //Running this framework and storing it into app

//Running our middleware on all routes
app.use(morgan('dev'));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

mongoose.connect("localhost:27017/myDataBase");

app.use(express.static(__dirname + "/public")); // Automatic routing for all static files

require('./app/routes/player')(app);

app.listen(process.env.PORT || 3000); //Run the server on port 3000
console.log("Server now running on port 3000");
