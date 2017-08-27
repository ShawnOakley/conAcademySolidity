var Remittance = artifacts.require("./Remittance.sol");

contract("Remittance", function(accounts) {
    var remittanceContract;
    var owner = accounts[0];
    var recipientAddress = accounts[1];
    var password = "0x1111111111111111111111111111111111111111111111111111111111111111";
    var amount = 50;

    beforeEach(function() {
        return Remittance.new(
            recipientAddress,
            password,
            10,
            {from: owner}
        ).then(
        function(instance) {
            remittanceContract = instance;
            return web3.eth.sendTransaction(
                {
                    from: recipientAddress,
                    value: amount,
                    to: remittanceContract.address
                }
            );
        })
    });

    it('should release funds to recipient if both correct hashes are provided', () => {
        var initialBalance;

        return promisify((cb) => web3.eth.getBalance(recipientAddress, cb))
        .then(balance => {
          initialBalance = balance;
          return contractInstance.withdraw(
            web3.sha3(password, {encoding: 'hex'}),
            web3.sha3(recipientAddress, {encoding: 'hex'}),
            {from: recipientAddress});
        })
        .then(tx => {
          return web3.eth.getBalance(recipientAddress);
        })
        .then(balance => {
          assert.isAbove(
            balance.toNumber(),
            initialBalance.toNumber(),
            "Target balance is empty")
        });
    });
});