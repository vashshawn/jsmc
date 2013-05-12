// Unsupported.js
// by whiskers75
// This file contains functions for finding out unsupported items in JSMC and/or converting them into a placeable item.
// TODO: Implement tile entities. WARNING: Tile entities WILL BE BLOCKED in Unsupported.checkForBlock().
// TODO: Please remove tile entities from Unsupported.items if you implement them.
// TODO: Add exception for spawn eggs (if you implement those)

var Unsupported = new Object({});
module.exports = Unsupported;

Unsupported.items = [115, 141, 142, 138, 54, 146, 149, 150, 137, 151, 116, 130, 151, 158, 154, 52, 25, 36, 84, 144, 23, -1, 0]
// Unsupported.items
// An array of items that can not be placed in the world OR are part of Unsupported.entities.
// Also not listed are any items above and equalling id 256, with some exceptions. (detailed below)
// Tile entity IDs: 138, 380, 54, 146, 149, 150, 137, 151, 116, 130, 151, 158, 154, 52, 25, 36, 84, 323, 397, 144, 23 (Enjoy trying to implement these ;) - whiskers75)

Unsupported.checkForBlock = function(id) {
    if (id == 331) {
	return 52; // Redstone (in hand), when placed, gives redstone wire - id 52.
    }
    if (id == 259 || id == 385) {
	return 51; // Fire charges/flint and steel make fire (id 51)
    }
    if (id == 326) {
	return 8; // Water bucket > water
    }
    if (id == 327) {
	return 10; // Lava bucket > lava
    }
    if (id >= 256) {
	return false;
    }
    this.items.forEach(function(item) {
	if (item == id) {
	    return false;
	}
    });
    return id;
}
// Unsupported.checkForBlock(block ID)
// Checks if an item is a block ,a non-placeable item (like a spawn egg), or a tile entity.
// Returns a block id if block, false if item.
