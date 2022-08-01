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

async function impersonate(acc) {
  await ethers.provider.send('hardhat_impersonateAccount', [acc]);
  const iSigner = await ethers.provider.getSigner(acc);
  return iSigner;
}

async function replicateBlock(blockNumber, offset, skipFailedTx, targetTx, skipTxIndexList) {
  //turn mining off
  await network.provider.send("evm_setAutomine", [ false ]);

  const mainnet = await new ethers.providers.JsonRpcProvider(process.env.achieveNode);
  const mTxs = (await mainnet.getBlockWithTransactions(blockNumber)).transactions;
  console.log("mTxs.length:", mTxs.length);
  console.log("targetTx index: ", (await mainnet.getTransactionReceipt(targetTx)).transactionIndex);

  for(var i = offset; i < mTxs.length; i++) {
    const tx = mTxs[i];
    console.log("index: ", tx.transactionIndex);
    console.log("tx: ", tx.hash);

    const status = (await mainnet.getTransactionReceipt(tx.hash)).status;
    console.log("status: ", status);
    if(skipTxIndexList.includes(tx.transactionIndex) || skipFailedTx && status == 0 && tx.hash != targetTx) continue;

    if(tx.data == "0x") continue;
    const rTx = await replicateTx(tx.hash);
    console.log("block number: ", await ethers.provider.getBlockNumber());
    console.log("=======Success Above!======");
    if(tx.hash == targetTx) break;
  }

  //mine 1 block
  await mineBlocks(1);
}

async function replicateTx(txHash) {

  // get tx details from mainnet
  const mainnet = await new ethers.providers.JsonRpcProvider(process.env.achieveNode);
  const mtx = await mainnet.getTransaction(txHash);
  console.log("mainnet tx hash", mtx.hash);
  // impersonate
  const iSigner = await impersonate(mtx.from);
  // send
  const tx = await iSigner.sendTransaction({
    to: mtx.to,
    data: mtx.data,
    nonce: mtx.nonce,
    value: mtx.value,
    accessList: mtx.accessList,
    type: mtx.type,
    chainId: mtx.chainId,
    gasLimit: mtx.gasLimit,
    //maxFeePerGas: mtx.maxFeePerGas,
    //maxPriorityFeePerGas: mtx.maxPriorityFeePerGas
    //gasPrice: mtx.gasPrice
  });
  console.log("replayed tx hash", tx.hash);
  return tx;
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
    mineBlocks,
    impersonate,
    replicateBlock,
    replicateTx
}
