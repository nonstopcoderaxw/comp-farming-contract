const {
  saveObj,
  loadObj,
  clearObj
} = require("./files.js");

async function save_deployed_contracts(deployedContractName, address, folder, contractName) {
    const deployed_contracts = await load_deployed_contracts();
    for(var i = 0; i < deployed_contracts.length; i++) {
        if(deployed_contracts[i].deployedContractName == deployedContractName) {
            deployed_contracts.splice(i, 1);
        }
    }
    deployed_contracts.push({
        deployedContractName: deployedContractName,
        address: address,
        folder: folder,
        contractName: contractName,
    });
    await saveObj("./test/data", "deployed_contracts", deployed_contracts);
}

async function load_deployed_contracts() {
    return loadObj("./test/data", "deployed_contracts");
}

async function load_contract(name, signer) {
    const deployed_contracts = await load_deployed_contracts();
    const address = (function(){
        for(var i = 0; i < deployed_contracts.length; i++) {
            if(deployed_contracts[i].deployedContractName == name) {
                return deployed_contracts[i].address;
            }
        }
    })();
    return await ethers.getContractAt(name, address, signer);
}

module.exports = {
    load_deployed_contracts,
    save_deployed_contracts,
    load_contract
}
