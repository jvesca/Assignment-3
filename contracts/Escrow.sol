// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Escrow {
    address public broker;
    address public beneficiary;
    uint public releaseTime;

    constructor() payable {}

    function setEscrowParams(address _broker, address _beneficiary, uint _releaseTime) external {
        broker = _broker;
        beneficiary = _beneficiary;
        releaseTime = _releaseTime;
    }

    function approve() external {
        require(msg.sender == broker, "Only the broker is able to approve the transaction.");
        require(block.timestamp >= releaseTime, "Funds cannot be released before the timelock period.");
        
        uint balance = address(this).balance;
        (bool sent,) = payable(beneficiary).call{value: balance}(""); 
        require(sent, "Transaction sending funds did not execute.");
    }

    function deleteContract() external {
        require(msg.sender == broker, "Only the broker can delete the contract.");
        selfdestruct(payable(broker));
    }
}
