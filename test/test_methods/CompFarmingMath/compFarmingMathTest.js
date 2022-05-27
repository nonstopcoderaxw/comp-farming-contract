const JSBI = require("jsbi");
const { MyCompYieldTestEnv } = require("./compFarmingMathTestEnv.js");
const TestDataUtil = require("../common/testDataUtil.js");


class MyCompYieldTest {
  constructor() {
    this.test_env = {};
  }

  async initialize() {
    this.test_env = new MyCompYieldTestEnv();
    await this.test_env.initialize();
    await TestDataUtil.initialize(this.test_env.signers);
  }

  async getCompProfile_success() {
    await this.setup_1();

    const testDataSet = await TestDataUtil.getTestData("success.getCompProfile");
    for(var i = 0; i < testDataSet.length; i++) {
      console.log(`       > ==== test case row ${i} ====`);
      const test_data_row = testDataSet[i];

      if(!test_data_row._on) continue;

      const contract = this.test_env.deployedContracts.myCompYield;
      const compProfile0 = await contract.callStatic.getCompProfile(
        test_data_row.acc
      );
      //mine 1 block
      await this.test_env.node.mineBlocks(1);
      //calculate delta yetToClaim per block
      const compProfile1 = await contract.callStatic.getCompProfile(
        test_data_row.acc
      );
      //compare with matlab's result
      const compPerBlock = JSBI.subtract(
        JSBI.BigInt(compProfile1.yetToClaimed.toString()),
        JSBI.BigInt(compProfile0.yetToClaimed.toString())
      );

      console.log(`       > compPerBlock: ${compPerBlock}`);
    }
  }

  async setup_1() {
    //supply and borrow
    const testDataSet = await TestDataUtil.getTestData("setup.eoaFarming");
    for (var i = 0; i < testDataSet.length; i++) {
      const row = testDataSet[i];
      if (row._on) {
        await this.test_env.deployedContractsHelpers.Compound.supply(
          row.underlying,
          row.cToken,
          row.supply_amount,
          row.signer
        );
        await this.test_env.deployedContractsHelpers.Compound.borrow(
          row.cToken,
          row.borrow_amount,
          row.signer
        );
      }
    }
  }
}

module.exports = {
  MyCompYieldTest
}
