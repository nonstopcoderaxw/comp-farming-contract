// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract UserProxy {
    address private owner;
    address private target;
    address private fallbackUser;

    error onlyOwnerAllowed(address);
    error fallbackDenied(address);

    constructor(address _target, address _owner, address _fallbackUser) {
        owner = _owner;
        target = _target;
        fallbackUser = _fallbackUser;
    }

    modifier onlyOwner {
        if(msg.sender != owner) revert onlyOwnerAllowed(owner);
        _;
    }

    function setOwner(address newOwner) external onlyOwner {
        owner = newOwner;
    }

    function setTarget(address newTarget) external onlyOwner {
        target = newTarget;
    }

    function write(bytes[] memory data) external onlyOwner returns (bytes[] memory results){
        results = new bytes[](data.length);
        for (uint256 i = 0; i < data.length; i++) {
            (bool success, bytes memory result) = target.delegatecall(data[i]);
            if (!success) {
                // tx revert silently
                if (result.length < 68) revert();
                assembly {
                    result := add(result, 0x04)
                }
                revert(abi.decode(result, (string)));
            }
            results[i] = result;
        }
    }

    fallback() external {
        if (msg.sender != owner && msg.sender != fallbackUser) revert fallbackDenied(msg.sender);

        (bool success, ) = target.delegatecall(msg.data);

        assembly {
             let mem := mload(0x40)
             returndatacopy(mem, 0, returndatasize())

             switch success
             case 0 { revert(mem, returndatasize()) }
             default { return(mem, returndatasize()) }
        }
    }
}
