var Player = require("../lib/player.js"),
fs = require('fs');

module.exports = function() {
    return function(game) {
	game.on("client:connect", function(client) {

	    client.once("packet", function(packet) {
		if (packet.pid !== 0x02) { return; }

		game.map.get_abs_chunk(0, 0, function(err, chunk) {
		    var y;
		    for (y = 255; y > 0 && chunk.get_block_type(0, 0, y) === 0; --y) {}
		    y += 2;
		    
		    if(~game.banned.indexOf(packet.username)) {
			console.log('[PLAYER] Kicked banned player ' + player.username + '!');
			client.emit("data", {
			    pid: 0xff,
			    message: "Banned."
			});
			return;
		    }
		    
		    var playerData = {
			client: client,
			name: packet.username,
			x: 0,
			z: 0,
			y: y,
			stance: y + 1.62,
			yaw: 0,
			pitch: 0
		    };
		    
		    if(fs.existsSync('./players/' + packet.username + ".json")) {
			
			var data = JSON.parse(fs.readFileSync('./players/' + packet.username + ".json"));
			
			if (typeof data.x      === "number")  { playerData.x      = data.x;     }
			if (typeof data.z      === "number")  { playerData.z      = data.z;     }
			if (typeof data.y      === "number")  { playerData.y      = data.y;     playerData.stance = playerData.y + 1.62; };
			
		    }
		    
		    var player = new Player(game, playerData);
		    
		    if(~game.admins.indexOf(packet.username))
			player.admin = true;
		    
		    //console.log("created player " + player.name + " and spawning at " + [player.x, player.y, player.z].join(","));
		    
                    console.log("[PLAYER] " + player.name + ' spawned at ' + [player.x, player.y, player.z].join(","));
		    
		    client.emit("data", {
			pid: 0x01,
			eid: player.eid,
			level_type: game.world.type,
			game_mode: game.mode,
			dimension: game.world.dimension,
			difficulty: game.difficulty,
			max_players: game.max_players,
		    });
		    
		    game.add_player(player);
		    
		    client.on("game:disconnect", function() {
			player.save(function() {
			    game.remove_player(player);
			});
		    });
		});
	    });
	});
    };
};
