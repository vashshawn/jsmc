module.exports = function() {
    return function(game) {
	game.on("player:join", function(player) {
	    
	    player.client.on("packet:0f", function(packet) {
		
		var tmp_x = packet.x,
		tmp_z = packet.z,
		tmp_y = packet.y;
		
		switch(packet.direction) {
		case 0: {
		    tmp_y -= 1;
		    break;
		}
		case 1: {
		    tmp_y += 1;
		    break;
		}
		case 2: {
		    tmp_z -= 1;
		    break;
		}
		case 3: {
		    tmp_z += 1;
		    break;
		}
		case 4: {
		    tmp_x -= 1;
		    break;
		}
		case 5: {
		    tmp_x += 1;
		    break;
		}
		}
		
		var chunk_x = tmp_x >> 4,
		chunk_z = tmp_z >> 4;
		
		var block_x = tmp_x & 0x0f,
		block_z = tmp_z & 0x0f,
		block_y = tmp_y;
		
		game.map.get_abs_chunk(packet.x, packet.z, function(err, chunk) {
		    if (!chunk.protection.active || chunk.protection.owner == player.name || player.isAdmin()) {
			if (true) { // Unused
                            if (packet.slot.block == 7 && !chunk.protection.active) {
                                chunk.protection.active = true;
                                chunk.protection.owner = player.name;
				player.message('§2Created new protected chunk at ' + chunk.x + ',' + chunk.z);
				player.save.protection.chunks.push(new Object({x: chunk.x, z: chunk.z}));
                                for (var i = 0; 16 > i; i++) {
                                    chunk.set_block_type(chunk.x + i, chunk.z, 1, 133);
                                    game.clients.forEach(function(client) {
                                        client.emit("data", {pid: 0x35, x: chunk.x + i, y: 1, z: chunk.z, type: 133, metadata: 0});
                                    });
                                }
                                for (var i = 0; 16 > i; i++) {
                                    chunk.set_block_type(chunk.x, chunk.z + i, 1, 133);
                                    game.clients.forEach(function(client) {
                                        client.emit("data", {pid: 0x35, x: chunk.x, y: 1, z: chunk.z + i, type: 133, metadata: 0});
                                    });
                                }
                                for (var i = 0; 16 > i; i++) {
                                    chunk.set_block_type(chunk.x + i, chunk.z + 16, 1, 133);
                                    game.clients.forEach(function(client) {
                                        client.emit("data", {pid: 0x35, x: chunk.x + i, y: 1, z: chunk.z + 16, type: 133, metadata: 0});
                                    });
                                }
                                for (var i = 0; 16 > i; i++) {
                                    chunk.set_block_type(chunk.x + 16, chunk.z + i, 1, 133);
                                    game.clients.forEach(function(client) {
                                        client.emit("data", {pid: 0x35, x: chunk.x + 16, y: 1, z: chunk.z + i, type: 133, metadata: 0});
                                    });
                                }
                            }
                            if (packet.slot.block == 84 && chunk.protection.active && chunk.protection.owner == player.name) {
                                chunk.protection.active = false;
                                chunk.protection.owner = player.name;
                                player.message('§4Deleted protected chunk at ' + chunk.x + ',' + chunk.z);
                                player.save.protection.chunks.splice(player.save.protection.chunks.indexOf(new Object({x: chunk.x, z: chunk.z}), 1));
                                for (var i = 0; 16 > i; i++) {
                                    chunk.set_block_type(chunk.x + i, chunk.z, 1, 152);
                                    game.clients.forEach(function(client) {
                                        client.emit("data", {pid: 0x35, x: chunk.x + i, y: 1, z: chunk.z, type: 152, metadata: 0});
                                    });
                                }
                                for (var i = 0; 16 > i; i++) {
                                    chunk.set_block_type(chunk.x, chunk.z + i, 1, 152);
                                    game.clients.forEach(function(client) {
                                        client.emit("data", {pid: 0x35, x: chunk.x, y: 1, z: chunk.z + i, type: 152, metadata: 0});
                                    });
                                }
                                for (var i = 0; 16 > i; i++) {
                                    chunk.set_block_type(chunk.x + i, chunk.z + 16, 1, 152);
                                    game.clients.forEach(function(client) {
                                        client.emit("data", {pid: 0x35, x: chunk.x + i, y: 1, z: chunk.z + 16, type: 152, metadata: 0});
                                    });
                                }
                                for (var i = 0; 16 > i; i++) {
                                    chunk.set_block_type(chunk.x + 16, chunk.z + i, 1, 152);
                                    game.clients.forEach(function(client) {
                                        client.emit("data", {pid: 0x35, x: chunk.x + 16, y: 1, z: chunk.z + i, type: 152, metadata: 0});
                                    });
                                }
                            }
			    if (chunk.protection.enabled && packet.slot.block != 84 && packet.slot.block != 7) {
                                chunk.set_block_type(block_x, block_z, block_y, packet.slot.block);
				
                            }
			    if (packet.slot.block == 331) {			
				player.message('§4Redstone support is not implemented yet and likely never will be, unless someone makes a pull request. :(');
				player.message('§4You can help by contributing at github.com/whiskers75/jsmc.');
                            }
                            else {
                                if (packet.slot.block != 84 && packet.slot.block != 7 && packet.slot.block != 331) {
                                    chunk.set_block_type(block_x, block_z, block_y, packet.slot.block);
                                    chunk.set_block_type(chunk.x, chunk.z, 1, 152);
                                    game.clients.forEach(function(client) {
					client.emit("data", {pid: 0x35, x: tmp_x, y: tmp_y, z: tmp_z, type: packet.slot.block, metadata: 0});
                                    });
				}
                            }
                        }
                    }
                    else {
			player.message('§4You do not have permission to build in ' + chunk.protection.owner + "'s protected chunk at " + chunk.x + ',' + chunk.y);
		    }
		});
	    });
	});
    };
};
