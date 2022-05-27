// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
//
// interface IMyCompYield {
//     function getAccountProfile(address acc) external view returns(MyCompYield.AccountProfile memory accountProfile);
//     function getFarmingAccountProfileByAP(MyCompYield.AccountProfile memory accountProfile, uint targetedBorrowLimitPCTMantissa, uint offset) external view returns(bool isValidated, MyCompYield.AccountProfile memory farmingAccountProfile);
//     function getMaxInterestAccountProfileByAP(MyCompYield.AccountProfile memory accountProfile) external view returns(bool isValidated, MyCompYield.AccountProfile memory maxInterestAccountProfile);
//     function getUpdatedFarmingAccountProfile(address cToken, int256 deltaAmount, MyCompYield.AccountProfile memory current, uint256 borrow_limit_pct, uint offset) external view returns (bool isValidated, MyCompYield.AccountProfile memory updated);
//     function getPrincipal(address acc, address cToken) external view returns (bool isValidated, uint256 principal);
// }
//
// library MyCompYield {
//     struct CompProfile{
//          uint balance;
//          uint yetToClaimed;
//     }
//
//     struct AccountInterestProfile{
//         CTokenInterest[] supplyInterests;
//         CTokenInterest[] borrowInterests;
//
//         uint totalInterestInUSD_;
//         bool isPositiveInterest_;
//     }
//
//     struct CTokenInterest{
//         address cTokenAddr;
//         uint interestRateMantissa;
//         uint balance;
//         uint numberOfBlocks;
//
//         string underlyingSymbol_;
//         uint interestInUSD_;
//     }
//
//     struct AccountProfile{
//         SupplyAsset[] suppliedAssets;
//         BorrowAsset[] borrowedAssets;
//
//         uint totalSuppliedInUSD_;
//         uint totalBorrowedInUSD_;
//         uint totalSuppliedInUsdAsCollateral_;
//         uint borrowLimitPCTMantissa_;
//         uint accountCapital_;
//
//         uint[] borrowLimitPCTLineItemMantissaList;
//     }
//
//     struct SupplyAsset{
//         Asset asset;
//
//         uint collateralFactorMantissa_;
//         uint suppliedInUsdAsCollateral_;
//     }
//
//     struct BorrowAsset{
//         Asset asset;
//     }
//
//     struct Asset{
//         address cTokenAddr;
//         uint amount;
//
//         string underlyingSymbol_;
//         uint underlyingDecimals_;
//         uint valueInUSD_;
//         uint compBorrowSpeed_;
//         uint compSupplySpeed_;
//     }
//
//     function getSupplyAmount(
//         AccountProfile memory profile,
//         address cToken
//     ) internal pure returns (uint256) {
//         for (uint256 i = 0; i < profile.suppliedAssets.length; i++) {
//             if (profile.suppliedAssets[i].asset.cTokenAddr == cToken) {
//                 return profile.suppliedAssets[i].asset.amount;
//             }
//         }
//
//         return 0;
//     }
//
//     function getBorrowAmount(
//         AccountProfile memory profile,
//         address cToken
//     ) internal pure returns (uint256) {
//         for (uint256 i = 0; i < profile.borrowedAssets.length; i++) {
//             if (profile.borrowedAssets[i].asset.cTokenAddr == cToken) {
//                 return profile.borrowedAssets[i].asset.amount;
//             }
//         }
//
//         return 0;
//     }
// }
