var HDWalletProvider = require('truffle-hdwallet-provider');
//require('dotenv').load();
var mnemonic = process.env.MNEMONIC;

module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',
      port: 7545,
      network_id: '*' // Match any network id
    },
    rinkeby: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://rinkeby.infura.io/" + process.env.INFURA);
      },
      network_id: 4
    }
  }
};
