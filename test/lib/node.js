const fs = require("fs");
const {
  saveObj,
  loadObj,
  clearObj,
} = require("./files.js");

const EvmTimeTravel = require("./evmTimeTravel.js");

async function loadSnapshotIds() {
    snapshotIds = await loadObj("./", "snapshotIds");

    return snapshotIds;
}

async function saveSnapshotIds(snapshotIds) {
    await saveObj("./", "snapshotIds", snapshotIds);
}

async function takeSnapshot(name) {
    if(!web3) web3 = await init_web3();

    EvmTimeTravel.initialize(web3);

    const snapshotIds = await loadSnapshotIds();
    if(!snapshotIds) snapshotIds = {};

    snapshotIds[name] = await (async function(){
        const snapshot = await EvmTimeTravel.takeSnapshot();
        return snapshot["result"];
    })();

    await saveSnapshotIds(snapshotIds);
}

async function revertToSnapshot(name) {
    if(!web3) web3 = await init_web3();

    EvmTimeTravel.initialize(web3);
    snapshotIds = await loadSnapshotIds();
    const snapshotId = snapshotIds[name];
    const result = await EvmTimeTravel.revertToSnapshot(snapshotId);
    if(result.error) {
        throw(`no evm snapshot found! #${snapshotId}`);
    }
    console.log(`       > revert to snapshot ${name}`);
    await takeSnapshot(name);
}

async function revertToInitalSnapshot(provider_url) {
    if(!web3) web3 = await init_web3(provider_url);

    EvmTimeTravel.initialize(web3);
    const initialSnapshotId = (await loadSnapshotIds())["initial"];
    await EvmTimeTravel.revertToSnapshot(initialSnapshotId);
    console.log(`       > revert to snapshot ${initialSnapshotId}`);
    await takeSnapshot("initial");
}

async function init_web3(provider_url) {
    return new Web3(new Web3.providers.HttpProvider(provider_url));
}

async function mineBlocks(num) {
    while (num > 0) {
      num--;
      await hre.network.provider.request({
        method: "evm_mine",
        params: [],
      });
    }
}

module.exports = {
    saveObj,
    loadObj,
    clearObj,
    takeSnapshot,
    revertToSnapshot,
    revertToInitalSnapshot,
    mineBlocks
}
