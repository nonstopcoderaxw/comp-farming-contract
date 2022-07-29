const { buyERC20ByWithETH } = require("./UniswapV2/UniswapV2.js");
const fs = require("fs");

const addresses = {
    WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
}

const config = {
    testcoin: {
        on: true,
        signer: 19,
        recipients: [
            "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"
        ],
        coins: [
            "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", //weth
            "0x6B175474E89094C44Da98b954EedeAC495271d0F", //dai
            "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" //usdc
        ],
        amounts: [
            100e18,
            100000e18,
            100000e6
        ]
    }
}

main();

async function main() {
    if(await isNodeUp()) {
        await post_process();
    } else {
        //wait 5 seconds
        setTimeout(async function() {
            await main();
        }, 5000);
    }
}

async function post_process() {
    console.log("       > post process started!");
    if(config.testcoin.on) {
      await receiveTestCoins();
      console.log("       > test coins sent!");
    } else {
      console.log("       > test coins disabled!");
    }
    const snapshotId = await takeInitialSnapshot(ethers.provider.connection.url);
    console.log(`       > snapshot taken ${snapshotId["result"]}`);
    await clearDeployedContracts();
}

async function isNodeUp() {
    console.log("> checking node status.....");
    try{
        signers = await ethers.getSigners();
        return true;
    }catch(e) {
        return false;
    }
}

async function receiveTestCoins() {
    const signers = await ethers.getSigners();
    const sender = signers[config.testcoin.signer];

    for(var i = 0; i < config.testcoin.recipients.length; i++) {
        for(var j = 0; j < config.testcoin.coins.length; j++) {
            await buyERC20ByWithETH(
                config.testcoin.coins[j],
                ethers.BigNumber.from(
                    toFullNumberString(config.testcoin.amounts[j])
                ),
                config.testcoin.recipients[i],
                sender
            );
        }
    }
}

function toFullNumberString(number){
    return number.toLocaleString('fullwide', { useGrouping: false });
}

async function takeInitialSnapshot() {
    const snapshotId = await takeSnapshot(ethers.provider.connection.url);
    const snapshotIds = {
        "initial": snapshotId["result"]
    }
    await saveObj("snapshotIds", snapshotIds);

    return snapshotId;
}

async function takeSnapshot(provider_url) {
    const web3 = await init_web3(provider_url);

    return new Promise((resolve, reject) => {
      web3.currentProvider.send({
        jsonrpc: '2.0',
        method: 'evm_snapshot',
        id: new Date().getTime()
      }, (err, snapshotId) => {
        if (err) { return reject(err) }
        return resolve(snapshotId)
      })
    })
}

async function clearDeployedContracts() {
    await fs.promises.writeFile("./test/data/deployed_contracts.json", "[]");
}

async function init_web3(provider_url) {
    return new Web3(new Web3.providers.HttpProvider(provider_url));
}

async function saveObj(objName, obj) {
    await createFile(`./${objName}.json`, JSON.stringify(obj, null, 4));
}

async function createFile(fileName, body){
    await fs.promises.writeFile(fileName, body);
    return true;
}
