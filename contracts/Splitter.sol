pragma solidity ^0.4.10;
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import 'zeppelin-solidity/contracts/ownership/Destructible.sol';

contract Splitter is Ownable, Destructible {

    address[] addressList;
    mapping(address => uint) splitBalances;
    uint remainderBalance;

    event LogSplitTransfer(address receiver, uint amount);
    event LogStoredBalanceUpdate(address user, uint amount);

    function splitToStoredAddresses()
        payable
        public
        returns(bool success)
    {
        if (msg.value <= 0) throw;
        uint remainder = msg.value % addressList.length;
        remainderBalance += remainder;

        uint splitAmount = msg.value / addressList.length;
        if (remainderBalance % addressList.length == 0) {
            splitAmount += remainderBalance/addressList.length;
            remainderBalance = 0;
        }
        for(uint i = 0; i<addressList.length; i++){
            uint total = splitBalances[addressList[i]] += splitAmount;
            splitBalances[addressList[i]] = total;
            LogStoredBalanceUpdate(addressList[i], total);
        }
    }

    function claimSplitFundsBySender()
        payable
        public
        returns(bool success)
    {
        uint splitAmount = splitBalances[msg.sender];
        if(splitAmount>0){
            splitBalances[ msg.sender] = 0;
            transferFunds(msg.sender.transfer, splitAmount);
            LogStoredBalanceUpdate(msg.sender, 0);
            LogSplitTransfer(msg.sender, amountToTransfer);
        }

        return true;
    }

    function transferFunds(_destination, _amount)
        payable
        private
        returns(bool success)
    {
        return _destination.transfer(_amount);
    }

    function claimStoredSplitFunds()
        payable
        public
        returns(bool success)
    {
        for(uint i = 0; i<addressList.length; i++){
            uint splitAmount = splitBalances[addressList[i]];
            if (splitAmount > 0) {
                transferFunds(addressList[i], splitAmount);
                splitBalances[addressList[i]] = 0;
                LogStoredBalanceUpdate(addressList[i], 0);
                LogSplitTransfer(addressList[i], splitAmount);
            }
        }

        return true;
    }

    function splitToStoredAddressesAndWithdraw()
        payable
        public
        returns(bool success)
    {
        if (splitToStoredAddresses()) {
            claimStoredSplitFunds();
        }
    }

    function splitToProvidedAddressesAndWithdraw(
        address[] targetAddresses,
        uint amount
    )
    payable
    public
    returns(bool success)
    {
        if (msg.value <= 0) throw;
        balance += msg.value;
        uint remainder = msg.value % targetAddresses.length;
        uint splitAmount = msg.value / targetAddresses.length;
        claimSplitFundsByArray(targetAddresses, splitAmount, remainder);

    }

    function claimSplitFundsByArray(
        address[] recipientAddresses,
        uint splitAmount,
        uint remainder
    )
    private
    payable
    returns(bool success)
    {
        for(uint i = 0; i<recipientAddresses.length; i++){
            transferFunds(recipientAddresses[i], splitAmount);
        }
        if (remainder > 0) {
            transferFunds(owner, remainder);
        }
        return true;
    }

    function getBalanceByAddress(address addressQuery)
        public
        constant
        returns(uint)
    {
        return splitBalances[addressQuery];
    }

    function getStoredSplitBalance()
        public
        constant
        returns(uint)
    {
        uint total = 0;
        for(uint i = 0; i<addressList.length; i++){
            total += splitBalances[addressList[i]];
        }
        return total;
    }

    function getStoredAddresses()
        public
        constant
        returns(address[])
    {
        return addressList;
    }

    function endContract()
    public
    returns(bool success)
    {
        return destroy();
    }
}