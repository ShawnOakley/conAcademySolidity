pragma solidity ^0.4.10;
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import 'zeppelin-solidity/contracts/lifecycle/Destructible.sol';

contract Remittance is Ownable, Destructible {
    address owner;
    bytes32 participant_hash_a;
    bytes32 participant_hash_b;
    uint deadline;

    event LogWithdrawal(address sender, uint amount);
    event LogCommission(address sender, uint amount);

    function Remittance(
        address _participant_address,
        bytes32 _participant_hash,
        uint _deadline
    ) {
        owner = msg.sender;
        participant_hash_a = sha3(_participant_address);
        participant_hash_b = sha3(_participant_hash);
        deadline = block.number + _deadline;
    }

    function withdraw(
        bytes32 _password_hash_a,
        bytes32 _password_hash_b
    )
    public
    returns (bool) {
        require(sha3(msg.sender) == _password_hash_a);
        require(sha3(participant_hash_b) == _password_hash_b);
        require(block.number <= deadline);
        msg.sender.transfer(this.balance);
        if (msg.sender.transfer(this.balance)) {
            LogWithdrawal(msg.sender, this.balance);
        }
    }

    function destroy()
    public {
        require(block.number > deadline);
        super.destroy();
    }

    function () payable {
        uint commissionAmount = msg.value * 0.15;
        if (owner.transfer(commissionAmount)) {
            LogCommission(commissionAmount);
        }
    }

}