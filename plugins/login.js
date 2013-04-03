var Player = require("../lib/player.js");
var fs = require('fs');
var Map = require("../lib/map");

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
			    message: "Connection §4failed: You have been banned!"
			});
			return;
		    }
		    
		    var player = new Player(game, {client: client, name: packet.username, x: game.spawn.x, y: game.spawn.y, z: game.spawn.z, stance: y + 1.62, yaw: 0, pitch: 0});
		    client.player = player;
		    if(~game.admins.indexOf(packet.username)) {
			player.admin = true;
		    }
		    
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
		    
                    fs.exists('./players/' + player.name + '.json', function(err, exists) {
			if (!exists && !err) {
			    player.message('§2Welcome! It looks like you\'re new here. Creating save file...');
			    var chunkAlloc = JSON.parse(fs.readFileSync('./chunkAlloc.json'));
			    player.save = new Object({protection: new Object({chunks: [{x: chunkAlloc.x, z: chunkAlloc.z, primary: true}]})});
			    chunkAlloc.x = chunkAlloc.x + 1;
			    if (chunkAlloc.x > chunkAlloc.z) {
				chunkAlloc.z = chunkAlloc.z + 1;
			    }
			    fs.writeFileSync('./chunkAlloc.json', JSON.stringify(chunkAlloc));
			    player.message('§2We\'ve allocated you a chunk (16x16 area) to build in. It can be found at ' + chunkAlloc.x + ', ' + chunkAlloc.z);
			    player.message('Run /home to go to it.');
                            fs.writeFile('./players/' + player.name + '.json', JSON.stringify(player.save), function(err, res) {
                                if (err) {
                                    console.warn('failed to save player ' + player.name + ' ' + err);
                                    player.message('§4[System] Failed to save your player file!');
                                }
                                else {
                                    console.log('saved player ' + player.name);
                                    player.message('§2[System] Saved player file.');
                                }
                            });
			}
			
                            fs.readFile('./players/' + player.name + '.json', function(err, file) {
                                if (err) {
                        	    console.warn(player.name + ': err:' + err); 
                                }
				else {
				    player.save = JSON.parse(file);
				    // Yay! Success!
				    player.message('§2Loaded player from disk.');
                                    // Check for saved (permitted) chunks
                                    if (player.save.protection.chunks) {
                                        player.save.protection.chunks.forEach(function(protChunk) {
                                            game.map.get_chunk(protChunk.x, protChunk.z, function(err, chunk) {
                                                chunk.protection.active == true;
                                                chunk.protection.owner == player.name;
                                                player.message('§2Loaded permitted chunk: §e' + chunk.x + '§2,§6' + chunk.z + '§4 >§e ' + chunk.x + '§2,§6' + chunk.z);
                                            });
                                        });
				    }
				    console.log('loaded player ' + player.name + "'s savefile");
				    console.log('file of ' + player.name + ':' + file);
				    player.saveInterval = setInterval(function save() {
                                        fs.writeFile('./players/' + player.name + '.json', JSON.stringify(player.save), function(err, res) {
                                            if (err) {
                                                console.warn('failed to save player ' + player.name + ' ' + err);
						try {
						    this.message('§4[System] Failed to save your player file!');
						}
						catch (e) {}
					    }
                                            else {
                                                console.log('saved player ' + player.name);
						try {
						    this.message('§2[System] Saved player file.');
						}
						catch (e) {}
					    }
                                        });
                                    }, 60000);
				}
			    });
			
		    });
		});
		
		
		client.on("game:disconnect", function(player) {
		    try {
			game.remove_player(client.player);
		    }
		    catch (e) {
			console.warn('failed to remove player');
		    }
		    
                    fs.writeFile('./players/' + client.player.name + '.json', JSON.stringify(client.player.save), function(err, res) {
			if (err) {
			    console.warn('failed to save player ' + client.player.name);
			}
			else {
			    console.log('saved player ' + client.player.name);
			}
		    });
		});
	    });
	});
    }
}


