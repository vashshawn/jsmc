var MapgenFloor = module.exports = function MapgenFloor(seed) {
};

MapgenFloor.prototype.modify = function modify(chunk, cb) {
    for (var x = 0; x < 16; ++x) {
	for (var z = 0; z < 16; ++z) {
	    chunk.set_block_type(x, z, 0, 7);
	}
    }
    for (var x = 0; x < 16; ++x) {
	for (var z = 0; z < 16; ++z) {
	    chunk.set_block_type(x, z, 1, 2);
	}
    }
    for (var x = 0; x < 16; x++) {
	chunk.set_block_type(x, 0, 1, 3);
    }
    
    for (var z = 0; z < 16; ++z) {
        chunk.set_block_type(0, z, 1, 3);
    }
    
    return cb(null, chunk);
};
