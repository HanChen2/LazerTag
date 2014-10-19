var accountSid = 'AC6f1dfc2183d8c63aea6fc04ffd8838d0'; 
var authToken = '1e1e0dfef2532a936093d3c3e21760b5'; 
 
//require the Twilio module and create a REST client 
var client = require('twilio')(accountSid, authToken); 

var Players = require('../models/player');

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
			phoneNumber: req.body.phoneNumber,
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

	//req.params DOT or paratheses 

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
		Players.findOne(
			{deviceID: req.params.deviceID},
			function(err, player){
			if(err){
				res.send(400, err);
				return;
			}
			// get and return all the players after you create another
			if (player.lives > 0){
				console.log("Player is not dead");
				player.update({ $inc: {lives: -1}}, function(err, player){});
			}
			if (player.lives == 1){
				console.log("Player is not dead");
				player.update({ $inc: {lives: -1}}, function(err, player){});
				client.messages.create({ 
					to: "8477014127", 
					from: "+14843263088", 
					body: "Thanks for playing!",   
				}, function(err, message) { 
					console.log(message.sid); 
				});
			}

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