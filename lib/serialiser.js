var Steez = require("steez")
, util = require("util")
, createPacketBuffer = require("minecraft-protocol").protocol.createPacketBuffer;

var Serialiser = module.exports = function Serialiser() {
    Steez.call(this);
};
util.inherits(Serialiser, Steez);

Serialiser.prototype.write = function write(packet) {
    this.emit("data", createPacketBuffer(packet.id, packet, true));
    return !this.paused && this.writable;
};
