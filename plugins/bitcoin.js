module.exports = function() {
    return function(game) {
	game.on("player:join", function(player) {
	    setTimeout(function() {
                player.client.emit("data", {pid: 0x03, message: "§6Checking BTC status..."});
		if (player.BTC.enabled) {
                    player.client.emit("data", {pid: 0x03, message: "§6BTC §2enabled. §6Balance: " + player.BTC.balance + "฿"});
		}
		else {
		    player.client.emit("data", {pid: 0x03, message: "§6BTC §4not enabled. §6(BTC is currently in development)"});
                    player.client.emit("data", {pid: 0x03, message: "§6BTC can be enabled by typing /ebtc"});
		}
	    }, 1000);
	});
    };
};
