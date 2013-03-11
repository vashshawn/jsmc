var events = require("events"),
    util = require("util");

var Command = module.exports = function Command(game, fromPlayer) {
  events.EventEmitter.call(this);

  this.game = game;
  this.fromPlayer = fromPlayer;
  this.eid = game.get_eid();

};
util.inherits(Command, events.EventEmitter);

Command.prototype.parseMessage = function(message)
{
  var re = /^\/(.*)\s(.*)\s?(.*?)\s?(.*?)$/;
  var matches = re.exec(message);
  if (matches !== null)
    {
        return this.castCommand(matches);
    } else {
      return false;
    }
}

Command.prototype.castCommand = function(matches)
{
  if (matches[1])
  {
    switch(matches[1])
    {
      case 'tp':
        game.players.forEach(function(toPlayer) {
          if(toPlayer.name==matches[2]) {
            toPlayer.x = fromPlayer.x;
            toPlayer.y = fromPlayer.y;
            toPlayer.z = fromPlayer.z;
          }
        });
      break;
    }
  }
}