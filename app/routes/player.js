var accountSid = 'AC6f1dfc2183d8c63aea6fc04ffd8838d0';
var authToken = '1e1e0dfef2532a936093d3c3e21760b5';

//require the Twilio module and create a REST client 
var client = require('twilio')(accountSid, authToken);

var request = require('request')
var Players = require('../models/player');
var spark = require('spark');

spark.login({accessToken: '7dced5eb59950c74101a99ac0e5213867f86f28c'});

var connectedClients = [];

//combine all the functions together and export as a whole
module.exports = function (app, io) {

    // api ---------------------------------------------------------------------
    // get all players
    app.get('/api/players', getPlayers);

    // create a player and send back all players after creation
    app.put('/api/players', function (req, res) {
        // create a player, information comes from AJAX request from Angular
        console.log(req.body);
        Players.create({
            playerName: req.body.playerName,
            lives: req.body.lives,
            initLives: req.body.lives,
            phoneNumber: req.body.phoneNumber,
            infraID: req.body.infraID,
            deviceID: req.body.deviceID
        }, function (err, player) {
            if (err) {
                res.send(400, err);
                return;
            }
            updatePlayersOnClients();
            // get and return all the players after you create another
            getPlayers(req, res);
        });
    });

    // delete a player
    app.delete('/api/players/:deviceID', function (req, res) {
        Players.remove({
            deviceID: req.params.deviceID
        }, function (err, player) {
            if (err) {
                res.send(400, err);
                return;
            }
            updatePlayersOnClients();
            // get and return all the players after you create another
            getPlayers(req, res);
        });
    });

    // update life count of a player
//    app.post('/api/players/:deviceID', function (req, res) {
//        Players.findOne(
//            {deviceID: req.body.deviceID}, //double check body or parems
//            function (err, player) {
//                if (err) {
//                    res.send(400, err);
//                    return;
//                }
//                // get and return all the players after you create another
//                if (player.lives > 0) {
//                    console.log("Player is not dead");
//                    player.update({ $inc: {lives: -1}}, function (err, player) {
//                    });
//                }
//                if (player.lives == 1) {
//                    console.log("Player is not dead");
//                    player.update({ $inc: {lives: -1}}, function (err, player) {
//                    });
//                    client.messages.create({
//                        to: "8477014127",
//                        from: "+14843263088",
//                        body: "Thanks for playing!",
//                    }, function (err, message) {
//                        console.log(message.sid);
//                    });
//                }
//                updatePlayersOnClients();
//                getPlayers(req, res);
//            });
//    });

    app.get('/api/reset', function (req, res) {
        console.log('updating');
        Players.update({}, {
            lives: 10,
            kills: 0
        }, {
            multi: true
        }, function (err, players) {
            console.log('updating complete', players);
            updatePlayersOnClients();
        });
        res.send(200, 'done');
    });

    // application -------------------------------------------------------------
    app.get('*', function (req, res) {
        res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    });


    io.on('connection', function (socket) {
    });


    function updatePlayersOnClients() {
        Players.find({}, function (err, players) {
            // if there is an error retrieving, send the error. nothing after res.send(err)
            if (err) {
                console.log("Error fetching players from mongo", err);
                return;
            }
            sendToClients('players', players);
        }).sort({lives: -1});
    }

    function sendToClients(eventName, data) {
        io.emit(eventName, data);
    }


    function getPlayers(req, res) {
        // use mongoose to get all players in the database
        Players.find({}, function (err, players) {
            // if there is an error retrieving, send the error. nothing after res.send(err)
            if (err) {
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
            function (err, player) {
                if (err) {
                    res.send(400, err);
                    return;
                }
                updatePlayersOnClients();
                // get and return all the players after you create another
                getPlayers(req, res);
            });
    }


// -------------------------- Spark -------------------------
    /*
     Way to get event streams from the Sparks
     */
    spark.getEventStream('im-hit', false, function (data) {
        console.log('hit!', data['coreid']);
        if (data && data['coreid']) {
            io.emit('on-kill', {
                'killerInfraID': data['data'],
                'victimDeviceID': data['coreid']
            });

            Players.findOne(
                {deviceID: data.coreid}, //double check body or parems
                function (err, player) {
                    console.log('coreid', data['coreid']);
                    console.log('player', player);
                    if (err) {
                        res.send(400, err);
                        return;
                    }
                    //nasty but works for null values
                    if (player) {
                        // get and return all the players after you create another
                        if (player.lives > 0) {
                            console.log("Player is not dead");
                            player.update({ $inc: {lives: -1}}, function (err, player) {
                            });
                        }
                        if (player.lives == 1) {
                            console.log("Player is not dead");
                            player.update({ $inc: {lives: -1}}, function (err, player) {
                            });
                            client.messages.create({
                                to: "8477014127",
                                from: "+14843263088",
                                body: "Thanks for playing!"
                            }, function (err, message) {
                                console.log(message.sid);
                            });
                        }
                    }


                    Players.findOne({
                        infraID: data.data
                    }, function (err, killer) {
                        if (killer) {
                            killer.update({ $inc: {kills: 1}}, function () {
                            });
                        }
                        updatePlayersOnClients();
                    });

                });
        }
    });

};
