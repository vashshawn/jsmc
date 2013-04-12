// Git library
// by whiskers75
// Created to get the git commit for the version MOTD

var Git = {};
module.exports = Git;
var fs = require('fs');
Git.HEAD = function(dir) {
    var git = {};
    // Comments will show expected values
    git.HEADfile = fs.readFileSync(dir + '/.git/HEAD', {encoding: 'utf8'}); // ref: refs/whatever\n
    git.rawRefloc = git.HEADfile.substring(5); // refs/whatever\n
    git.refloc = git.rawRefloc.substring(0, git.rawRefloc.length - 1);
    git.rawCommit = fs.readFileSync(dir + '/.git/' + git.refloc, {encoding: 'utf8'});
    git.commit = git.rawCommit.substring(0, git.rawCommit.length - 1);
    git.shortCommit = git.rawCommit.substring(0, git.rawCommit.length - git.rawCommit.length + 7);
    return git;
};
