var Redstone = new Object({});
module.exports = Redstone;

/* jsmc Redstone
   by whiskers75
   Documented in-code by whiskers75
   Currently supported redstone items:
   #55 (Redstone Wire) - whiskers75
*/

Redstone.updateOn = function updateOn(x, z, y, chunk, game) {
    var foundOne = false;
    this.emitters.forEach(function(emitter) {
        if (emitter.x == x && emitter.y == y && emitter.z == z && emitter.type == 'wire' && emitter.state == false) {
            emitter.state = true;
            foundOne = true;
            // Update current emitter state.
        }
        if (emitter.x == x + 1 || emitter.x == x - 1) {
            if (emitter.y == y || emitter.y == y + 1) {
                if (emitter.z == z + 1 || emitter.z == z - 1) {
                    if (emitter.state == false) {
                        // It looks like we've found a closely-matching emitter!
                        // We've just proven that we're on, so let's switch this guy on!
                        emitter.state = true;
                        if (emitter.type == 'wire') {
                            chunk.set_block_meta(emitter.x, emitter.x, emitter.y, 0xF);
                            game.clients.forEach(function(client) {
                                client.emit("data", {pid: 0x35, x: emitter.x, y: emitter.y, z: emitter.z, type: 55, metadata: 0xF});
                            });
                        }
			return true;
                    }
                }
            }
        }
    });
    if (!foundOne) {
        this.emitters.push({type: 'wire', x: x, y: y, z: z, meta: 0xF, state: true});
    }
    return false;
}
// Redstone.updateOn(updated block.x, .z, .y, current chunk, game object);
// Updates an already-on block.
// DON'T EVER call this directly. ONLY to be used from within Redstone.update();

Redstone.updateRecursive = function updateRecursive(x, z, y, chunk, game, state) {
    for (var done = false; done == false; done = false) {
	if (state == true) {
            for (var more = false; more == false; more = false) { // more is false when there is more wire/objects, true when there isn't.
                more = this.updateOn(x, z, y, chunk, game);
            }
        }
        else {
	    // We're now going to walk through a possible line of redstone and turn it off.
	    for (var more = false; more == false; more = false) { // more is false when there is more wire/objects, true when there isn't.
		more = this.updateOffForce(x, z, y, chunk, game);
	    }
	}
    }
}
// Redstone.updateRecursive(off/on block.x, .z, .y, current chunk, game object, state of specified block (true/false));
// Recursively updates a line of wire or other redstone substance to the set state.
// Useful for turning an entire line off.
// I suppose you can call this one from outside Redstone.update if you must.

Redstone.updateOff = function updateOff(x, z, y, chunk, game) {
    var itsOn = false;
    var foundOne = false;
    this.emitters.forEach(function(emitter) {
        if (emitter.x == x + 1 || emitter.x == x - 1) {
            if (emitter.y == y || emitter.y == y + 1) {
                if (emitter.z == z + 1 || emitter.z == z - 1) {
                    if (emitter.state == true) {
                        // This redstone wire needs to be activated!
                        chunk.set_block_meta(x, z, y, 0xF);
                        game.clients.forEach(function(client) {
                            client.emit("data", {pid: 0x35, x: x, y: y, z: z, type: 55, metadata: 0xF});
                        });
                        itsOn = true;
                    }
                }
            }
        }
    });
    if (!itsOn) {
        chunk.set_block_meta(x, y, z, 0);
        game.clients.forEach(function(client) {
            client.emit("data", {pid: 0x35, x: x, y: y, z: z, type: 55, metadata: 0});
        });
    }
}

// Redstone.updateOff(updated block.x, .z, .y, current chunk, game object);
// DON'T EVER call this directly. ONLY to be used from within Redstone.update();

Redstone.updateOffForce(x, z, y, chunk, game) {
    this.emitters.forEach(function(emitter) {
        if (emitter.x == x + 1 || emitter.x == x - 1) {
            if (emitter.y == y || emitter.y == y + 1) {
                if (emitter.z == z + 1 || emitter.z == z - 1) {
                    if (emitter.state == true) {
                        // This redstone emitter needs to be deactivated!
                        chunk.set_block_meta(emitter.x, emitter.x, emitter.y, 0);
                        game.clients.forEach(function(client) {
                            client.emit("data", {pid: 0x35, x: emitter.x, y: emitter.y, z: emitter.z, type: 55, metadata: 0});
                        });
			return true;
                    }
                }
            }
        }
	return false;
    });
}
// Redstone.updateOffForce(updated block.x, .z, .y, current chunk, game object);
// Force update a line of redstone-activated blocks to be off - instead of just turning the off one on again!
// DON'T EVER call this directly. ONLY to be used from within Redstone.updateRecursive();

Redstone.update = function(x, z, y, chunk, game) {
    var block = chunk.get_block_type(x, z, y);
    if (block == 55) {
	if (chunk.get_block_meta(x, z, y) == 0xF) {
	    this.updateOn(x, z, y, chunk, game);
	}
	else {
	    this.updateOff(x, z, y, chunk, game);
	}
    }
}
// Redstone.update(updated block.x, .z, .y, current chunk, game object);
// Call in order to update redstone for a redstone-activated block.
// Currently supported blocks:
// 331 (in hand)/55 (on ground): Redstone Wire

Redstone.prototype.emitters = [];
