module.exports = function() {
    return function(game) {
	game.on("client:connect", function(client) {

	    client.once("packet", function(packet) {
		if (packet.pid !== 0xfe) { return; }
		
		client.emit("data", {
		    pid: 0xff,
		    message: ["§1", "61", "JSMC-1.5.2", game.name, game.players.length, game.max_players].join("\x00")
		});

		client.end();
	    });
	});
    };
};
