module.exports = function() {
    return function(game) {
	game.on("player:join", function(player) {
	    player.client.on("packet:03", function(packet) {
		var tmp = packet.message.split(" ");

		if (tmp[0] === "/suicide") {
		    console.log('[PLAYER] Player ' + player.name + ' requested suicide.');
		    player.kill();
		}
	    });

	    player.client.on("packet:cd", function(packet) {
		if (packet.payload) {
                    console.log('[PLAYER] Player ' + player.name + ' died.');
		    player.respawn();
		}
	    });
	});
    };
};
