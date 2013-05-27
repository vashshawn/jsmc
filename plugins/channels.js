module.exports = function() {
    return function(game) {
        game.on("player:join", function(player) {
            player.client.on("packet:fa", function(packet) {
                console.log('[DEV CHANNELS] Player ' + player.name + ':' + JSON.stringify(packet));
            });
	});
    };
};
