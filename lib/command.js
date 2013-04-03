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
		this.player.message('§6To enable BTC support, you need a blockchain.info wallet identifier and password.');
		this.player.message('§4Until this message is removed, DO NOT attempt to register, as your ID and password may be told to EVERYONE on this Minecraft server!');
		this.player.message('§6When BTC support is done, type /btcid <wallet id> and /btcpass <wallet pass *cannot contain spaces*>');
		break;
	    case '/home':
		this.player.message('§2Teleporting you to your home chunk...');
		this.player.save.protection.chunks.forEach(function(chunk) {
		    if (chunk.primary) {
			this.player.x = chunk.x;
			this.player.y = 2;
			this.player.z = chunk.z;
                        var packet = {
                            pid:   0x22,
                            eid:   this.player.eid,
                            x:     this.player.x,
                            y:     this.player.y,
                            z:     this.player.z,
                            yaw:   this.player.yaw,
                            pitch: this.player.pitch,
                        };
                        self.game.players.forEach(function(other) {
                            other.client.emit("data", packet);
                        })
                    }
		});
                break;
            case '/btcid':
                this.player.message('§6Storing your Wallet ID...');
		if (!this.player.save.btc) {
		    this.player.save.btc = new Object({id: matches[1], pass: null});
		}
		else {
		    this.player.save.btc.id = matches[1];
		}
		this.player.message('§4Stored.');
		break;
            case '/btcpass':
                this.player.message('§6Storing your Wallet Password...');
                if (!this.player.save.btc) {
                    this.player.save.btc = new Object({id: null, pass: matches[1]});
                }
                else {
                    this.player.save.btc.pass = matches[1];
                }
                this.player.message('§4Stored.');
                break;
            case '/gamemode':
		this.game.players.forEach(function(toPlayer) {
		    winston.info('changing gamemode for ' + toPlayer.name + ' to ' + matches[2]);
		    if(toPlayer.name==matches[1]) {
			if (player.isAdmin()) {
			    toPlayer.setGamemode(parseInt(matches[2]));
			}
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
