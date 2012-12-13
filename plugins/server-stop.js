var fs = require('fs'),
    path = require('path'),
    async = require('async');

module.exports = function() {
  return function(game) {
    process.on('SIGINT', function () {
      
      game.clients.forEach(function(client) {
        client.emit("data", {
          pid: 0xff,
          message: "Server is shutting down."
        });
      });

      async.forEach(Object.keys(game.map.chunks), function(k, cb) {
        if (!game.map.chunks[k].dirty) { 
          cb(); 
          return; 
        }

        console.log("Saving chunk " + k);

        fs.writeFile(path.normalize(__dirname + "/..") + "/map/" + Buffer(k).toString("base64"), game.map.chunks[k].data, function(err) {
          if (err) {
            console.warn(err);
            return;
          }
          game.map.chunks[k].dirty = false;
          cb();

        });
      }, function(err) {
        if(err) {
          console.warn(err);
        }
        console.log("\nServer is shutting down....");
        process.exit();
      });
    });
  };
};
