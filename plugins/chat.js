var winston = require('winston');
var Command = require('../lib/command.js');
module.exports = function() {
    return function(game) {
	game.on("player:join", function(player) {
	    player.client.on("packet:03", function(packet) {
		var playerCommands = new Command(game, player);
		if (playerCommands.parseMessage(packet.message)) {
		    // yay
		}
		else {
		    console.log('[CHAT] <' + player.name + '> ' + packet.message);
		    game.players.forEach(function(other) {
                        other.client.emit("data", {pid: 0x03, message: "<" + (player.isAdmin ? "§2" : "") + player.name + (player.isAdmin ? "§r" : "") + '> ' + packet.message});
		    });
		}
	    });
	});
    };
};
