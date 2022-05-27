const {
  saveObj,
  loadObj,
  clearObj
} = require("./files.js");

var dydx_constant;

async function initialize(signer) {
    dydx_constant = await loadObj("./test/data", "dydx_constant");
    //await init_dydx_constant(signer);
}

async function init_dydx_constant(signer){

    const abi = [
        "function getNumMarkets() public view returns (uint256)",
        "function getMarketTokenAddress(uint256 marketId) public view returns (address)"
    ];
    const soloMargin = await new ethers.Contract(dydx_constant.SoloMargin, abi, signer);
    const numberOfMarkets = parseInt((await soloMargin.getNumMarkets()).toString());

    for(var i = 0; i < numberOfMarkets; i++) {
        const address = await soloMargin.getMarketTokenAddress(i);
        if(address == "0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359") continue;

        dydx_constant.marketIds[address] = {
            marketId: i,
            address: address
        };
    }

    await saveObj("./test/data", "dydx_constant", dydx_constant);
}

module.exports = {
    initialize,
    dydx_constant: function(){
        return dydx_constant
    }
}
