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
//  it("should call a function that depends on a linked library", function() {
//    var meta;
//    var metaCoinBalance;
//    var metaCoinEthBalance;
//
//    return MetaCoin.deployed().then(function(instance) {
//      meta = instance;
//      return meta.getBalance.call(accounts[0]);
//    }).then(function(outCoinBalance) {
//      metaCoinBalance = outCoinBalance.toNumber();
//      return meta.getBalanceInEth.call(accounts[0]);
//    }).then(function(outCoinBalanceEth) {
//      metaCoinEthBalance = outCoinBalanceEth.toNumber();
//    }).then(function() {
//      assert.equal(metaCoinEthBalance, 2 * metaCoinBalance, "Library function returned unexpected function, linkage may be broken");
//    });
//  });
//  it("should send coin correctly", function() {
//    var meta;
//
//    // Get initial balances of first and second account.
//    var account_one = accounts[0];
//    var account_two = accounts[1];
//
//    var account_one_starting_balance;
//    var account_two_starting_balance;
//    var account_one_ending_balance;
//    var account_two_ending_balance;
//
//    var amount = 10;
//
//    return MetaCoin.deployed().then(function(instance) {
//      meta = instance;
//      return meta.getBalance.call(account_one);
//    }).then(function(balance) {
//      account_one_starting_balance = balance.toNumber();
//      return meta.getBalance.call(account_two);
//    }).then(function(balance) {
//      account_two_starting_balance = balance.toNumber();
//      return meta.sendCoin(account_two, amount, {from: account_one});
//    }).then(function() {
//      return meta.getBalance.call(account_one);
//    }).then(function(balance) {
//      account_one_ending_balance = balance.toNumber();
//      return meta.getBalance.call(account_two);
//    }).then(function(balance) {
//      account_two_ending_balance = balance.toNumber();
//
//      assert.equal(account_one_ending_balance, account_one_starting_balance - amount, "Amount wasn't correctly taken from the sender");
//      assert.equal(account_two_ending_balance, account_two_starting_balance + amount, "Amount wasn't correctly sent to the receiver");
//    });
//  });
});
