const Famazon = artifacts.require("Famazon");

module.exports = function(deployer) {
  deployer.deploy(Famazon);
};
