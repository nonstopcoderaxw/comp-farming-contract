// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./openzeppelin/IERC20.sol";

interface CToken is IERC20Metadata {
    function interestRateModel() external view returns (address);
    function underlying() external view returns (address);
    function totalBorrows() external view returns (uint256);
    function totalReserves() external view returns (uint256);
    function reserveFactorMantissa() external view returns (uint256);
    function exchangeRateStored() external view returns (uint);
    function borrowBalanceStored(address account) external view returns (uint);
    function getCash() external view returns (uint);
    function totalBorrowsCurrent() external view returns (uint);
    function borrowRatePerBlock() external view returns (uint);
    function supplyRatePerBlock() external view returns (uint);
    function getAccountSnapshot(address account) external view returns (uint, uint, uint, uint);

    function mint(uint mintAmount) external returns (uint);
    function redeem(uint redeemTokens) external returns (uint);
    function balanceOfUnderlying(address owner) external returns (uint);
    function borrowBalanceCurrent(address account) external returns (uint);
    function redeemUnderlying(uint redeemUnderlyingAmount) external returns (uint);
    function repayBorrow(uint repayAmount) external returns (uint);
    function borrow(uint borrowAmount) external returns (uint);

}

interface InterestRateModel {
    function utilizationRate(uint cash, uint borrows, uint reserves) external pure returns (uint);
    function kink() external pure returns (uint);
    function jumpMultiplierPerBlock() external pure returns (uint);
    function baseRatePerBlock() external pure returns (uint);
    function multiplierPerBlock() external pure returns (uint);
}

interface PriceOracle {
    function getUnderlyingPrice(CToken cToken) external view returns (uint);
}

interface Comptroller {
    struct Market {
       bool isListed;
       uint collateralFactorMantissa;
       bool isComped;
    }

    function markets(address cToken) external view returns (Market memory);
    function compAccrued(address cToken) external view returns (uint256);
    function closeFactorMantissa() external view returns (uint256);
    function liquidationIncentiveMantissa() external view returns (uint256);
    function oracle() external view returns (address);
    function getAccountLiquidity(address account) external view returns (uint, uint, uint);
    function getAssetsIn(address account) external view returns (address[] memory);
    function compSupplySpeeds(address cTokenAddress) external view returns(uint);
    function compBorrowSpeeds(address cTokenAddress) external view returns(uint);
    function getAllMarkets() external view returns (CToken[] memory);

    function enterMarkets(address[] calldata cTokens) external returns (uint[] memory);
    function claimComp(address) external;

}

interface CompoundLens{
    struct CompBalanceMetadataExt{
        uint balance;
        uint votes;
        address delegate;
        uint allocated;
    }
    function claimComp(address) external;
    function getCompBalanceMetadataExt(address comp, address comptroller, address account) external returns (CompBalanceMetadataExt memory);
}
