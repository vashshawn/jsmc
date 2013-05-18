var Steez = require("steez"),
util = require("util");

var Client = module.exports = function Client() {
    Steez.call(this);

    this.player = null;
};
util.inherits(Client, Steez);

Client.prototype.write = function(packet) {
    this.emit("packet", packet);
    this.emit("data", packet);
    
    return !this.paused && this.writable;
};
