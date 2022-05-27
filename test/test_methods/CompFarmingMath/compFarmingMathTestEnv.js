const {
  saveObj,
  loadObj,
  clearObj
} = require("../../lib/files.js");

const {
   load_contract
} = require("../../lib/deployedContracts.js");

const {
    revertToSnapshot,
    takeSnapshot,
    mineBlocks
} = require("../../lib/node.js");

const Deployed_Contracts = require("../../lib/deployedContracts.js");
const Compound = require("../../lib/compound.js");
const MyCompYield = require("../../lib/compFarmingMath.js");
const ERC20 = require("../../lib/erc20.js");


class MyCompYieldTestEnv {
  constructor() {
    this.deployedContracts = {
      myCompYield: {}
    };
    this.deployedContractsHelpers = {
      Deployed_Contracts: Deployed_Contracts,
      Compound: Compound,
      ERC20: ERC20,
      MyCompYield: MyCompYield
    };
    this.constants = {
      comp_constant: {}
    };
    this.signers = {};
    this.node = {
      revertToSnapshot,
      takeSnapshot,
      mineBlocks
    }
  }

  async initialize() {
    this.signers = await this.getSigners();
    await this.deployedContractsHelpers.Compound.initialize();
    this.deployedContracts.myCompYield = await load_contract("MyCompYield", this.signers.deployer);
    await this.deployedContractsHelpers.MyCompYield.initialize(this.deployedContracts.myCompYield);
    this.constants.comp_constant = await this.deployedContractsHelpers.Compound.comp_constant();
    await this.migrate_contracts();
    this.deployedContracts.myCompYield = await load_contract("MyCompYield", this.signers.deployer);
  }

  async getSigners() {
    const _signers = await ethers.getSigners();
    const obj = {
        deployer : _signers[0]
    };
    return obj;
  }

  async migrate_contracts() {
    await this.migrate_MyCompYield();
  }


  async migrate_MyCompYield() {
    const name = "MyCompYield";
    const deployed = await (await ethers.getContractFactory(name)).deploy();
    const deployedAddress = deployed.address;
    const abiFolder = `${name}.sol`;
    const instanceName = name;

    console.log(`     > ${name} deployed at `, deployedAddress);

    await Deployed_Contracts.save_deployed_contracts(
      name,
      deployedAddress,
      abiFolder,
      instanceName
    );

    return deployedAddress;
  }
}

module.exports = {
  MyCompYieldTestEnv
}
