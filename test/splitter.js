var Splitter = artifacts.require("./Splitter.sol");

contract('Splitter', function(accounts) {
    var splitterContract;

  beforeEach(function() {
    return Splitter.new({from: accounts[0]}).then(function(instance) {
        splitterContract = instance;
    })
  });

  it("should add addresses", function() {
    splitterContract.addAddresses([accounts[1], accounts[2]]).then(function(returnBool) {
        return splitterContract.getStoredAddresses();
    }).then(function(addresses) {
        return assert.equal(accounts[1], addresses[0]) &&
        assert.equal(accounts[2], addresses[1]) &&
        assert.equal(splitterContract.owner, accounts[0]);
    });
  });

  it("should initialize stored addresses to zero balance", function() {
    var balance1;
    var balance2;
    splitterContract.addAddresses([accounts[1], accounts[2]]).then(function(returnBool) {
        return splitterContract.getSplitBalance(accounts[0]);
    }).then(function(splitBalance) {
        balance1 = splitBalance.c[0];
    }).then(function(returnBool) {
        return splitterContract.getSplitBalance(accounts[1]);
    }).then(function(splitBalance) {
        balance2 = splitBalance.c[0];
        return assert.equal(balance1, 0) &&
        assert.equal(balance2, 0);
    });
  });

  it("should split values to stored addresses", function() {
    var balance1;
    var balance2;
    splitterContract.addAddresses([accounts[1], accounts[2]]).then(function(returnBool) {
        return splitterContract.splitToStoredAddresses({from: accounts[0], value: 4});
    }).then(function(trx) {
        return splitterContract.getSplitBalance(accounts[0]);
    }).then(function(splitBalance) {
        balance1 = splitBalance.c[0];
    }).then(function(returnBool) {
        return splitterContract.getSplitBalance(accounts[1]);
    }).then(function(splitBalance) {
        balance2 = splitBalance.c[0];
        return assert.equal(balance1, 4) &&
        assert.equal(balance2, 4);
    });
  });
});
