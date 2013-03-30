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
            if (!chunk.ptect || player.isAdmin() && packet.slot.block !== 331) { // Blocks redstone dust (not fully working)
              chunk.set_block_type(block_x, block_z, block_y, packet.slot.block);

              game.clients.forEach(function(client) {
                client.emit("data", {pid: 0x35, x: tmp_x, y: tmp_y, z: tmp_z, type: packet.slot.block, metadata: 0});
              });
            }
            else {
              if (packet.slot.block == 7 && player.isAdmin()) {
                chunk.ptect = true;
                chunk.set_block_type(chunk.x, chunk.z, 1, 133);
              }
              if (packet.slot.block == 84 && player.isAdmin()) {
                chunk.ptect = false;
                chunk.set_block_type(chunk.x, chunk.z, 1, 152);
              }
            }
          });
      });
    });
  };
};
