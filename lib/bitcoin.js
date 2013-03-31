var kt = require('kapitalize')();

module.exports = function(walletid, pass) {
    kt.set('user', walletid);
    kt.set('pass', pass);
    kt.set('host', 'blockchain.info');
