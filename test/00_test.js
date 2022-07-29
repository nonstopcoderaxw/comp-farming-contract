return;

//note: forked mainnet required to run the script
const {
  revertToInitalSnapshot
} = require("./lib/node.js");

const provider_url = ethers.provider.connection.url;
var test;

describe("comp-farming-contract testcase set 1", function () {
    beforeEach(async function() {
        const { CompFarmingContractTest } = require("./test_methods/CompFarmingContract/compFarmingContractTest.js");
        test = new CompFarmingContractTest();
        await revertToInitalSnapshot(provider_url);
        await test.initialize();
        console.log("       > beforeEach done!");
    })
    /*****/
    it.skip("#redeploy", async function(){})
    /*****/
    it("#previewAndFlashloan; harvest, replay attack", async function(){
        await test.previewAndFlashloanSuccess("success.previewAndFlashloan");
    })
})
