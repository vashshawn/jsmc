module.exports = function() {
    return function(game) {
	game.on("player:join", function(player) {
	    setTimeout(function() {
                player.client.emit("data", {pid: 0x03, message: "Checking BTC status..."});
		if (player.BTC.enabled) {
                    player.client.emit("data", {pid: 0x03, message: "BTC enabled. Balance: " + player.BTC.balance + "฿"});
		}
		else {
		    player.client.emit("data", {pid: 0x03, message: "BTC not enabled. (BTC is currently in development)"});
		}
	    }, 1000);
	});
    };
};
