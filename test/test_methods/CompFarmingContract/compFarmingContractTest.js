const { CompFarmingContractTestEnv } = require("./compFarmingContractTestEnv.js");
const TestDataUtil = require("../common/testDataUtil.js");
const JSBI = require("jsbi");

class CompFarmingContractTest {
  constructor() {
    this.test_env = {};
  }

  async initialize() {
    this.test_env = new CompFarmingContractTestEnv();
    await this.test_env.initialize();
    await TestDataUtil.initialize(this.test_env.signers);
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

  async previewAndFlashloanSuccess(csvName) {
    const testDataSet = await TestDataUtil.getTestData(csvName);
    //await this.test_env.node.takeSnapshot("beforeTesting");
    for(var i = 0; i < testDataSet.length; i++) {
      console.log(`       > ==== test case row ${i+1} ====`);
      //await this.test_env.node.revertToSnapshot("beforeTesting");
      const test_data_row = testDataSet[i];
      if(!test_data_row._on) continue;

      const underlying = test_data_row.underlying;
      const deltaPrincipal = test_data_row.deltaPrincipal;
      const cToken = test_data_row.cToken;
      const deltaBorrowLimitPCT = test_data_row.deltaBorrowLimitPCT;
      const close = test_data_row.close;
      const signer = test_data_row.signer;
      const UserProxy = this.test_env.deployedContractsHelpers.UserProxy;
      const CompFarmingMath = this.test_env.deployedContractsHelpers.CompFarmingMath;
      const Compound = this.test_env.deployedContractsHelpers.Compound;
      const ERC20 = this.test_env.deployedContractsHelpers.ERC20;

      // preview
      const previewResult = await UserProxy.previewAccountProfile(
        CompFarmingMath.address(),
        underlying,
        deltaPrincipal,
        cToken,
        deltaBorrowLimitPCT,
        close
      )
      console.log(`       > previewResult: ${JSON.stringify(previewResult)}`);
      console.log(`        > loan amount: ${previewResult.flashLoanParams.loanAmount}`);
      // approve
      if (deltaPrincipal > 0) {
          const approveTx = await ERC20.approve(
              underlying,
              this.test_env.signers.deployer,
              this.test_env.deployedContracts.userProxy.address,
              deltaPrincipal + 2
          )
          console.log(`       > approveTx: ${approveTx.hash}`);
      }
      // flashloan
      const flashLoanTx = await UserProxy.flashLoan(
        previewResult.flashLoanParams
      );

      //get farming context
      const farmingContext = await CompFarmingMath.contract().getFarmingContext(cToken);
      console.log(`       > farmingContext: ${farmingContext}`);

      const blockNumber0 = await ethers.provider.getBlockNumber();
      console.log(`       > flashLoanTx: ${flashLoanTx.hash} - blockNumber: ${blockNumber0}`);

      // assert - borrowLimitPCT_
      const assertProfileAfter = await CompFarmingMath.contract().getAssetProfile(
        UserProxy.contractProxy().address,
        cToken
      );
      console.log(`        > assertProfileAfter: ${JSON.stringify(assertProfileAfter)}`);
      const actual = {
        borrowLimitPCT_: assertProfileAfter.borrowLimitPCT_.toString(),
        supplyAmt: assertProfileAfter.supply.amount_.toString(),
        borrowAmt: assertProfileAfter.borrow.amount.toString(),
        principal: assertProfileAfter.principal_.toString(),
        compRewardPerBlock: assertProfileAfter.compRewardPerBlock_.toString()
      }

      //await this.test_env.node.mineBlocks(1536 - 2);
      var accuredTx = await Compound.accrueInterest(cToken, signer);

      var assertProfile_xBlocksAfter = await CompFarmingMath.contract().getAssetProfile(
        UserProxy.contractProxy().address,
        cToken
      );
      //accured interest
      const blockNumber1 = await ethers.provider.getBlockNumber();
      console.log(`       > blockNumberDiff: ${blockNumber1 - blockNumber0}`);
      console.log("       > supply.amount: ", assertProfile_xBlocksAfter.supply.amount_.toString());
      console.log("       > borrow.amount: ", assertProfile_xBlocksAfter.borrow.amount.toString());
      console.log("       > assertProfile_xBlocksAfter.borrowLimitPCT_: ", assertProfile_xBlocksAfter.borrowLimitPCT_);

      //test harvest
      await UserProxy.contractProxyForImpl().harvest();
      // check comp balance of the sender
      const comp = this.test_env.constants.comp_constant.Comp.address;
      console.log(`       > comp balance: ${await ERC20.balanceOf(comp, signer.address, signer)}`);
    }
  }


}


module.exports = {
    CompFarmingContractTest
}
