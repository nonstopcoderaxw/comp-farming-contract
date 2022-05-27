const { approve } = require("./erc20.js");

var contractProxy;
var contractImpl;

async function initialize(_contract) {
    contractProxy = _contract;
    contractImpl = await ethers.getContractAt("CompFarmingContract", _contract.address, _contract.signer);
}

async function depositAndMint(comptroller, underlying, cToken, amount, spender, signer) {
    const approveTx = await approve(
        underlying,
        signer,
        spender,
        amount
    );
    console.log(`       > Info: approved! ${approveTx.hash}`);
    const abi = [
        "function deposit(address underlying, uint256 amount)",
        "function mint(address comptroller, address underlying, uint256 amount, address cToken)",
    ]
    const interface = new ethers.utils.Interface(abi);
    const depositData = interface.encodeFunctionData("deposit", [
        underlying,
        amount
    ]);
    const mintData = interface.encodeFunctionData("mint", [
        comptroller,
        underlying,
        amount,
        cToken
    ]);

    const executeTx = await contractProxy.write([ depositData, mintData ]);

    return executeTx;
}

async function redeemAndWithdraw(underlying, cToken, amount) {
    const abi = [
        "function redeem(uint256 amount, address cToken)",
        "function withdraw(address underlying, uint256 amount)",
    ]
    const interface = new ethers.utils.Interface(abi);
    const redeemData = interface.encodeFunctionData("redeem", [
        amount,
        cToken
    ])
    const withdrawData = interface.encodeFunctionData("withdraw", [
        underlying,
        amount
    ])
    const executeTx = await contract.write([ redeemData, withdrawData ]);

    return executeTx;
}

async function borrowAndRepayBorrow(underlying, cToken, amount) {
    const abi = [
        "function borrow(uint256 amount, address cToken)",
        "function repayBorrow(address underlying, uint256 amount, address cToken)",
    ]
    const interface = new ethers.utils.Interface(abi);
    const borrowData = interface.encodeFunctionData("borrow", [
        amount,
        cToken
    ])
    const repayBorrowData = interface.encodeFunctionData("repayBorrow", [
        underlying,
        amount,
        cToken
    ])
    const executeTx = await contract.write([ borrowData, repayBorrowData ]);

    return executeTx;
}

async function previewAccountProfile(myCompYield_addr, underlying, deltaPrincipal, cToken, borrow_limit_pct, close) {
    const previewAccountProfileReturn = await contractImpl.previewAccountProfile(
        myCompYield_addr,
        underlying,
        deltaPrincipal,
        cToken,
        borrow_limit_pct,
        close
    );

    return previewAccountProfileReturn;
}

async function flashLoan(flashLoanParams) {
    const abi = [
        "function flashLoan(tuple(uint256,uint256,uint256,bytes))",
    ]
    const interface = new ethers.utils.Interface(abi);
    const flashLoanData = interface.encodeFunctionData("flashLoan", [
        flashLoanParams
    ])
    const executeTx = await contractProxy.write([ flashLoanData ]);

    return executeTx;
}

function FlashLoanParams(array){
    const obj = {};
    obj["marketId"] = array["marketId"];
    obj["loanAmount"] = array["loanAmount"];
    obj["actionData"] = array["actionData"];
    obj["dydx_soloMargin"] = array["dydx_soloMargin"];

    return obj;
}


module.exports = {
    address: function() {
        return contractProxy.address;
    },
    contractProxy: function() {
        return contractProxy;
    },
    contractProxyForImpl: function() {
        return contractImpl;
    },
    initialize,
    depositAndMint,
    redeemAndWithdraw,
    borrowAndRepayBorrow,
    FlashLoanParams,
    previewAccountProfile,
    flashLoan
}
