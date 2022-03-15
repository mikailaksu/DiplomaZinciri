var Utils = artifacts.require("./Utils.sol");
var Certify = artifacts.require("./Certify.sol");

module.exports = function(deployer) {
  deployer.deploy(Utils);
  deployer.deploy(Certify);
};
