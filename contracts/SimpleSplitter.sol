pragma solidity ^0.4.11;
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import 'zeppelin-solidity/contracts/lifecycle/Destructible.sol';

contract SimpleSplitter is Ownable, Destructible {

    event SplitFunds(address indexed sender, address indexed firstRecipient, address indexed secondRecipient, uint256 value);
    event WithdrawFunds(address indexed recipient, uint256 value);

    mapping (address => uint) public splitBalances;

    function SimpleSplitter() {
        owner = msg.sender;
    }

    function withdrawFunds()
        public
    {
        require(msg.value == 0);
        uint amount = splitBalances[msg.sender];
        require(amount>0);
        splitBalances[msg.sender] = 0;
        WithdrawFunds(msg.sender,amount);
        msg.sender.transfer(amount);
    }

    function splitFunds(address _target1, address _target2)
        public
        payable
    {
        require(msg.sender != _target1 && msg.sender != _target1);

        uint splitAmount = msg.value/2;
        splitBalances[_target1] = splitBalances[_target1] += splitAmount;
        splitBalances[_target2] = splitBalances[_target2] += splitAmount;
        if(splitAmount % 2 == 1)
        {
            splitBalances[msg.sender] = splitBalances[msg.sender] += splitAmount;
        }
        SplitFunds(msg.sender, _target1, _target2, splitAmount);
    }

    function() {
        throw;
    }

}