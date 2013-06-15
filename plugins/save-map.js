module.exports = function(location) {
  return function(game) {
    var save_interval = setInterval(function() {
      game.map.save_blocks(location);
    }, 10000);
  };
};
