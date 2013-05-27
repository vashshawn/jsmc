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
		    if (chunk.protection.active && player.save.protection.chunks.hasChunk(chunk.x, chunk.z)) {
			if (packet.slot.block == 331) {			
			    player.message('§4Redstone support is on its way, but the last attempt failed.');
			    player.message('§4You can help by contributing at github.com/whiskers75/jsmc.');
                        }
			if (packet.slot.block == 46) {
			    console.log('Removing ownership');
			    player.message('§4Removing ownership of chunk ' + chunk.x + ', ' + chunk.z);
			    player.save.protection.chunks.removeChunk(chunk.x, chunk.z);
                            game.clients.forEach(function(client) {
                                client.emit("data", {pid: 0x35, x: tmp_x, y: tmp_y, z: tmp_z, type: 0, metadata: 0})
                            });
                        }
			if (packet.slot.block == 326) {
                            chunk.set_block_type(block_x, block_z, block_y, 9);
                            game.clients.forEach(function(client) {
                                client.emit("data", {pid: 0x35, x: tmp_x, y: tmp_y, z: tmp_z, type: 9, metadata: 0})
                            });
			}
                        if (packet.slot.block == 327) {
                            chunk.set_block_type(block_x, block_z, block_y, 11);
                            game.clients.forEach(function(client) {
                                client.emit("data", {pid: 0x35, x: tmp_x, y: tmp_y, z: tmp_z, type: 9, metadata: 0})
                            });
                        }
			if (packet.slot.block == -1) {
                        }
        		if (Unsupported.checkForBlock(packet.slot.block) == false || packet.slot.block == -1 || packet.slot.block == 327 || packet.slot.block == 331) {
			    player.message('§4The item you (may have) tried to place is unsupported.');
                            game.clients.forEach(function(client) {
                                client.emit("data", {pid: 0x35, x: tmp_x, y: tmp_y, z: tmp_z, type: 0, metadata: 0})
                            });
                        }
			else {
			    chunk.set_block_type(block_x, block_z, block_y, packet.slot.block);
			    game.clients.forEach(function(client) {
				client.emit("data", {pid: 0x35, x: tmp_x, y: tmp_y, z: tmp_z, type: packet.slot.block, metadata: 0})
			    });
			}
                    }
                    else {
			if (packet.slot.block == 7 && !chunk.protection.active) {
                            console.log('[CHUNK] ' + player.name + ': Registered chunk ' + chunk.x + ', ' + chunk.z);
			    player.message('§2You now own chunk ' + chunk.x + ', ' + chunk.z);
			    player.save.protection.chunks.push({x: chunk.x, z: chunk.z});
			    chunk.protection.active = true;
			    chunk.protection.owner = player.name;
			    game.clients.forEach(function(client) {
                                client.emit("data", {pid: 0x35, x: tmp_x, y: tmp_y, z: tmp_z, type: 0, metadata: 0})
                            });
			}
			else {
			    if (chunk.x == -1 && chunk.z == -1) { return;}
                            player.message('§4You do not own chunk ' + chunk.x + ', ' + chunk.z);
                            game.clients.forEach(function(client) {
                                client.emit("data", {pid: 0x35, x: tmp_x, y: tmp_y, z: tmp_z, type: 0, metadata: 0})
                            });
                        } 
                    }
		});
	    });
	});
    };
};
