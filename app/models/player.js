/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
//	Schema = mongoose.Schema;

/**
 * Player Schema
 * Is there a way to default playerA, playerB, playerC?
 */
var PlayerSchema = new mongoose.Schema({
	playerName: {
		type: String,
		trim: true
	},
	lives: {
		type: Number,
		default: 10
	},
	initLives: {
		type: Number,
		default: 10
	},
	kills: {
		type: Number,
		default: 0
	},
	phoneNumber: {
		type: Number
	},
	infraID: {
		type: Number
	},
	deviceID: {
		type: String,
		trim: true
	}
});

module.exports = mongoose.model('Player', PlayerSchema);
