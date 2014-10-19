angular.module('playerController', [])

	// inject the Player service factory into our controller
	.controller('mainController', function($scope, $http, Players) {
		$scope.formData = {};

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
						$scope.players = data; // assign our new list of todos
					});
			}
		};
		// DELETE ==================================================================
		// delete a to-do after checking it
		$scope.deletePlayer = function(deviceID) {
			Players.delete(deviceID)
				// if successful creation, call our get function to get all the new todos
				.success(function(data) {
					$scope.players = data; // assign our new list of todos
				});
		};
	});
