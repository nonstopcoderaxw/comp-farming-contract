// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./UserProxy.sol";

contract UserProxyFactory {
    address public owner;
    address public target;
    mapping(address => address) public proxy_to_user;

    error onlyOwnerAllowed(address);

    constructor(address _target) {
        owner = msg.sender;
        target = _target;
    }

    modifier onlyOwner {
        if (msg.sender != owner) revert onlyOwnerAllowed(owner);
        _;
    }

    function createUserProxy() external {
        if (proxy_to_user[msg.sender] == address(0)) {
          address newProxy = address(new UserProxy{salt: getSalt(msg.sender)}(target, msg.sender));
          proxy_to_user[msg.sender] = newProxy;
        }
    }

    function setOwner(address newOwner) external onlyOwner {
        owner = newOwner;
    }

    function setTarget(address newTarget) external onlyOwner {
        target = newTarget;
    }

    function getSalt(address user) internal pure returns (bytes32) {
        return keccak256(abi.encode(user));
    }


}
