var fs = require('fs'),
    path = require('path');

module.exports = function() {
  return function(game) {
    process.on('SIGINT', function () {
      
      game.clients.forEach(function(client) {
        client.emit("data", {
          pid: 0xff,
          message: "Server is shutting down."
        });
      });

      game.map.save_blocks(path.normalize(__dirname + "/..") + "/map/", function() {
        console.log("\nServer is shutting down....");
        process.exit();
      });
    });
  };
};
