var path = require('path');
module.exports = function() {
    return function(game) {
	process.on('SIGINT', function () {
	    
	    game.clients.forEach(function(client) {
		client.emit("data", {
		    pid: 0xff,
		    message: "§4whiskers75/Miney server closed."
		});
	    });

	    game.map.save_blocks(path.normalize(__dirname + "/..") + "/map/", function() {
		console.log("\n[INFO] Server is shutting down....");
		process.exit();
	    });
	});
    };
};
