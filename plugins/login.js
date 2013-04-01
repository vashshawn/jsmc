var Player = require("../lib/player.js");
var fs = require('fs');

module.exports = function() {
    return function(game) {
	game.on("client:connect", function(client) {
	    console.log("watching for login packet on client");
	    
	    client.once("packet", function(packet) {
		if (packet.pid !== 0x02) { return; }
		
		game.map.get_abs_chunk(0, 0, function(err, chunk) {
		    var y;
		    for (y = 255; y > 0 && chunk.get_block_type(0, 0, y) === 0; --y) {}
		    y += 2;
		    
		    if(~game.banned.indexOf(packet.username)) {
			client.emit("data", {
			    pid: 0xff,
			    message: "Connection §4failed: You have been banned!."
			});
			return;
		    }
		    
		    var player = new Player(game, {client: client, name: packet.username, x: game.spawn.x, y: game.spawn.y, z: game.spawn.z, stance: y + 1.62, yaw: 0, pitch: 0});
		    
		    if(~game.admins.indexOf(packet.username))
			player.admin = true;

		    fs.existsSync('../players/' + player.name + '.json', function(err, exists) {
			if (exists) {
                            fs.readFile('../players/' + player.name + '.json', function(err, file) {
				if (err) {
                                    client.emit("data", {
                                        pid: 0xff,
                                        message: "Connection §4failed: Error reading player savefile! (stage 2) Info: " + err
                                    }); 
                                }
				else {
				    var temp = player.eid;
				    player = JSON.stringify(file);
				    player.eid = temp;
				    // Yay! Success!
				    player.message('§2Loaded player from disk.');
				}
                            });
                        }
                        if (err) {
                            client.emit("data", {
                                pid: 0xff,
                                message: "Connection §4failed: Error reading player savefile! (stage 1) Info: " + err
                            });
                        }
		    });
				  
		    console.log("created player " + player.name + " and spawning at " + [player.x, player.y, player.z].join(","));
				  
		    console.log("logging player in");
				  
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
			game.remove_player(player);
			fs.writeFileSync('../players/' + player.name + '.json', JSON.stringify(player));
		    });
		});
	    });
	});
    };
};
