angular.module('playerService', [])

	// super simple service
	// each function returns a promise object 
	.factory('Players', function($http) {
		return {
			get : function() {
				return $http.get('/api/players');
			},
			create : function(playerData) {
				return $http.put('/api/players', playerData);
			},
			update : function(deviceID) {
				return $http.post('/api/players', deviceID);
			},
			delete : function(deviceID) {
				return $http.delete('/api/players/', deviceID);
			}
		}
	});
