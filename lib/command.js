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
		if (!matches[1]) {
		    this.player.message('§4Syntax: /tp (player) | /tp (x) (y) (z)');
		}
		else {
		    if (matches[3]) {
			this.player.message('§2Teleporting to x: '+ matches[1] + ' y:' + matches[2] + ' z:' + matches[3] + '...');
                        console.log('[TP] ' + this.player.name + ' (' + this.player.eid + ') ->  x:' + matches[1] + ' y:' + matches[2] + ' z:' + matches[3]);
			this.player.x = matches[1];
			this.player.y = matches[2];
			this.player.z = matches[3];
			var packet = {
			    pid:   0x22,
			    eid:   this.player.eid,
			    x:     this.player.x,
			    y:     this.player.y,
			    z:     this.player.z,
			    yaw:   this.player.yaw,
			    pitch: this.player.pitch,
			};
			this.game.players.forEach(function(other) {
			    other.client.emit("data", packet);
			});
			this.player.message('§2Done.');
		    }
		    else {
			if (matches[1]) {
                            this.game.players.forEach(function(toPlayer) {
                                if(toPlayer.name==matches[1]) {
                                    this.player.message('§2Teleporting to x: '+ toPlayer.x + ' y:' + toPlayer.y + ' z:' + toPlayer.z + '...');
                                    console.log('[TP] ' + this.player.name + ' (' + this.player.eid + ') ->  x:' + toPlayer.x + ' y:' + toPlayer.y + ' z:' + toPlayer.z);
                                    this.player.x = toPlayer.x;
                                    this.player.y = toPlayer.y;
                                    this.player.z = toPlayer.z;
                                    var packet = {
                                        pid:   0x22,
                                        eid:   this.player.eid,
                                        x:     this.player.x,
                                        y:     this.player.y,
                                        z:     this.player.z,
                                        yaw:   this.player.yaw,
                                        pitch: this.player.pitch,
                                    };
                                    this.game.players.forEach(function(other) {
                                        other.client.emit("data", packet);
				    });
				    }
				});
                		}
			    }
			}
		return true;
            case '/save':
		return true;
	    case '/ebtc':
		return true;
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
                return true;
            case '/btcid':
                this.player.message('§6Storing your Wallet ID...');
		if (!this.player.save.btc) {
		    this.player.save.btc = new Object({id: matches[1], pass: null});
		}
		else {
		    this.player.save.btc.id = matches[1];
		}
		this.player.message('§4Stored.');
		return true;
            case '/btcpass':
                this.player.message('§6Storing your Wallet Password...');
                if (!this.player.save.btc) {
                    this.player.save.btc = new Object({id: null, pass: matches[1]});
                }
                else {
                    this.player.save.btc.pass = matches[1];
                }
                this.player.message('§4Stored.');
                return true;
            case '/gamemode':
		this.game.players.forEach(function(toPlayer) {
		    winston.info('changing gamemode for ' + toPlayer.name + ' to ' + matches[2]);
		    if(toPlayer.name==matches[1]) {
			if (player.isAdmin()) {
			    toPlayer.setGamemode(parseInt(matches[2]));
			}
		    }
		});
		return true;
	    default:
		if (matches[0].substring(0, 1) == '/') {
		    this.player.message('Unknown command.');
		    return true;
		}
		return false;
	    }
	    return false;
	}
    } catch(err) {
	winston.error("Command casting failed; debug infos:");
	winston.info(this.player.y);
	winston.info(this.player.x);
	winston.error(err);
    }
}
