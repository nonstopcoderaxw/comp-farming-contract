// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface CToken {
    function mint(uint mintAmount) external returns (uint);
    function redeemUnderlying(uint redeemUnderlyingAmount) external returns (uint);
    function redeem(uint redeemCTokenAmount) external returns (uint);
    function borrow(uint borrowAmount) external returns (uint);
    function repayBorrow(uint repayAmount) external returns (uint);
    function borrowBalanceStored(address account) external view returns (uint);
    function borrowBalanceCurrent(address account) external returns (uint);
    function balanceOf(address account) external view returns (uint);
    function exchangeRateStored() external view returns (uint);
}

interface Comptroller {
    function enterMarkets(address[] calldata cTokens) external returns (uint[] memory);
}

interface CompoundLens {
    struct CompBalanceMetadataExt {
        uint balance;
        uint votes;
        address delegate;
        uint allocated;
    }
    function getCompBalanceMetadataExt(address comp, address comptroller, address account) external returns (CompBalanceMetadataExt memory);
}
