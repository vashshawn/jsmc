var path = require("path"),
fs = require("fs");

module.exports = function(location) {
    return function(game) {
	var save_interval = setInterval(function() {
	    Object.keys(game.map.chunks).forEach(function(k) {
//		if (!game.map.chunks[k].dirty) { return; }
		
		process.stdout.write('|' + k + '|');

		fs.writeFile(path.join(location, Buffer(k).toString("base64")), game.map.chunks[k].data, function(err) {
		    if (err) {
			console.warn(err);
			return;
		    }

		    game.map.chunks[k].dirty = false;
		});
	    });
	    process.stdout.write('\n');
	}, 10000);
    };
};
