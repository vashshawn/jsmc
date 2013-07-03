Array.prototype.removeChunk = function(x, z) {
    this.forEach(function (chunk, index) {
	if (chunk.x == x && chunk.z == z) {
	    chunk.x = null;
	    chunk.z = null;
	    return true;
	}
    });
};
Array.prototype.hasChunk = function(x, z) {
    this.forEach(function (chunk, index) {
        if (chunk.x == x && chunk.z == z) {
            return true;
        }
    });
};

var Unsupported = require('../lib/unsupported.js');

// Array.removeChunk(chunk.x, .z);
// Remove a chunk from an array of chunks, if it exists.
module.exports = function() {
    return function(game) {
	game.on("player:join", function(player) {
	    
	    player.client.on("packet:0f", function(packet) {
		try {
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
		}
		catch (e) {
		    console.log('[ERROR] ' + e);
		}
                
		game.map.get_abs_chunk(packet.x, packet.z, function(err, chunk) {
		    
		    if (packet.slot.block == 331) {			
			player.message('§4Redstone support is on its way, but the last attempt failed.');
			player.message('§4You can help by contributing at github.com/whiskers75/jsmc.');
                    }
		    if (packet.slot.block == 326) {
                        chunk.set_block_type(block_x, block_z, block_y, 9);
                        game.clients.forEach(function(client) {
                            client.emit("data", {pid: 0x35, x: block_x, y: block_y, z: block_z, type: 9, metadata: 0})
                        });
		    }
                    if (packet.slot.block == 327) {
                        chunk.set_block_type(block_x, block_z, block_y, 11);
                        game.clients.forEach(function(client) {
                            client.emit("data", {pid: 0x35, x: block_x, y: block_y, z: block_z, type: 9, metadata: 0})
                        });
                    }
		    if (packet.slot.block == -1) {
			return;
                    }
        	    if (Unsupported.checkForBlock(packet.slot.block) == false || packet.slot.block == -1 || packet.slot.block == 327 || packet.slot.block == 331) {
			player.message('§4The item you (may have) tried to place is unsupported.');
                        game.clients.forEach(function(client) {
                            client.emit("data", {pid: 0x35, x: block_x, y: block_y, z: block_z, type: 0, metadata: 0})
                        });
                    }
		    else {
			chunk.set_block_type(block_x, block_z, block_y, packet.slot.block);
			game.clients.forEach(function(client) {
			    client.emit("data", {pid: 0x35, x: block_x, y: block_y, z: block_z, type: packet.slot.block, metadata: 0})
			});
                        player.save.protection.blocks.push({x: block_x, z: block_z, y: block_y});
                    }
                });
            });
	});
    };
};
