module.exports = function() {
    return function(game) {
	game.on("player:join", function(player) {
	    player.client.on("packet:0e", function(packet) {
		if (packet.status == 2 || game.mode == 1) {
		    var chunk_x = packet.x >> 4,
		    chunk_z = packet.z >> 4;
		    
		    var block_x = packet.x & 0x0f,
		    block_z = packet.z & 0x0f,
		    block_y = packet.y;
		    
		    game.map.get_abs_chunk(packet.x, packet.z, function(err, chunk) {
			var tmp = false;
			player.save.protection.blocks.forEach(function(block, index) {
			    if (block_x == block.x && block_y == block.y && block_z == block.z) {
				tmp = true;
				player.save.protection.blocks.splice(index, 1);
			    }
			});
			if (tmp == true) {
			    chunk.set_block_type(block_x, block_z, block_y, 0);
			    game.clients.forEach(function(client) {
				client.emit("data", {pid: 0x35, x: block_x, y: block_y, z: block_z, type: 0, metadata: 0});
			    });
			}
			else {
			    player.message('§4You did not place block ' + [block_x, block_y, block_z].join(', '));
			    var tmp_type = chunk.get_block_type(block_x, block_y, block_z);
			}
                    });
		}
	    });
	});
    };
};
