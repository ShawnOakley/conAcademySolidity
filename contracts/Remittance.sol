pragma solidity ^0.4.10;
import 'zeppelin-solidity/contracts/lifecycle/Destructible.sol';

contract Remittance is Destructible {
    address owner;
    mapping (bytes32 => Remittance) remittanceCollection;
    uint commission;

    event LogWithdrawal(address sender, uint amount, bytes32 password, uint blockNumber);
    event LogCommissionWithdrawal(uint amount);
    event LogRemittanceCreation(address sender, uint amount, uint deadline, bytes32 password);
    event LogRemittanceExpiration(address sender, bytes32 password, uint blockNumber);

    function Remittance() {
        owner = msg.sender;
    }


    function withdraw(
        bytes32 _password_hash_b
    )
    public
    returns (bool) {
        require(sha3(msg.sender) == participant_hash_a);
        require(sha3(_password_hash_b) == participant_hash_b);
        require(block.number <= deadline);

        msg.sender.transfer(this.balance);
        if (msg.sender.transfer(this.balance)) {
            LogWithdrawal(msg.sender, this.balance);
        }
    }

    function destroy()
    public {
        require(block.number > deadline);
        require(msg.sender == owner);

        super.destroy();
        return (true);
    }

    function payRemittance(bytes32 firstCode, bytes32 secondCode) returns(bool){
        bytes32 password = keccak256(firstCode, secondCode);
        Remittance storage currentRemittance = remittanceCollection[password];

        require(currentRemittance.deadline > block.number);

        uint amount = currentRemittance.amount;
        delete currentRemittance.amount;

        msg.sender.transfer(amount);

        LogWithdrawal(msg.sender, amount, password, block.number);
        return (true);
    }

    function createRemittance(bytes32 newPassword, uint deadlineOffset) {
        uint commissionAmount = msg.value * 0.15;
        uint paymentAmount = msg.value - commissionAmount;
        uint newDeadline = block.number + deadlineOffset;
        remittanceCollection[newPassword] = Remittance({
            sender: msg.sender,
            amount: paymentAmount,
            deadline: newDeadline
        });
        LogRemittanceCreation(
            msg.sender,
            paymentAmount,
            deadlineOffset,
            newPassword
        );
        return (true);
    }

    function returnRemittance(bytes32 password) returns (bool){
        Remittance storage currentRemittance = remittanceCollection[password];

        require(currentRemittance.deadline <= block.number);
        require(msg.sender == currentRemittance.sender);
        require(currentRemittance.amount > 0);

        uint amount = currentRemittance.amount;
        delete currentRemittance.amount;

        currentRemittance.sender.transfer(amount);
        LogRemittanceExpiration(currentRemittance.sender, password, block.number);
        return (true);
    }

    function claimCommissions() returns(bool){
        require(msg.sender == owner);

        uint amount = payments;
        delete payments;
        owner.transfer(amount);
        LogCommissionWithdrawal(amount);
        return (true);
    }
}