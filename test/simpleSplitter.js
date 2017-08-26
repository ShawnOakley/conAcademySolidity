var SimpleSplitter = artifacts.require("./SimpleSplitter.sol");

var simpleSplitter;

var sent_val = 100;
var starting_balances = [];

var owner;
var sender;
var recipients;
var invalid_account;


function before(SimpleSplitter,accounts,done)
{
    owner = accounts[0];
    recipients = [accounts[1],accounts[2]];
    sender = accounts[4];
    invalid_account = accounts[3];

    SimpleSplitter.new({from: owner}).then(function (instance) {
        simpleSplitter = instance;

        return Promise.all(recipients.map((account) => simpleSplitter.splitBalances.call(account)))
        .then((_starting_balances) => {
            starting_balances = _starting_balances;
            simpleSplitter.splitFunds(recipients[0], recipients[1], { from: sender, value: sent_val })
            .then(() => done());
        });
  });
}

contract('Simple Splitter', function(accounts) {

    beforeEach(function (done) {
        before(SimpleSplitter, accounts, done);
    });

    it("Should split to two defined recipients", done => {
        Promise.all(recipients
        .map((account) => simpleSplitter.splitBalances.call(account)))
        .then((updated_balances) => {
            var expected_addition = sent_val/2;
            assert.equal(
                updated_balances[0].toString(10),starting_balances[0].add(expected_addition).toString(),
                "No split to first target"
            );
            assert.equal(
                updated_balances[1].toString(10),starting_balances[1].add(expected_addition).toString(),
                "No split to second target"
            );
            done();
        });
    });

});

contract('Simple Splitter', function(accounts) {

  beforeEach(function (done) {
    before(SimpleSplitter, accounts, done);
  });

    it("Should allow for withdrawal", done => {
        var starting_balances;

        Promise.all(recipients.map((account) => simpleSplitter.splitBalances.call(account)))
        .then((withdrawal_balances) => {
            var expected_addition = sent_val/2;
            assert.equal(
                withdrawal_balances[0].toString(10),
                expected_addition.toString(),
                "No split to first target"
            );
            assert.equal(
                withdrawal_balances[1].toString(10),
                expected_addition.toString(),
                "No split to second target"
            );
            Promise.all(recipients.map((account) => simpleSplitter.withdrawFunds({from: account})))
            .then(() => {

                Promise.all(recipients.map((account) => simpleSplitter.splitBalances.call(account)))
                .then((ending_balances) => {

                    assert.equal(ending_balances[0].toString(),"0", "No withdrawal to first recipient");
                    assert.equal(ending_balances[1].toString(),"0", "No withdrawal to second recipient");
                    done();
                })
            });
        });
    });
});