// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./DydxLib.sol";
import "./CompoundLib.sol";
import "./CompFarmingMath.sol";
import "./AccountProfileLib.sol";
import "./openzeppelin/IERC20.sol";
import "./myCompYield/MyCompYieldLibAndInterface.sol";
import "./hardhat/console.sol";

contract CompFarmingContract is ICallee {

    uint256 constant private one = 1e18;

    error enterMarketFailed(address cToken);
    error borrowFailed(uint256 amount, address cToken);
    error repayBorrowFailed(uint256 amount, address cToken);
    error invaidFarmingAccount(address);
    error repayFlashLoanFailed(uint256 balance);
    error redeemUnderlyingFailed(uint256);
    error numberTooBig(uint256);
    error deltaHasToBeSameDirection();
    error deltasCanBeAllZero();
    error redeemAllFailed(uint256);
    error positionAlreadyClosed();

    struct PreviewAccountProfileReturn {
        //MyCompYield.AccountProfile toBe;
        FlashLoanParams flashLoanParams;
    }

    struct ActionData {
        address sender;
        address cToken;
        address underlying;
        uint256 loanAmount;
        uint256 loanFees;
        int256 deltaPrincipal;
        int256 deltaBorrowLimitPCT;
        bool close;
    }

    struct FlashLoanParams {
        uint256 marketId;
        uint256 loanAmount;
        uint256 loanFees;
        bytes actionData;
    }

    function flashLoan(
        FlashLoanParams memory params
    ) external {
        ActionData memory data = abi.decode(params.actionData, (ActionData));
        if (params.loanAmount == 0 && !data.close) {
            if (data.deltaPrincipal > 0) {
                IERC20(data.underlying).transferFrom(data.sender, address(this), uint256(data.deltaPrincipal));
                mintInternal(Comptroller(CompoundLib.comptroller), data.underlying, uint256(data.deltaPrincipal), data.cToken);
            } else {
                redeemInternal(uint256(-data.deltaPrincipal), data.cToken);
            }
        }else {
            if (data.close) {
                //closing farming position
                if (CToken(data.cToken).balanceOf(address(this)) == 0) revert positionAlreadyClosed();
                params.loanAmount = CToken(data.cToken).borrowBalanceCurrent(address(this));
                data.loanAmount = params.loanAmount;
                params.actionData = abi.encode(data);
            }
            Actions.ActionArgs[] memory operations = new Actions.ActionArgs[](3);
            operations[0] = getWithdrawAction(params.marketId, params.loanAmount);
            operations[1] = getCallAction(params.actionData);
            operations[2] = getDepositAction(params.marketId, params.loanAmount + params.loanFees);
            Account.Info[] memory accountInfos = new Account.Info[](1);
            accountInfos[0] = Account.Info({owner: address(this), number: 1});
            ISoloMargin(soloMargin).operate(accountInfos, operations);
        }
    }

    function callFunction(
        address sender,
        Account.Info memory,
        bytes memory actionData
    ) external override {
        ActionData memory data = abi.decode(actionData, (ActionData));

        if (data.deltaPrincipal > 0){
            IERC20(data.underlying).transferFrom(data.sender, address(this), uint256(data.deltaPrincipal) + data.loanFees);
        } else {
            IERC20(data.underlying).transferFrom(data.sender, address(this), data.loanFees);
        }

        if (data.deltaPrincipal > 0 || data.deltaBorrowLimitPCT > 0) {
            //supply
            uint256 amountToSupply = uint256(data.deltaPrincipal) + data.loanAmount;
            mintInternal(Comptroller(CompoundLib.comptroller), data.underlying, amountToSupply, data.cToken);
            //borrow
            borrowInternal(data.loanAmount, data.cToken);
        }
        if (data.deltaPrincipal < 0 || data.deltaBorrowLimitPCT < 0) {
            //repay borrow
            repayBorrowInternal(data.underlying, data.loanAmount, data.cToken);
            //redeem
            uint256 amountToRedeem = data.loanAmount + uint256(-data.deltaPrincipal);
            redeemInternal(amountToRedeem, data.cToken);
        }
        if (data.deltaPrincipal < 0) {
            IERC20(data.underlying).transfer(data.sender, uint256(-data.deltaPrincipal));
        }
        if (data.close) {
            repayBorrowInternal(data.underlying, data.loanAmount, data.cToken);
            redeemAllInternal(data.cToken, address(this));
            IERC20(data.underlying).transfer(
              data.sender,
              IERC20(data.underlying).balanceOf(address(this)) - (data.loanAmount + data.loanFees)
            );
        }

        //repay flashloan
        uint256 balance = IERC20(data.underlying).balanceOf(sender);
        uint256 totalRepayAmt = data.loanAmount + data.loanFees;
        if (totalRepayAmt > balance) revert repayFlashLoanFailed(balance);

        IERC20(data.underlying).approve(soloMargin, totalRepayAmt);
    }

    function previewAccountProfile(
        ICompFarmingMath compFarmingMath,
        address underlying,
        int256 deltaPrincipal,
        address cToken,
        int256 deltaBorrowLimitPCT,
        bool closePosition
    ) external view returns (PreviewAccountProfileReturn memory r){
        //find dydx market id
        for(uint256 i = 0; i < ISoloMargin(soloMargin).getNumMarkets(); i++) {
            if(underlying != ISoloMargin(soloMargin).getMarketTokenAddress(i)) continue;
            r.flashLoanParams.marketId = i;
            break;
        }

        if (closePosition) {
            r.flashLoanParams.loanAmount = 0;
            r.flashLoanParams.loanFees = 2;
            r.flashLoanParams.actionData = abi.encode(ActionData({
                sender: msg.sender,
                cToken: cToken,
                underlying: underlying,
                loanAmount: 0,
                loanFees: 2,
                deltaPrincipal: 0,
                deltaBorrowLimitPCT: 0,
                close: true
            }));

            return r;
        }
        //recompute the account profile with new principal and borrow_limit_pct
        if (deltaPrincipal == 0 && deltaBorrowLimitPCT == 0) revert deltasCanBeAllZero();
        if (
          (deltaPrincipal > 0 && deltaBorrowLimitPCT < 0)
          || (deltaPrincipal < 0 && deltaBorrowLimitPCT > 0)
        ) revert deltaHasToBeSameDirection();

        AccountProfileLib.AssetProfile memory currAssetProfile = compFarmingMath.getAssetProfile(address(this), cToken);
        AccountProfileLib.AssetProfile memory toBeAssetProfile = compFarmingMath.computeAssetProfile(currAssetProfile, deltaPrincipal, deltaBorrowLimitPCT);

        if (deltaPrincipal > 0 || deltaBorrowLimitPCT > 0) {
            // if deltaPrincipal > 0; find out the targeted supply amount;
            // calculate loanAmount = targeted - existing - deltaPrincipal
            // action - supply (deltaPrincipal+loanAmount), borrow loanAmount+2 to repay
            // verification on borrow_limit_pct
            uint256 toBeSupplyAmount = toBeAssetProfile.supply.amount_;
            uint256 currSupplyAmount = currAssetProfile.supply.amount_;
            if (toBeSupplyAmount < currSupplyAmount){
                r.flashLoanParams.loanAmount = 0;
            } else if (toBeSupplyAmount - currSupplyAmount < uint256(deltaPrincipal)) {
                r.flashLoanParams.loanAmount = 0;
            } else {
                r.flashLoanParams.loanAmount = toBeSupplyAmount - currSupplyAmount - uint256(deltaPrincipal);
            }
        } else {
            // if deltaPrincipal < 0; find out the targeted borrow amount;
            // calculate loanAmount = existing - targeted
            // action - repay loanAmount, redeem loanAmount+2 + abs(deltaPrincipal)
            //          repay flashloan; transfer abs(deltaPrincipal) to sender
            // verification on borrow_limit_pct
            uint256 toBeBorrowAmount = toBeAssetProfile.borrow.amount;
            uint256 currBorrowAmount = currAssetProfile.borrow.amount;
            r.flashLoanParams.loanAmount = currBorrowAmount - toBeBorrowAmount;
        }

        r.flashLoanParams.loanFees = 2;

        // compute actionData
        r.flashLoanParams.actionData = abi.encode(ActionData({
            sender: msg.sender,
            cToken: cToken,
            underlying: underlying,
            loanAmount: r.flashLoanParams.loanAmount,
            loanFees: 2,
            deltaPrincipal: deltaPrincipal,
            deltaBorrowLimitPCT: deltaBorrowLimitPCT,
            close: false
        }));
    }

    // @inheritdoc
    function harvest() external {
        // claim
        Comptroller(CompoundLib.comptroller).claimComp(address(this));
        // transfer to msg.sender
        ERC20 comp = ERC20(CompoundLib.COMP);
        comp.transfer(msg.sender, comp.balanceOf(address(this)));
    }

    function mintInternal(Comptroller comptroller, address underlying, uint256 amount, address cToken) internal {
        IERC20(underlying).approve(cToken, amount);
        CToken(cToken).mint(amount);
        enterMarketInternal(comptroller, cToken);
    }

    function redeemInternal(uint256 amount, address cToken) internal {
        uint256 error = CToken(cToken).redeemUnderlying(amount);
        if (error != 0) revert redeemUnderlyingFailed(amount);
    }

    function redeemAllInternal(address cToken, address owner) internal {
        uint256 amount = CToken(cToken).balanceOf(owner);
        uint256 error = CToken(cToken).redeem(amount);
        if (error != 0) revert redeemAllFailed(amount);
    }

    function borrowInternal(uint256 amount, address cToken) internal {
        uint256 error = CToken(cToken).borrow(amount);
        if(error != 0) revert borrowFailed(amount, cToken);
    }

    function repayBorrowInternal(address underlying, uint256 amount, address cToken) internal {
        IERC20(underlying).approve(cToken, amount);
        uint256 error = CToken(cToken).repayBorrow(amount);
        if(error != 0) revert repayBorrowFailed(amount, cToken);
    }

    function enterMarketInternal(Comptroller comptroller, address cToken) internal {
        address[] memory _addresses = new address[](1);
        _addresses[0] = cToken;
        uint256 status = comptroller.enterMarkets(_addresses)[0];

        if(status != 0) revert enterMarketFailed(cToken);
    }
}
