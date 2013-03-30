var path = require("path"),
    fs = require("fs");

var MapgenLoad = module.exports = function MapgenLoad(location) {
  this.location = location;
};

MapgenLoad.prototype.modify = function modify(chunk, cb) {
  var k = [chunk.x.toString(36), chunk.z.toString(36)].join(":"),
      file = path.join(this.location, Buffer(k).toString("base64"));
  var file2 = path.join(this.location, Buffer(k).toString("base64"));
  file2 = file2.slice(0, - 1) + '.json';
  fs.exists(file, function(exists) {
      if (!exists) {
          return cb(null, chunk);
      }
      fs.exists(file2, function(exists) {
          if (!exists) {
              return cb(null, chunk);
          }
          fs.readFile(file, function(err, data) {
              if (err) {
                  return cb(err);
              }
              fs.readFile(file2, function(err, newChunk) {
                  if (err) {
                      return cb(err);
                  }
              chunk = JSON.parse(newChunk); 
              data.copy(chunk.data);

              return cb(true, chunk);
              });
          });
      });
  });
  };
