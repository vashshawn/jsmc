var Steez = require("steez")
  , util = require("util")
  , parsePacket = require("minecraft-protocol").protocol.parsePacket;

var Parser = module.exports = function Parser() {
  Steez.call(this);
  this.incomingBuffer = new Buffer(0);
};
util.inherits(Parser, Steez);

Parser.prototype.write = function write(data) {
  this.incomingBuffer = Buffer.concat([incomingBuffer, data]);
  var parsed, packet;
  while (true) {
    parsed = parsePacket(this.incomingBuffer, true);
    if (! parsed) break;
    packet = parsed.results;
    incomingBuffer = incomingBuffer.slice(parsed.size);
    this.emit("data", parsed.results);
  }
  return !this.paused && this.writable;
};
