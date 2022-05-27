// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./CompoundInterfaces.sol";
import "./math/FullMath.sol";

library CompoundLib {
    address internal constant cETH = 0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5;
    address internal constant cSAI = 0xF5DCe57282A584D2746FaF1593d3121Fcac444dC;
    address internal constant cUSDC = 0x39AA39c021dfbaE8faC545936693aC917d5E7563;
    address internal constant cUSDT = 0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9;
    address internal constant cWBTC = 0xC11b1268C1A384e55C48c2391d8d480264A3A7F4;
    address internal constant cWBTC2 = 0xccF4429DB6322D5C611ee964527D42E5d685DD6a; //migrated at block number 12069867
    address internal constant COMP = 0xc00e94Cb662C3520282E6f5717214004A7f26888;
    address internal constant comptroller = 0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B;
    address internal constant compoundLens = 0xd513d22422a3062Bd342Ae374b4b9c20E0a9a074;

    uint256 internal constant one = 1e18;

    using FullMath for uint256;

    function getUnderlyingSymbol(address cToken, address underlying) internal view returns (string memory) {
        if(cToken == cETH) return "ETH";
        if(cToken == cSAI) return "SAI";

        return ERC20(underlying).symbol();
    }

    function getUnderlyingDecimals(address cToken, address underlying) internal view returns (uint256) {
        if(cToken == cETH) return 18;
        return ERC20(underlying).decimals();
    }

    function getUnderlying(address cToken) internal view returns (address) {
        if(cToken == cETH) return address(0);
        return CToken(cToken).underlying();
    }

    function getCollateralFactor(address cToken) internal view returns (uint256) {
        Comptroller.Market memory cm = Comptroller(comptroller).markets(cToken);

        if(!cm.isListed) return 0;
        return cm.collateralFactorMantissa;
    }

    function getUnderlyingBalance(address cToken, address acc) internal view returns (uint256) {
        return ERC20(cToken).balanceOf(acc).mulDiv(
            CToken(cToken).exchangeRateStored(),
            one
        );
    }

    function getUnderlyingValueInUSD(address cToken, uint256 underlyingDecimals, uint256 underlyingBalance) internal view returns (uint256) {
        return getUnderlyingPriceInUSD(cToken).mulDiv(underlyingBalance, 10**underlyingDecimals);
    }

    function getUnderlyingPriceInUSD(address cToken) internal view returns (uint256) {
        PriceOracle oracle = PriceOracle(Comptroller(comptroller).oracle());

        if(cToken == cUSDC || cToken == cUSDT) return one;
        if(cToken == cWBTC2 || cToken == cWBTC) return oracle.getUnderlyingPrice(CToken(cToken)) / 1e10;

        return oracle.getUnderlyingPrice(CToken(cToken));
    }

    function getCompSpeedPerBlock(address cToken, bool supplyOrBorrow) internal view returns (uint256 speed){
        if(supplyOrBorrow) return Comptroller(comptroller).compSupplySpeeds(cToken);
        return Comptroller(comptroller).compBorrowSpeeds(cToken);
    }

    function getTotalSupplyAmt(address cToken) internal view returns (uint256) {
        return CToken(cToken).totalSupply().mulDiv(CToken(cToken).exchangeRateStored(), one);
    }

}
