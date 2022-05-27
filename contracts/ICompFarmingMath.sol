// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;
import "./openzeppelin/IERC20.sol";
import "./CompoundInterfaces.sol";
import "./AccountProfileLib.sol";

interface ICompFarmingMath {

    /// @dev Retrieve the asset profile on a single cToken of an account
    ///      The function assume the account doesn't cash in hand, meaning if the borrow amt if any will be supplied back or no borrow at all.
    /// @param acc The account
    /// @param cToken The cToken address
    /// @return The AccountProfileLib.AssetProfile struct data
    function getAssetProfile(address acc, address cToken) external view returns (AccountProfileLib.AssetProfile memory);

    /// @dev Return the updated Asset Profile with updated principal, borrow limit percentage.
    ///      The function assume the AccountProfile doesn't cash in hand, meaning if the borrow amt if any will be supplied back or no borrow at all.
    /// @param p The Asset Profile before the compute
    /// @param deltaPrincipal The delta of prinicipal btw before and after Asset Profile
    /// @param deltaBorrowLimitPCT The delta borrow limit percentage btw before and fater Asset Profile.
    ///                            The borrow limit percentage is only adjusted by borrowing and supply the same cToken asset.
    ///                            This is for Compound yield farming purpose only.
    /// @return The updated Asset Profile in a farming setup
    function computeAssetProfile(AccountProfileLib.AssetProfile memory p, int256 deltaPrincipal, int256 deltaBorrowLimitPCT) external view returns (AccountProfileLib.AssetProfile memory);

    /// @dev Return the constant variables for farming comp token of an cToken asset
    /// @param cToken The cToken market
    /// @return blockNumber The block number
    /// @return rate_u The utilization rate
    /// @return k The kink
    /// @return rate_mul The muliplier rate per block
    /// @return rate_base The base rate per block
    /// @return f_reserve The reserve factor
    /// @return f_c The collatral factor
    /// @return rate_jump The jumper rate
    /// @return compSupplySpeed The comp speed for supply
    /// @return compBorrowSpeed The comp speed for borrow
    function getFarmingContext(address cToken) external view returns (
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
    );
}
