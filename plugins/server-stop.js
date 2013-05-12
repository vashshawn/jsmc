module.exports = function() {
    return function(game) {
	process.on('SIGINT', function () {
	    game.clients.forEach(function(client) {
		client.emit("data", {
		    pid: 0xff,
		    message: "whiskers75/Miney is now closing. This may be due to lag, or maintenance."
		});
	    });
            console.log("\n[INFO] Server shut down."); 
	    process.exit();
	});
    };
};
