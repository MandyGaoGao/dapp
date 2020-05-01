var Auction = artifacts.require("./Auction.sol");

module.exports = function(deployer) {
  deployer.deploy(Auction,10000, '0xDf8a0663bf18816CF0249C38FB0754aA89B75B66');
};
