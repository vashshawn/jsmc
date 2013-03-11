/**
  Player abilities plugin.
  This is used to keep track of player ability state between the client and the server.
  Handles 0xCA in protocol.
*/
var winston = require('winston');
module.exports = function() {
  return function(game) {
    game.on("player:join", function(player) {
      player.client.on("packet:ca", function(packet) {
        winston.info('packet flags');
        winston.info(packet.flags);
        var creativeMode = (packet.flags & 0x01);
        var flying = (packet.flags & 0x02) >> 1;
        var canFly = (packet.flags & 0x04) >> 2;
        var invulnerable = (packet.flags & 0x08) >> 3;

        if(player.mode != creativeMode) {
          // something weird is happening here, lets log it
          console.warn('[Warning] Player client side game mode does not match server side!');
        }

        player.flying = flying;
        // trigger an event here to notify any plugins listening for flying status
        player.emit("flying", flying);
      });
    });
  };
};
