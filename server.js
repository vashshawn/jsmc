#!/usr/bin/env node

// Deoxxa Development's jsmc
// Adapted for whiskers75/Miney by whiskers75

var nconf = require("nconf"),
optimist = require("optimist");

nconf.argv();
optimist.argv._.reverse().concat(["config.json"]).forEach(function(file) { nconf.file(file.toLowerCase().replace(/[^a-z0-9]+/g, "_"), file); });
nconf.defaults({
    server: {
	port: 25565,
    },
    game: {
	name: "whiskers75/Miney version 0.1!",
	mode: 1,
	max_players: 25,
	difficulty: 0,
	spawnx: 0,
	spawny: 0,
	spawnz: 0,
    },
});

// This is the `Map` object. It keeps a list of routines that generate your map.
var Map = require("./lib/map");

var map = new Map();

// The `MapgenLoad` plugin loads existing map data from disk. The argument given
// to it is the directory to store map data in.
var MapgenLoad = require("./plugins/mapgen-load"),
mapgen_load = new MapgenLoad(__dirname + "/map");
map.add_generator(mapgen_load.modify.bind(mapgen_load));

var MapgenFloor = require("./plugins/mapgen-floor"),
mapgen_floor = new MapgenFloor();
map.add_generator(mapgen_floor.modify.bind(mapgen_floor));

// This is the `Game` object. It's the core of whiskers75/Miney. It holds
// a lot of the wiring between different components.
var Game = require("./lib/game");

var game = new Game({
    name: nconf.get("game:name"),
    mode: nconf.get("game:mode"),
    max_players: nconf.get("game:max_players"),
    difficulty: nconf.get("game:difficulty"),
    admins: nconf.get("game:admins"),
    banned: nconf.get("game:banned"),
    map: map,
});

// Load some plugins

// This plugin provides the server ping functionality for reporting server
// status in the "Play Multiplayer" screen of Minecraft.
var ServerPingPlugin = require("./plugins/server-ping");
game.use(ServerPingPlugin());

// This plugin gracefully stops the server on Ctrl+C (SIGINT).
var ServerStopPlugin = require('./plugins/server-stop');
game.use(ServerStopPlugin());
var MapgenSimplex = require("./plugins/mapgen-simplex"),
mapgen_simplex = new MapgenSimplex(1);
map.add_generator(mapgen_simplex.modify.bind(mapgen_simplex));
// This plugin handles login for players, creating a new Player object,
// attaching it to a client and finally adding it to the active Game object.
var LoginPlugin = require("./plugins/login");
game.use(LoginPlugin());

// The `MapgenGlowstone` plugin places glowstone randomly. Yay! Great for
// testing lighting, or just impressing your friends.
var MapgenGlowstone = require("./plugins/mapgen-glowstone"),
mapgen_glowstone = new MapgenGlowstone();
map.add_generator(mapgen_glowstone.modify.bind(mapgen_glowstone));

// The `MapgenGlassGrid` plugin puts a grid of glass pillars in the world.
// Again this is mostly useful for debugging.
var MapgenGlassGrid = require("./plugins/mapgen-glass-grid"),
mapgen_glass_grid = new MapgenGlassGrid();
map.add_generator(mapgen_glass_grid.modify.bind(mapgen_glass_grid));

// This plugin handles chat messages between players.
var ChatPlugin = require("./plugins/chat");
game.use(ChatPlugin());

// This plugin handles... You guessed it, digging!
var DiggingPlugin = require("./plugins/digging");
game.use(DiggingPlugin());

// This plugin handles.. BUILDING!
var BuildingPlugin = require('./plugins/building');
game.use(BuildingPlugin());

// This plugin does all the setup of a player to get them into the world. This
// includes things like setting their initial spawn position, sending them a
// bunch of chunks to get started, telling them about other players connected,
// etc.
var InitialSpawnPlugin = require("./plugins/initial-spawn");
game.use(InitialSpawnPlugin());

// This plugin displays chat messages when players join or leave the game.
var JoinPartPlugin = require("./plugins/join-part");
game.use(JoinPartPlugin());

// This plugin handles movement of players. It keeps track of their position,
// sends the information to other players, and so on.
var MovementPlugin = require("./plugins/movement");
game.use(MovementPlugin());

// This plugin sends periodic ping messages to connected players, to make sure
// they don't time out.
var PingPlugin = require("./plugins/ping");
game.use(PingPlugin());

// This plugin provides a `/suicide` command for players to kill themselves.
// It's largely used for debugging or getting yourself out of a wall...
var RespawnPlugin = require("./plugins/respawn");
game.use(RespawnPlugin());

// This plugin despawns players when they quit the game.
var DespawnPlugin = require("./plugins/despawn");
game.use(DespawnPlugin());

// This plugin saves the map to disk every now and then, if it's changed. The
// argument given to it is the directory in which to save the map data.
var SaveMapPlugin = require("./plugins/save-map");
game.use(SaveMapPlugin(__dirname + "/map"));

// whiskers75's MOTD plugin!
var MOTDPlugin = require("./plugins/motd");
game.use(MOTDPlugin());

// Provides Bitcoin functions
var BTCPlugin = require("./plugins/bitcoin");
game.use(BTCPlugin());

// Provides administrative commands `/ban` `/op` etc.
var AdminPlugin = require('./plugins/admin');
game.use(AdminPlugin());

// This is used to keep track of player ability state between the client and the server
var PlayerAbilitiesPlugin = require('./plugins/player-abilities');
game.use(PlayerAbilitiesPlugin());

// This plugin manages players health & hunger
var PlayerHealthPlugin = require('./plugins/player-health');
game.use(PlayerHealthPlugin());

// This plugin controlls falling damage/death
var PlayerFallPlugin = require('./plugins/player-fall');
game.use(PlayerFallPlugin());

// The server object is basically a wrapper around `net.Server` that constructs
// `Client` objects as they connect.

var Server = require("./lib/server");

// Here's a server instance! Note that you're not limited to one. Feel free to
// create as many as you want and wire them all up to the same `Game` object.
// Or different objects. I'm not here to judge you.

var server = new Server();

// This is how you wire a `Server` up to a `Game`.
console.log('[INFO] Starting JSMC');
var startTime = Math.round((new Date()).getTime() / 1000);
server.on("client:connect", game.add_client.bind(game));

// These listeners are really just for convenience and some info for the person
// running the server.

server.on("server:listening", function() {
    console.log('[INFO] Done (' + (Math.round((new Date()).getTime() / 1000) - startTime) + 's)!');
});

server.on("server:close", function() {
    console.log("[INFO] Server closed");
});

// Generate the spawn area so the first player to join doesn't have to sit
// around like an idiot waiting while they log in.
console.log("[INFO] Loading chunks...");
process.stdout.write('[CHUNK] Generated chunks: ');
var chunks_generated = 0;
for (var x = -7; x <= 7; ++x) {
    for (var y = -7; y <= 7; ++y) {
	game.map.get_chunk(x, y, onChunk);
    }
}

function onChunk(err, chunk) {
    // We keep count of how many chunks have been generated here.
    chunks_generated++;
    if ((chunks_generated / 5) % 1 == 0) {
	process.stdout.write(chunks_generated + ' ');
    }
    // This is 15x15 chunks
    if (chunks_generated === 225) {
	// We've loaded all the chunks we need, so it's time to start the
	// server listening so people can connect!
	process.stdout.write('\n');
	server.listen(nconf.get("server:port"), nconf.get("server:host"));
    }
}
process.on('uncaughtException',function(err){
    console.log('[ERROR] ' + err.stack);
    game.emit('server:error');
});
