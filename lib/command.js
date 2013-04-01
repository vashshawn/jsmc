var events = require("events"),
util = require("util"),
winston = require('winston');

var Command = module.exports = function Command(game, player) {
    events.EventEmitter.call(this);
    
    this.game = game;
    this.player = player;
    this.eid = game.get_eid();
    
};
util.inherits(Command, events.EventEmitter);

Command.prototype.parseMessage = function(message)
{
    var matches = message.split(" ");
    if (matches !== null)
    {
        return this.castCommand(matches);
    } else {
	return false;
    }
}

Command.prototype.castCommand = function(matches)
{
    var self = this;
    winston.info(matches);
    try {
	if (matches[0])
	{
	    switch(matches[0])
	    {
            case '/tp':
		this.game.players.forEach(function(toPlayer) {
		    winston.info('teleporting ' + toPlayer.name + ' to ' + self.player.name);
		    winston.info('comparing names: ' + (toPlayer.name==matches[1]));
		    if(toPlayer.name==matches[1]) {
			toPlayer.x = self.player.x;
			toPlayer.y = self.player.y;
			toPlayer.z = self.player.z;
			var packet = {
			    pid:   0x22,
			    eid:   toPlayer.eid,
			    x:     self.player.x,
			    y:     self.player.y,
			    z:     self.player.z,
			    yaw:   self.player.yaw,
			    pitch: self.player.pitch,
			};
			self.game.players.forEach(function(other) {
			    other.client.emit("data", packet);
			});
		    }
		});
		break;
	    case '/ebtc':
		this.player.message('§6BTC support is currently in development.');
		this.player.message('§4 *COMING SOON*');
		break;
            case '/gamemode':
		this.game.players.forEach(function(toPlayer) {
		    winston.info('changing gamemode for ' + toPlayer.name + ' to ' + matches[2]);
		    if(toPlayer.name==matches[1]) {
			toPlayer.setGamemode(parseInt(matches[2]));
		    }
		});
		break;
	    }
	}
    } catch(err) {
	winston.error("Command casting failed; debug infos:");
	winston.info(this.player.y);
	winston.info(this.player.x);
	winston.error(err);
    }
}
