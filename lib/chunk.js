var events = require("events"),
util = require("util");

var Chunk = module.exports = function Chunk(x, z) {
    events.EventEmitter.call(this);
    
    this.x = x;
    this.z = z;
    
    this.data = new Buffer(196864);
    this.data.fill(0);
    
    this.dirty = false;
    this.protection = new Object({});
    this.protection.active = false;
    this.protection.owner = 'whiskers75'; // If anything goes wrong, I own the place.
};
util.inherits(Chunk, events.EventEmitter);

Chunk.prototype.get_block_type = function get_block_type(x, z, y) {
    return this.data[x + (z << 4) + (y << 8)];
};

Chunk.prototype.set_block_type = function set_block_type(x, z, y, type) {
    var index = x + (z << 4) + (y << 8);
    
    var was = this.data[index];
    
    this.data[index] = type;
    
    this.dirty = true;
    
    this.emit("block:type:change", x, z, y, type, was);
    
    return this;
};

Chunk.prototype.addRedstoneOutput = function addRedstoneOutput(x, z, y, player) { // Returns back (res)
    if (!player.save.redstone) {
	player.save.redstone = new Object({outputs: [], inputs: []});
    }
    player.save.redstone.outputs.push(new Object({x: x, z: z, y: y}));
    return true;
}
Chunk.prototype.delRedstoneOutput = function delRedstoneOutput(x, z, y, player) { // Returns back (err, res)
    if (!player.save.redstone) {
	// why are you calling this?
	return ("You're stupid.", null)
    }
    player.save.redstone.outputs.every(function(obj, index) {
	if (obj.x = x && obj.y = y && obj.z = z) {
	    player.save.redstone.outputs.splice(index, 1);
	    return false;
	}
	else {
	    return true;
	}
    });
}

Chunk.prototype.shareRedstone = function shareRedstone(player, shared) { // Can't be undone!
    player.save.redstone.outputs.forEach(function(output) {
	if (!shared.save.redstone.outputs.indexOf(output)) {
	    this.addRedstoneOutput(output.x, output.z, output.y);
            player.message('Shared to ' + shared.name + ' redstone output ' + output.x + ',' + output.z + ',' + output.y);
	    shared.message('Received from ' + player.name + ' redstone output ' + output.x + ',' + output.z + ',' + output.y);
	}
    });
}

Chunk.prototype.get_block_meta = function get_block_meta(x, z, y) {
    var index = 65536 + Math.floor((x + (z << 4) + (y << 8)) / 2);
    
    if (x % 2) {
	return this.data[index] >> 4;
    } else {
	return this.data[index] & 0x0f;
    }
};

Chunk.prototype.set_block_meta = function set_block_meta(x, z, y, meta) {
    var index = 65536 + Math.floor((x + (z << 4) + (y << 8)) / 2),
    was = null;
    
    if (x % 2) {
	was = this.data[index] >> 4;
	this.data[index] &= 0x0f;
	this.data[index] |= (meta << 4);
    } else {
	was = this.data[index] & 0x0f;
	this.data[index] &= 0xf0;
	this.data[index] |= (meta & 0x0f);
    }
    
    this.dirty = true;
    
    this.emit("block:meta:change", x, z, y, meta, was);
    
    return this;
};

Chunk.prototype.get_light_block = function get_light_block(x, z, y) {
    var index = 98304 + Math.floor((x + (z << 4) + (y << 8)) / 2);
    
    if (x % 2) {
	return this.data[index] >> 4;
    } else {
	return this.data[index] & 0x0f;
    }
};

Chunk.prototype.set_light_block = function set_light_block(x, z, y, light) {
    var index = 98304 + Math.floor((x + (z << 4) + (y << 8)) / 2),
    was = null;
    
    if (x % 2) {
	was = this.data[index] >> 4;
	this.data[index] &= 0x0f;
	this.data[index] |= (light << 4);
    } else {
	was = this.data[index] & 0x0f;
	this.data[index] &= 0xf0;
	this.data[index] |= (light & 0x0f);
    }
    
    this.dirty = true;
    
    this.emit("light:block:change", x, z, y, light, was);
    
    return this;
};

Chunk.prototype.updateRedstone = function updateRedstone(x, z, y, player) {
    if (!player.save.redstone) {
        player.save.redstone = new Object({outputs: [], inputs: []});
    }
    if (this.get_block_type(x, z, y) == 55) {
	var validOutput
        // Redstone wire identified!
        player.save.redstone.outputs.forEach(function(output) {
            if (output.x == x && output.y = y && output.z = z) {
                this.set_block_meta(x, z, y, 0xF);
		this.addRedstoneOutput(x + 1, z, y, player);
                this.addRedstoneOutput(x - 1, z, y, player);
                this.addRedstoneOutput(x, z + 1, y, player);
                this.addRedstoneOutput(x, z - 1, y, player);
                this.addRedstoneOutput(x + 1, z, y + 1, player);
                this.addRedstoneOutput(x - 1, z, y + 1, player);
                this.addRedstoneOutput(x, z + 1, y + 1, player);
                this.addRedstoneOutput(x, z - 1, y + 1, player);
        	validOutput = true;
                this.updateRedstone(x + 1, z, y, player);
                this.updateRedstone(x - 1, z, y, player);
                this.updateRedstone(x, z + 1, y, player);
                this.updateRedstone(x, z - 1, y, player);
                this.updateRedstone(x + 1, z, y + 1, player);
                this.updateRedstone(x - 1, z, y + 1, player);
                this.updateRedstone(x, z + 1, y + 1, player);
                this.updateRedstone(x, z - 1, y + 1, player);
            }
        });
	if (!validOutput) {
            this.set_block_meta(x, z, y, 0);
            this.delRedstoneOutput(x + 1, z, y, player);
            this.delRedstoneOutput(x - 1, z, y, player);
            this.delRedstoneOutput(x, z + 1, y, player);
            this.delRedstoneOutput(x, z - 1, y, player);
            this.delRedstoneOutput(x + 1, z, y + 1, player);
            this.delRedstoneOutput(x - 1, z, y + 1, player);
            this.delRedstoneOutput(x, z + 1, y + 1, player);
            this.delRedstoneOutput(x, z - 1, y + 1, player);
            this.updateRedstone(x + 1, z, y, player);
            this.updateRedstone(x - 1, z, y, player);
            this.updateRedstone(x, z + 1, y, player);
            this.updateRedstone(x, z - 1, y, player);
            this.updateRedstone(x + 1, z, y + 1, player);
            this.updateRedstone(x - 1, z, y + 1, player);
            this.updateRedstone(x, z + 1, y + 1, player);
            this.updateRedstone(x, z - 1, y + 1, player);
        }
    }
    if (this.get_block_type(x, z, y) == 76) {
        this.addRedstoneOutput(x + 1, z, y, player);
        this.addRedstoneOutput(x - 1, z, y, player);
        this.addRedstoneOutput(x, z + 1, y, player);
        this.addRedstoneOutput(x, z - 1, y, player);
        this.addRedstoneOutput(x + 1, z, y + 1, player);
        this.addRedstoneOutput(x - 1, z, y + 1, player);
        this.addRedstoneOutput(x, z + 1, y + 1, player);
        this.addRedstoneOutput(x, z - 1, y + 1, player);
        this.updateRedstone(x + 1, z, y, player);
        this.updateRedstone(x - 1, z, y, player);
        this.updateRedstone(x, z + 1, y, player);
        this.updateRedstone(x, z - 1, y, player);
        this.updateRedstone(x + 1, z, y + 1, player);
        this.updateRedstone(x - 1, z, y + 1, player);
        this.updateRedstone(x, z + 1, y + 1, player);
        this.updateRedstone(x, z - 1, y + 1, player);
    }
    if (this.get_block_type(x, z, y) != 76 && this.get_block_type(x, z, y) != 55) {
	// No redstone here...
        this.delRedstoneOutput(x + 1, z, y, player);
        this.delRedstoneOutput(x - 1, z, y, player);
        this.delRedstoneOutput(x, z + 1, y, player);
        this.delRedstoneOutput(x, z - 1, y, player);
        this.delRedstoneOutput(x + 1, z, y + 1, player);
        this.delRedstoneOutput(x - 1, z, y + 1, player);
        this.delRedstoneOutput(x, z + 1, y + 1, player);
        this.delRedstoneOutput(x, z - 1, y + 1, player);
        this.updateRedstone(x + 1, z, y, player);
        this.updateRedstone(x - 1, z, y, player);
        this.updateRedstone(x, z + 1, y, player);
        this.updateRedstone(x, z - 1, y, player);
        this.updateRedstone(x + 1, z, y + 1, player);
        this.updateRedstone(x - 1, z, y + 1, player);
        this.updateRedstone(x, z + 1, y + 1, player);
        this.updateRedstone(x, z - 1, y + 1, player);
    }
}

Chunk.prototype.get_light_sky = function get_light_sky(x, z, y) {
    var index = 131072 + Math.floor((x + (z << 4) + (y << 8)) / 2);
    
    if (x % 2) {
	return this.data[index] >> 4;
    } else {
	return this.data[index] & 0x0f;
    }
};

Chunk.prototype.set_light_sky = function set_light_sky(x, z, y, light) {
    var index = 131072 + Math.floor((x + (z << 4) + (y << 8)) / 2),
    was = null;
    
    if (x % 2) {
	was = this.data[index] >> 4;
	this.data[index] &= 0x0f;
	this.data[index] |= (light << 4);
    } else {
	was = this.data[index] & 0x0f;
	this.data[index] &= 0xf0;
	this.data[index] |= (light & 0x0f);
    }
    
    this.dirty = true;

    this.emit("light:sky:change", x, z, y, light, was);

    return this;
};

Chunk.prototype.get_additional = function get_additional(x, z, y) {
    var index = 163840 + Math.floor((x + (z << 4) + (y << 8)) / 2);
    
    if (x % 2) {
	return this.data[index] >> 4;
    } else {
	return this.data[index] & 0x0f;
    }
};

Chunk.prototype.set_additional = function set_additional(x, z, y, data) {
    var index = 163840 + Math.floor((x + (z << 4) + (y << 8)) / 2),
    was = null;
    
    if (x % 2) {
	was = this.data[index] >> 4;
	this.data[index] &= 0xf0;
	this.data[index] |= (data & 0x0f);
    } else {
	was = this.data[index] & 0x0f;
	this.data[index] &= 0x0f;
	this.data[index] |= (data << 4);
    }

    this.dirty = true;
    
    this.emit("block:additional:change", x, z, y, data, was);
    
    return this;
};

Chunk.prototype.get_biome = function get_biome(x, z, y) {
    return this.data[196608 + x + (z << 4) + (y << 8)];
};

Chunk.prototype.set_biome = function set_biome(x, z, biome) {
    var index = 196608 + x + (z << 4);
    
    var was = this.data[index];

    this.data[index] = biome;

    this.dirty = true;

    this.emit("biome:change", x, z, biome, was);

    return this;
};
