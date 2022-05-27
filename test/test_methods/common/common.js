
const {
  revertToInitalSnapshot
} = require("../../lib/node.js");

const {
  saveObj,
  loadObj,
  clearObj
} = require("../../lib/files.js");

var PATH;

var deployed_contracts = [];

var signers;
var compFarmingContract;
var dydx_constant = {
    SoloMargin: "0x1E0447b19BB6EcFdAe1e4AE1694b0C3659614e4e",
    marketIdsBySymbol: {}
};

var comp_constant = {
    Comptroller: "0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b",
    cDAI:{
        address:  "0x5d3a536e4d6dbd6114cc1ead35777bab948e3643",
        underlying: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        underlying_decimals: 18,
        decimals: 8
    },
    cUSDC: {
        address:  "0x39aa39c021dfbae8fac545936693ac917d5e7563",
        underlying: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        underlying_decimals: 6,
        decimals: 8
    }
};

function initPATH(_path) {
    PATH = _path;
}

async function getMaxFarmingAccountProfile(account, signer) {
    const compFarmingSummary = await load_contract("CompFarmingSummaryV4", signer);
    const currentProfile = await compFarmingSummary.getAccountProfile(account);
    console.log(`       > Info: current comp profile retrieved ${currentProfile}`);
}

async function mint(compFarmingContract, underlying, cToken, amount, from, signer) {

    const approveTx = await approve(
        underlying,
        signer,
        from,
        amount
    );
    console.log(`       > Info: approved! ${approveTx.hash}`);
    const mintTx = await compFarmingContract.mint(
        underlying,
        amount,
        cToken
    );
    console.log(`       > Info: minted! ${mintTx.hash}`);
}

async function approve(token, signer, spender, amount) {
    const abi = [
        "function approve(address spender, uint256 amount)",
    ];
    const contract = await new ethers.Contract(token, abi, signer);
    return await contract.approve(spender, amount);
}

async function delta_balance(token, account, blockNumber0, blockNumber1, signer) {
    const balance0 = await balanceOfWithBlockNumber(blockNumber0, token, account, signer);
    const balance1 = await balanceOfWithBlockNumber(blockNumber1, token, account, signer);

    return balance1 - balance0;
}

async function balanceOf(token, account, signer) {
    const abi = [
        "function balanceOf(address acc) public view returns (uint256)",
    ];
    const contract = await new ethers.Contract(token, abi, signer);
    return await contract.balanceOf(account);
}

async function balanceOfWithBlockNumber(blockNumber, token, account, signer) {
    const abi = [
        "function balanceOf(address acc) public view returns (uint256)",
    ];
    const contract = await new ethers.Contract(token, abi, signer);
    return await contract.balanceOf(account, {
        blockTag: blockNumber
    });
}

async function exchangeRateCurrent(cToken, signer) {
    const abi = [
        "function exchangeRateCurrent() public view returns (uint256)"
    ];
    const contract = await new ethers.Contract(cToken, abi, signer);
    return await contract.exchangeRateCurrent();
}

async function borrowBalanceCurrent(cToken, account, signer) {
    const abi = [
        "function borrowBalanceCurrent(address account) view returns (uint)"
    ]
    const contract = await new ethers.Contract(cToken, abi, signer);
    return await contract.borrowBalanceCurrent(account);
}

async function getMarketIdsBySymbol(loadCached){
    if(loadCached) {
        dydx_constant = await loadObj(PATH, "dydx_constant");
        return dydx_constant;
    }

    const abi = [
        "function getNumMarkets() public view returns (uint256)",
        "function getMarketTokenAddress(uint256 marketId) public view returns (address)"
    ];
    const soloMargin = await new ethers.Contract(dydx_constant.SoloMargin, abi, signers.deployer);
    const numberOfMarkets = parseInt((await soloMargin.getNumMarkets()).toString());

    for(var i = 0; i < numberOfMarkets; i++) {
        const address = await soloMargin.getMarketTokenAddress(i);
        if(address == "0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359") continue;

        const symbol = await (async function(){
            const abi = [
                "function symbol() public view returns (string)"
            ]
            const erc20 = await new ethers.Contract(address, abi, signers.deployer);
            return await erc20.symbol();
        })();
        dydx_constant.marketIdsBySymbol[symbol] = {
            marketId: i,
            address: address
        };
    }

    await saveObj(PATH, "dydx_constant", dydx_constant);
}

async function migrate_contracts() {
    const Flashloan = await ethers.getContractFactory("CompFarmingContract");
    const flashloan = await Flashloan.deploy(
        dydx_constant.SoloMargin,
        comp_constant.Comptroller
    );
    deployed_contracts = await loadObj(PATH, "deployed_contracts");
    for(var i = 0; i < deployed_contracts.length; i++) {
        if(deployed_contracts[i].name == "CompFarmingContract") {
            deployed_contracts.splice(i, i);
        }
    }
    deployed_contracts.push({
        name: "CompFarmingContract",
        address: flashloan.address,
        folder: "CompFarmingContract.sol",
        contract: "CompFarmingContract",
    });
    await saveObj(PATH, "deployed_contracts", deployed_contracts);
    console.log("       > Info: contract deployed at ", flashloan.address);
}

async function getSigners() {
    const _signers = await ethers.getSigners();
    return {
        deployer : _signers[0]
    }
}

async function load_contract(name, signer) {
    deployed_contracts = await loadObj(PATH, "deployed_contracts");
    const signers = await getSigners();
    const address = (function(){
        for(var i = 0; i < deployed_contracts.length; i++) {
            if(deployed_contracts[i].name == name) {
                return deployed_contracts[i].address;
            }
        }
    })();
    return await ethers.getContractAt(name, address, signer);
}

function encodeEnterMaxFarmingPosition(actionType) {
    const abiCoder = new ethers.utils.AbiCoder();
    const encoded = abiCoder.encode(
      [ "tuple(uint256,address,address,uint256,uint256)" ],
      [
        actionType
      ]
    );

    return encoded;
}

module.exports = {
    initPATH,
    deployed_contracts,
    signers,
    compFarmingContract,
    dydx_constant,
    comp_constant,
    approve,
    balanceOf,
    exchangeRateCurrent,
    load_contract,
    getSigners,
    migrate_contracts,
    getMarketIdsBySymbol,
    delta_balance,
    mint,
    borrowBalanceCurrent,
    encodeEnterMaxFarmingPosition,
    getMaxFarmingAccountProfile
}
