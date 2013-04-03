Array.prototype.removeChunk = function(x, z) {
    this.forEach(function (chunk, index) {
	if (chunk.x == x && chunk.z == z) {
	    chunk.x = null;
	    chunk.z = null;
	    return true;
	}
    });
}
// Array.removeChunk(chunk.x, .z);
// Remove a chunk from an array of chunks, if it exists.
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
		    if (chunk.protection.active && chunk.protection.owner == player.name) {
			if (packet.slot.block == 331) {			
			    player.message('§4Redstone support is on its way, but the last attempt failed.');
			    player.message('§4You can help by contributing at github.com/whiskers75/jsmc.');
                        }
			if (packet.slot.block == 46) {
			    player.message('§4Removing ownership of chunk ' + chunk.x + ', ' + chunk.z);
			    player.save.protection.chunks.removeChunk(chunk.x, chunk.z);
                            game.clients.forEach(function(client) {
                                client.emit("data", {pid: 0x35, x: tmp_x, y: tmp_y, z: tmp_z, type: 0, metadata: 0})
                            });
                        }
                        else {
                            if (packet.slot.block != 84 && packet.slot.block != 7 && packet.slot.block != 331) {
                                chunk.set_block_type(block_x, block_z, block_y, packet.slot.block);
                                chunk.set_block_type(chunk.x, chunk.z, 1, 152);
                                game.clients.forEach(function(client) {
				    client.emit("data", {pid: 0x35, x: tmp_x, y: tmp_y, z: tmp_z, type: packet.slot.block, metadata: 0})
                                });
			    }
                        }
                    }
                    else {
			if (player.isAdmin()) {
			    if (packet.slot.block == 7) {
				player.message('§2You now own chunk ' + chunk.x + ', ' + chunk.z);
				player.save.protection.chunks.push({x: chunk.x, z: chunk.z});
				chunk.protection.active = true;
				chunk.protection.owner = player.name;
                                game.clients.forEach(function(client) {
                                    client.emit("data", {pid: 0x35, x: tmp_x, y: tmp_y, z: tmp_z, type: 0, metadata: 0})
                                });
                            }
                        }
                        else {
                            player.message('§4You do not own chunk ' + chunk.x + ', ' + chunk.z);
			}
		    }
		});
	    });
	});
    };
};
