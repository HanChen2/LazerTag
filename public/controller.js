angular.module('playerController', [])

	// inject the Player service factory into our controller
	.controller('mainController', function($scope, $http, Players, $timeout) {
		$scope.formData = {};
        var socket = io();

		// GET =====================================================================
		// when landing on the page, get all players and show them
		// use the service to get all the players
		Players.get()
			.success(function(data) {
				$scope.players = data;
			});

		// CREATE ==================================================================
		// when submitting the add form, send the text to the node API
		$scope.createPlayer = function() {

			// validate the formData to make sure that something is there
			// if form is empty, nothing will happen
			if ($scope.formData.playerName != undefined &&
				$scope.formData.deviceID != undefined &&
				$scope.formData.infraID != undefined &&
				$scope.formData.phoneNumber != undefined) {

				// call the create function from our service (returns a promise object)
				Players.create($scope.formData)

					// if successful creation, call our get function to get all the new todos
					.success(function(data) {
						$scope.formData = {}; // clear the form so our user is ready to enter another
//						$scope.players = data; // assign our new list of todos
					});
			}
		};
		// DELETE ==================================================================
		// delete a to-do after checking it
		$scope.deletePlayer = function(deviceID) {
			Players.delete(deviceID)
				// if successful creation, call our get function to get all the new todos
				.success(function(data) {
//					$scope.players = data; // assign our new list of todos
				});
		};

        $scope.resetGame = function() {
            Players.reset().success(function(data) {
                console.log('Game Reset', data);
            });
        };

        $scope.negInt = function(value) {
            return -1 * value.lives;
        };

        socket.on('players', function(players) {
           $timeout(function() {
               console.log('Update from socket.io', players);
               $scope.players = players;
           });
        });

        var bombNoises = [
            'http://f.cl.ly/items/2F000T0s0H1g0h3K3T2j/Big%20Bomb-SoundBible.com-1219802495%20(1).mp3',
            'http://f.cl.ly/items/3q3Q1u160G153t2X3R24/rpg.mp3',
            'http://f.cl.ly/items/3541430y1e1D2X1W293Q/Explosion%20And%20Debris-SoundBible.com-2114990202.mp3',

        ];
        socket.on('on-kill', function(killData) {
            var bombNoise = bombNoises[parseInt(Math.random() * bombNoises.length)];
            var audio = new Audio(bombNoise);
            audio.play();
        });
	});
