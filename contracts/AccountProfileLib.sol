// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./CompoundLib.sol";
import "./math/FullMath.sol";
import "./hardhat/console.sol";

library AccountProfileLib {
    using CompoundLib for address;
    using FullMath for uint256;

    struct AssetProfile {
        Supply supply;
        Borrow borrow;
        Asset asset;
        uint256 principal_;
        uint256 borrowLimitPCT_;
        uint256 compRewardPerBlock_;
    }

    struct Supply {
        uint256 cTokenAmt;
        uint256 amount_;
        uint256 exchangeRate_;
        uint256 collateralFactor_;
        uint256 compSupplySpeed_;
    }

    struct Borrow {
        uint256 amount;
        uint256 compBorrowSpeed_;
    }

    struct Asset {
        address cToken;
        uint256 underlyingDecimals_;
    }

    function newAssetProfile(address cToken, uint256 supplyCTokenAmt, uint256 borrowAmt) internal view returns (AssetProfile memory assetProfile) {
        assetProfile.supply = newSupply(cToken, supplyCTokenAmt);
        assetProfile.borrow = newBorrow(cToken, borrowAmt);
        assetProfile.asset = newAsset(cToken);

        if(assetProfile.supply.amount_ == 0) {
            // borrowLimitPCT_ = 100% (supplyAmt != 0)
            assetProfile.borrowLimitPCT_ = 0;
        } else {
            // borrowLimitPCT_ = borrowAmt / (supplyAmt * collFactor) = borrowAmt / supplyAmt / collFactor (supplyAmt != 0)
            assetProfile.borrowLimitPCT_ = assetProfile.borrow.amount.mulDiv(
              CompoundLib.one,
              assetProfile.supply.amount_
            ).mulDiv(
              CompoundLib.one,
              assetProfile.supply.collateralFactor_
            );
        }
        uint256 supplyAmt = assetProfile.supply.amount_;
        // principal = supplyAmt - borrowAmt
        if(supplyAmt >= borrowAmt) {
            assetProfile.principal_ = supplyAmt - borrowAmt;
        } else {
            assetProfile.principal_ = 0;
        }

        // compRewardPerBlock_
        // speed_comp_s*(cTokenAmt_s/cTokenTotalSupply) + speed_comp_b*(amt_b/amt_b_total);
        assetProfile.compRewardPerBlock_ = assetProfile.supply.compSupplySpeed_.mulDiv(
            assetProfile.supply.cTokenAmt,
            CToken(cToken).totalSupply()
        ) + assetProfile.borrow.compBorrowSpeed_.mulDiv(
            assetProfile.borrow.amount,
            CToken(cToken).totalBorrows()
        );
    }

    function newSupply(address cToken, uint256 cTokenAmt) private view returns (Supply memory supply) {
        supply.cTokenAmt = cTokenAmt;
        supply.collateralFactor_ = cToken.getCollateralFactor();
        supply.compSupplySpeed_ = cToken.getCompSpeedPerBlock(true);
        supply.exchangeRate_ = CToken(cToken).exchangeRateStored();
        supply.amount_ = cTokenAmt.mulDiv(supply.exchangeRate_, CompoundLib.one);
    }

    function newBorrow(address cToken, uint256 amount) private view returns (Borrow memory borrow) {
        borrow.amount = amount;
        borrow.compBorrowSpeed_ = cToken.getCompSpeedPerBlock(false);
    }

    function newAsset(address cToken) private view returns (Asset memory asset) {
        asset.cToken = cToken;
        address underlying = cToken.getUnderlying();
        asset.underlyingDecimals_ = cToken.getUnderlyingDecimals(underlying);
    }

    function calBorrowLimitPCT(uint256 col, uint256 bor) private pure returns (uint256) {
        if(col == 0 || col <= bor) return CompoundLib.one;
        return bor.mulDiv(CompoundLib.one, col);
    }
}
