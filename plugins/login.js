var Player = require("../lib/player.js");
var fs = require('fs');
var Map = require("../lib/map");

module.exports = function() {
    return function(game) {
	game.on("client:connect", function(client) {
	    client.once("packet", function(packet) {
		if (packet.pid !== 0x02) { return; }
                process.stdout.write("[PLAYER] Player connecting");
		game.map.get_abs_chunk(0, 0, function(err, chunk) {
		    var y;
		    for (y = 255; y > 0 && chunk.get_block_type(0, 0, y) === 0; --y) {}
		    y += 2;
		    process.stdout.write(' (' + packet.username + '):');
		    if(~game.banned.indexOf(packet.username)) {
			client.emit("data", {
			    pid: 0xff,
			    message: "Connection §4failed: You have been banned!"
			});
			process.stdout.write('..failed (banned)\n');
			return;
		    }
		    
		    var player = new Player(game, {client: client, name: packet.username, x: game.spawn.x, y: game.spawn.y, z: game.spawn.z, stance: y + 1.62, yaw: 0, pitch: 0});
		    client.player = player;
		    if(~game.admins.indexOf(packet.username)) {
			player.admin = true;
		    }
		    
                    process.stdout.write('..created');
                    
                    process.stdout.write('..login');
                    
                    client.emit("data", {
                        pid: 0x01,
                        eid: player.eid,
                        level_type: game.world.type,
                        game_mode: game.mode,
                        dimension: game.world.dimension,
                        difficulty: game.difficulty,
                        max_players: game.max_players,
		    });
		    process.stdout.write('..adding');
                    game.add_player(player);
		    process.stdout.write('..done');
                    fs.exists('./players/' + player.name + '.json', function(err, exists) {
			if (!exists && !err) {
			    player.message('§2Welcome! It looks like you\'re new here. Creating save file...');
			    player.save = new Object({protection: new Object({chunks: []})});
                            fs.writeFile('./players/' + player.name + '.json', JSON.stringify(player.save), function(err, res) {
                                if (err) {
                                    console.warn('failed to save player ' + player.name + ' ' + err);
                                    player.message('§4Failed to save your player file!');
                                }
                                else {
                                    console.log('saved player ' + player.name);
                                    player.message('§2Saved player file!');
				    player.message('§2You can start building in a chunk by placing a piece of bedrock inside it.');
                                }
                            });
			}
			
                        fs.readFile('./players/' + player.name + '.json', function(err, file) {
                            if (err) {
				console.warn('[ERROR]' + player.name + ': err:' + err);
                            }
			    else {
				player.save = JSON.parse(file);
				// Yay! Success!
				player.message('§2Loaded player from disk.');
                                // Check for saved (permitted) chunks
                                if (player.save.protection.chunks) {
                                    player.save.protection.chunks.forEach(function(protChunk) {
					if (protChunk.x !== null) {
					    game.map.get_chunk(protChunk.x, protChunk.z, function(err, chunk) {
						if (!err) {
						    chunk.protection.active = true;
						    chunk.protection.owner = player.name;
						    player.message('§2Loaded permitted chunk: §e' + chunk.x + '§2,§6' + chunk.z + '§4 >§e ' + chunk.x + '§2,§6' + chunk.z);
						}
					    });
					}
                                    });
				}
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
					    try {
						this.message('§2[System] Saved player file.');
					    }
					    catch (e2) {}
					}
                                    });
                                }, 60000);
			    }
			});
			
		    });
		});
		process.stdout.write('\n');
		
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


