// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;
import "./ICompFarmingMath.sol";
import "./AccountProfileLib.sol";
import "./CompoundLib.sol";
import "./math/FullMath.sol";

contract CompFarmingMath is ICompFarmingMath {
    using CompoundLib for address;
    using AccountProfileLib for address;
    using FullMath for uint256;

    error borrowLimitPCTOver100PCT(uint256);
    error borrowLimitPCTLessThanZero();
    error deltaPrincipalTooBig(int256);

    /// @inheritdoc ICompFarmingMath
    function getAssetProfile(
        address acc,
        address cToken
    ) external override view returns (AccountProfileLib.AssetProfile memory) {
        return AccountProfileLib.newAssetProfile(
            cToken,
            CToken(cToken).balanceOf(acc),
            CToken(cToken).borrowBalanceStored(acc)
        );
    }
    /// @inheritdoc ICompFarmingMath
    function computeAssetProfile(
        AccountProfileLib.AssetProfile memory p,
        int256 deltaPrincipal,
        int256 deltaBorrowLimitPCT
    ) external override view returns (AccountProfileLib.AssetProfile memory) {
        // supplyAmtToBe = principal / (collateralFactor * borrowLimitPCT - 1)
        uint256 toBeBorrowLimitPCT;
        {
            uint256 currborrowLimitPCT = p.borrowLimitPCT_;
            if (deltaBorrowLimitPCT >= 0) {
                toBeBorrowLimitPCT = currborrowLimitPCT + uint256(deltaBorrowLimitPCT);
                if (toBeBorrowLimitPCT >= CompoundLib.one) revert borrowLimitPCTOver100PCT(toBeBorrowLimitPCT);
            } else {
                if (currborrowLimitPCT < uint256(-deltaBorrowLimitPCT)) revert borrowLimitPCTLessThanZero();
                toBeBorrowLimitPCT = currborrowLimitPCT - uint256(-deltaBorrowLimitPCT);
            }
        }

        uint256 toBePrincipal;
        {
            uint256 currPrincipal = p.principal_;
            if (deltaPrincipal >= 0) {
                toBePrincipal = currPrincipal + uint256(deltaPrincipal);
            } else {
                if (currPrincipal < uint256(-deltaPrincipal)) revert deltaPrincipalTooBig(deltaPrincipal);
                toBePrincipal = currPrincipal - uint256(-deltaPrincipal);
            }
        }
        // supplyAmtToBe = principal / (1 - collateralFactor * borrowLimitPCT)
        uint256 supplyAmtToBe = toBePrincipal.mulDiv(
            CompoundLib.one,
            CompoundLib.one - p.supply.collateralFactor_.mulDiv(toBeBorrowLimitPCT, CompoundLib.one)
        );
        // borrowAmtToBe = supplyAmt * factor * p
        uint256 borrowAmtToBe = supplyAmtToBe.mulDiv(p.supply.collateralFactor_, CompoundLib.one).mulDiv(
            toBeBorrowLimitPCT,
            CompoundLib.one
        );

        return p.asset.cToken.newAssetProfile(
            supplyAmtToBe.mulDiv(CompoundLib.one, p.supply.exchangeRate_),
            borrowAmtToBe
        );
    }

    // @inheritdoc ICompFarmingMath
    function getFarmingContext(address cToken) external override view returns (
        uint256 blockNumber,
        uint256 rate_u,
        uint256 k,
        uint256 rate_mul,
        uint256 rate_base,
        uint256 f_reserve,
        uint256 f_c,
        uint256 rate_jump,
        uint256 compSupplySpeed,
        uint256 compBorrowSpeed
    ) {
        blockNumber = block.number;
        CToken c = CToken(cToken);
        InterestRateModel im = InterestRateModel(c.interestRateModel());
        {
            uint256 cash = c.getCash();
            uint256 borrows = c.totalBorrows();
            uint256 reserves = c.totalReserves();
            rate_u = im.utilizationRate(cash, borrows, reserves);
        }
        k = im.kink();
        rate_mul = im.multiplierPerBlock();
        rate_base = im.baseRatePerBlock();
        f_reserve = c.reserveFactorMantissa();
        f_c = CompoundLib.getCollateralFactor(cToken);
        rate_jump = im.jumpMultiplierPerBlock();
        compSupplySpeed = CompoundLib.getCompSpeedPerBlock(cToken, true);
        compBorrowSpeed = CompoundLib.getCompSpeedPerBlock(cToken, false);
    }
}
