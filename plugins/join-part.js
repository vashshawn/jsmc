module.exports = function() {
    return function(game) {
	game.on("player:join", function(player) {
	    game.players.forEach(function(other) {
		other.client.emit("data", {pid: 0x03, message: "§2[+] §5" + player.name + "§2 joined"});
	    });
	});
	
	game.on("player:leave", function(player) {
	    game.players.forEach(function(other) {
		other.client.emit("data", {pid: 0x03, message: "§4[-] §5" + player.name + "§4 left"});
	    });
	});
	game.on("server:error", function() {
            game.players.forEach(function(other) {
                other.client.emit("data", {pid: 0x03, message: "§4[x] Internal server error"});
            });
        });
    }
}
