var Redstone = new Object({});
module.exports = Redstone;

/* jsmc Redstone
   by whiskers75
   Documented in-code by whiskers75
   Currently supported redstone items:
   #55 (Redstone Wire) - whiskers75
*/

Redstone.checkForEmitter = function(x, y, z, emx, emy, emz, state, neededState) {
    if (emx == x + 1 || emx == x - 1) {
//        if (emy == y || emy == y + 1 || emy == y - 1) { not behaving
            if (emz == z + 1 || emz == z - 1) {
                if (state) {
		    return true;
                }
            }
//	}
    }
    return false;
}
// Redstone.checkForEmitter(x, y, z, emitter.x, .y, .z, emitter.state)
// ** Internal function (safe to call, but pointless)
// Checks if an emitter matches the parameters given.
// (Created to clean up code)


Redstone.updateOn = function updateOn(x, z, y, chunk, game, type) {
    console.log('Redstone: Updating ' + x + ',' + y + ',' + z + ' on');
    var foundOne = false;
    this.emitters.forEach(function(emitter) {
        if (emitter.x == x && emitter.y == y && emitter.z == z && emitter.type == 'wire' && emitter.state == false) {
            emitter.state = true;
            foundOne = true;
            // Update current emitter state.
            console.log('Redstone: Updating ' + x + ',' + y + ',' + z + ': Emitter found for position, updated.');
        }
	if (Redstone.checkForEmitter(x, y, z, emitter.x, emitter.y, emitter.z, emitter.state, false)) {
	    // It looks like we've found a closely-matching emitter!
            // We've just proven that we're on, so let's switch this guy on!
            emitter.state = true;
            console.log('Redstone: Updating ' + x + ',' + y + ',' + z + ': Emitter found for near position, turned on');
	    chunk.set_block_meta(emitter.x, emitter.x, emitter.y, 0xF);
	    game.clients.forEach(function(client) {
                client.emit("data", {pid: 0x35, x: emitter.x, y: emitter.y, z: emitter.z, type: 55, metadata: 0xF});
	    });
	    return true;
	}
    });
    if (!foundOne) {
        this.emitters.push({type: 55, x: x, y: y, z: z, meta: 0xF, state: true});
    }
    return false;
}
// Redstone.updateOn(updated block.x, .z, .y, current chunk, game object);
// Updates an already-on block.
// DON'T EVER call this directly. ONLY to be used from within Redstone.update();

Redstone.updateRecursive = function updateRecursive(x, z, y, chunk, game, state, type) {
    for (var done = false; done == false; done = false) {
	if (state == true) {
            for (var more = false; more == false; more = false) { // more is false when there is more wire/objects, true when there isn't.
                more = this.updateOn(x, z, y, chunk, game, type);
            }
        }
        else {
	    // We're now going to walk through a possible line of redstone and turn it off.
	    for (var more = false; more == false; more = false) { // more is false when there is more wire/objects, true when there isn't.
		more = this.updateOffForce(x, z, y, chunk, game, type);
	    }
	}
    }
}
// Redstone.updateRecursive(off/on block.x, .z, .y, current chunk, game object, state of specified block (true/false));
// Recursively updates a line of wire or other redstone substance to the set state.
// Useful for turning an entire line off.
// I suppose you can call this one from outside Redstone.update if you must.

Redstone.updateOff = function updateOff(x, z, y, chunk, game, type) {
    console.log('Redstone: Updating ' + x + ',' + y + ',' + z + ' off');
    var itsOn = false;
    var foundOne = false;
    this.emitters.forEach(function(emitter) {
	if (emitter.x == x && emitter.y == y && emitter.z == z) {
	    foundOne = true;
	    emitter.state = false;
            console.log('Redstone: Updating ' + x + ',' + y + ',' + z + ': Emitter found for current position, disabled.');
	}
        if (Redstone.checkForEmitter(x, y, z, emitter.x, emitter.y, emitter.z, emitter.state, false)) {
            // This redstone obj needs to be activated!
            console.log('Redstone: Updating ' + x + ',' + y + ',' + z + ': Enabling redstone object');
            chunk.set_block_meta(emitter.x, emitter.z, emitter.y, 0xF);
            game.clients.forEach(function(client) {
                client.emit("data", {pid: 0x35, x: emitter.x, y: emitter.y, z: emitter.z, type: 55, metadata: 0xF});
            });
            itsOn = true;
	    Redstone.updateOn(x, z, y, chunk, game, type);
        }
    });
    if (!itsOn) {
	chunk.set_block_meta(x, y, z, 0);
        game.clients.forEach(function(client) {
            client.emit("data", {pid: 0x35, x: x, y: y, z: z, type: 55, metadata: 0});
	});
    }
    if (!foundOne) {
        this.emitters.push({type: type, x: x, y: y, z: z, meta: 0xF, state: true});
    }
}
// Redstone.updateOff(updated block.x, .z, .y, current chunk, game object);
// DON'T EVER call this directly. ONLY to be used from within Redstone.update();

Redstone.updateOffForce = function(x, z, y, chunk, game, type) {
    this.emitters.forEach(function(emitter) {
        if (Redstone.checkForEmitter(x, y, z, emitter.x, emitter.y, emitter.z, emitter.state, true)) {
	    // This redstone emitter needs to be deactivated!
	    if (emitter.type == 55) {
		chunk.set_block_meta(emitter.x, emitter.x, emitter.y, 0);
		game.clients.forEach(function(client) {
		    client.emit("data", {pid: 0x35, x: emitter.x, y: emitter.y, z: emitter.z, type: 55, metadata: 0});
		});
	    }
	    return true;
	};
	return false;
    });
}
// Redstone.updateOffForce(updated block.x, .z, .y, current chunk, game object);
// Force update a line of redstone-activated blocks to be off - instead of just turning the off one on again!
// DON'T EVER call this directly. ONLY to be used from within Redstone.updateRecursive();

Redstone.update = function(x, z, y, chunk, game) {
    var block = chunk.get_block_type(x, z, y);
    console.log('Redstone: Updating ' + x + ',' + y + ',' + z);
    if (chunk.get_block_meta(x, z, y) == 0xF || block == 76) {
	this.updateOn(x, z, y, chunk, game, block);
    }
    else {
	this.updateOff(x, z, y, chunk, game, block);
    }
}
// Redstone.update(updated block.x, .z, .y, current chunk, game object);
// Call in order to update redstone for a redstone-activated block.
// Currently supported blocks:
// 331 (in hand)/55 (on ground): Redstone Wire

Redstone.emitters = [];
// Redstone.emitters[]
// Array used to store emitters. Modifying it is NOT recommended!
