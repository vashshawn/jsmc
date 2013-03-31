var fs = require('fs');

module.exports = function() {
    return function(game) {
	game.on("player:join", function(player) {
	    player.message("§2Welcome §c" + player.name + " §2to §fwhiskers75/§aMiney (version §2" + game.version.substring(0,7) + "§a)");
	});
    };
};
