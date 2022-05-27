const {
  saveObj,
  loadObj,
  clearObj
} = require("../lib/files.js");

var comp_constant;

async function initialize() {
    comp_constant = await loadObj("./test/data", "comp_constant");
}

async function accrueInterest(cToken, signer) {
    const abi = [
        "function accrueInterest() public returns (uint256)"
    ];
    const contract = await new ethers.Contract(cToken, abi, signer);
    return await contract.accrueInterest();
}

async function exchangeRateCurrent(cToken, signer) {
    const abi = [
        "function exchangeRateCurrent() public view returns (uint256)"
    ];
    const contract = await new ethers.Contract(cToken, abi, signer);
    return await contract.exchangeRateCurrent();
}

async function cTokenBalance(cToken, account, signer) {
    const abi = [
      "function balanceOf(address) view returns (uint)"
    ]

    const contract = await new ethers.Contract(cToken, abi, signer);
    return await contract.balanceOf(account);
}

async function totalSupplyAndBorrow(cToken, signer) {
    const abi = [
        "function totalBorrowsCurrent() view returns (uint)",
        "function totalSupply() view returns (uint)",
        "function getCash() view returns (uint)",
        "function totalReserves() view returns (uint)"
    ]

    const contract = await new ethers.Contract(cToken, abi, signer);
    const totalBorrow = await contract.totalBorrowsCurrent();
    const cash = await contract.getCash();
    const totalReserves = await contract.totalReserves();
    const totalSupply = await contract.totalSupply();
    return {
      totalBorrow: totalBorrow, // this is underlying total
      totalSupply: totalSupply //this is cToken total
    }
}

async function compSpeeds(cToken, signer) {
    const abi = [
        "function compSupplySpeeds(address cToken) view returns (uint256)",
        "function compBorrowSpeeds(address cToken) view returns (uint256)"
    ]
    const contract = await new ethers.Contract(comp_constant.Comptroller, abi, signer);
    return {
      compSupplySpeed: await contract.compSupplySpeeds(cToken),
      compBorrowSpeed: await contract.compBorrowSpeeds(cToken)
    }
}

async function supplyBalanceCurrent(underlying, cToken, account, signer) {
    const abi = [
        "function balanceOf(address acc) view returns (uint256)",
        "function decimals() view returns (uint256)"
    ];
    const cTokenC = await new ethers.Contract(cToken, abi, signer);
    const erc20C = await new ethers.Contract(underlying, abi, signer);

    return (await cTokenC.balanceOf(account)) * exchangeRateCurrent(cToken, signer) / 10**erc20C.decimals();
}

async function borrowBalanceCurrent(cToken, account, signer) {
    const abi = [
        "function borrowBalanceCurrent(address account) view returns (uint)"
    ]
    const contract = await new ethers.Contract(cToken, abi, signer);
    return await contract.borrowBalanceCurrent(account);
}

async function supply(underlying, cToken, amount, signer) {
    const abi = [
        "function approve(address to, uint256 amount)",
        "function mint(uint mintAmount)",
        "function enterMarkets(address[] calldata cTokens)",
        "function borrow(uint borrowAmount)"
    ]
    //approve
    const erc20 = await new ethers.Contract(underlying, abi, signer);
    const tx_approve = await erc20.approve(cToken, amount);
    //console.log(`       > erc20.approve ${tx_approve.hash}`);
    //mint
    const cTokenContract = await new ethers.Contract(cToken, abi, signer);
    const tx_mint = await cTokenContract.mint(amount);
    //console.log(`       > tx_mint ${tx_mint.hash}`);
    //enter market
    const comptroller = await new ethers.Contract(comp_constant.Comptroller, abi, signer);
    const tx_enterMarkets = await comptroller.enterMarkets([cToken]);
    //console.log(`       > tx_enterMarkets ${tx_enterMarkets.hash}`);
}

async function borrow(cToken, amount, signer) {
    //borrow
    const abi = [
        "function borrow(uint borrowAmount)"
    ]
    const cTokenContract = await new ethers.Contract(cToken, abi, signer);
    const tx_borrow = await cTokenContract.borrow(amount);
}

module.exports = {
    initialize,
    comp_constant: function() {
        return comp_constant
    },
    accrueInterest,
    exchangeRateCurrent,
    borrowBalanceCurrent,
    supplyBalanceCurrent,
    supply,
    borrow,
    compSpeeds,
    totalSupplyAndBorrow,
    cTokenBalance
}
