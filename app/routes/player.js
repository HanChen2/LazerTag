var Players = require('../models/player');
var spark = require('spark');

spark.login({accessToken: '7dced5eb59950c74101a99ac0e5213867f86f28c'});

//combine all the functions together and export as a whole
module.exports = function(app){

	// api ---------------------------------------------------------------------
	// get all players
	app.get('/api/players', getPlayers);

	// create a player and send back all players after creation
	app.put('/api/players', function(req, res){
		// create a player, information comes from AJAX request from Angular
		console.log(req.body);
		Players.create({
			playerName: req.body.playerName,
			lives: req.body.lives,
			infraID: req.body.infraID,
			deviceID: req.body.deviceID
		}, function(err, player){
			if(err){
				res.send(400, err);
				return;
			}
			// get and return all the players after you create another
			getPlayers(req, res);
		});
	});

	// delete a player
	app.delete('/api/players/:deviceID', function(req, res){
		Players.remove({
			deviceID: req.params.deviceID
		}, function(err, player){
			if(err){
				res.send(400, err);
				return;
			}
			// get and return all the players after you create another
			getPlayers(req, res);
		});
	});

	// update life count of a player
	app.post('/api/players/:deviceID', function(req, res){
		Players.findOneAndUpdate(
			{deviceID: req.body.deviceID},
			{ $inc: {lives: -1}},
			function(err, player){
			if(err){
				res.send(400, err);
				return;
			}
			// get and return all the players after you create another
			getPlayers(req, res);
		});
	});

	// application -------------------------------------------------------------
	app.get('*', function(req, res) {
		res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
	});
}

function getPlayers(req, res){
	// use mongoose to get all players in the database
	Players.find({}, function(err, players){
		// if there is an error retrieving, send the error. nothing after res.send(err)
		if(err){
			res.send(400, err);
			return;
		}
		res.send(200, players); //return all players in JSON format
	}).sort({lives: -1});
}

function playerGotShot(req, res, deviceID) {
	Players.findOneAndUpdate(
		{deviceID: deviceID},
		{ $inc: {lives: -1}},
		function(err, player){
		if(err){
			res.send(400, err);
			return;
		}
		// get and return all the players after you create another
		getPlayers(req, res);
	});
}


// -------------------------- Spark -------------------------
/*
	Way to get event streams from the Sparks
*/
spark.getEventStream('button-pressed', false, function(data) {
  console.log("Event: " + data);

	var formData = {
	  deviceID: data.data,
	};

	request.post({url:'http://localhost:3000/api/players', formData: formData},
	function optionalCallback(err, httpResponse, body) {
	  if (err) {
	    return console.error('upload failed:', err);
	  }
  	console.log('Upload successful!  Server responded with:', body);
	});
});
