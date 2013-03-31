module.exports = function() {
  return function(game) {
    game.on("player:join", function(player) {
	player.client.emit("data", {pid: 0x03, message: "Checking BTC status..."});
	if (player.BTC.enabled) {
	    player.client.emit("data", {pid: 0x03, message: "BTC enabled. Balance: " + player.BTC.balance});
	}
	else {
	    player.client.emit("data", {pid: 0x03, message: "BTC not enabled. You can enable BTC by going to whiskers75.github.com/Miney, logging in and enabling Bitcoins."});
	}
    });
  };
};
