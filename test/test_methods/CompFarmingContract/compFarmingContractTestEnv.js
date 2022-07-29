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

const Dydx = require("../../lib/dydx.js");
const Deployed_Contracts = require("../../lib/deployedContracts.js");
const Compound = require("../../lib/compound.js");
const CompFarmingMath = require("../../lib/compFarmingMath.js");
const ERC20 = require("../../lib/erc20.js");
const UserProxy = require("../../lib/userProxy.js");

class CompFarmingContractTestEnv {
  constructor() {
    this.deployedContracts = {
      compFarmingMath: {},
      userProxyFactory: {},
      userProxy: {}
    };
    this.deployedContractsHelpers = {
      Deployed_Contracts: Deployed_Contracts,
      Compound: Compound,
      CompFarmingMath: CompFarmingMath,
      ERC20: ERC20,
      UserProxy: UserProxy
    };
    this.constants = {
      comp_constant: {},
      dydx_constant: {}
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
    this.constants.comp_constant = await this.deployedContractsHelpers.Compound.comp_constant();
    await Dydx.initialize(this.signers.deployer);
    this.constants.dydx_constant = Dydx.dydx_constant();
    await this.migrate_contracts();
    this.deployedContracts.compFarmingMath = await load_contract("CompFarmingMath", this.signers.deployer);
    await this.deployedContractsHelpers.CompFarmingMath.initialize(this.deployedContracts.compFarmingMath);
    this.deployedContracts.userProxyFactory = await load_contract("UserProxyFactory", this.signers.deployer);
    await this.createUserProxy();
    this.deployedContracts.userProxy = await load_contract("UserProxy", this.signers.deployer);
    await this.deployedContractsHelpers.UserProxy.initialize(this.deployedContracts.userProxy);
  }

  async getSigners() {
    const _signers = await ethers.getSigners();
    const obj = {
        deployer : _signers[0],
        vaultUser1: _signers[1]
    };
    return obj;
  }

  async migrate_contracts() {
    await this.migrate_CompFarmingMath();
    const deployed_compFarmingContract = await this.migrate_CompFarmingContract();
    await this.migrate_UserProxyFactory(deployed_compFarmingContract, Dydx.dydx_constant().SoloMargin);
  }

  async migrate_UserProxyFactory(compFarmingContract, fallbackUser) {
    const UserProxyFactory = await ethers.getContractFactory("UserProxyFactory");
    const userProxyFactory = await UserProxyFactory.deploy(compFarmingContract, fallbackUser);
    await Deployed_Contracts.save_deployed_contracts(
        "UserProxyFactory",
        userProxyFactory.address,
        "UserProxyFactory.sol",
        "UserProxyFactory"
    );
    console.log("         > Info: UserProxyFactory deployed at ", userProxyFactory.address);

    return userProxyFactory.address;
  }

  async migrate_CompFarmingContract() {
    const CompFarmingContract = await ethers.getContractFactory("CompFarmingContract");
    const compFarmingContract = await CompFarmingContract.deploy();
    await Deployed_Contracts.save_deployed_contracts(
        "CompFarmingContract",
        compFarmingContract.address,
        "CompFarmingContract.sol",
        "CompFarmingContract"
    );

    console.log("       > Info: CompFarmingContract deployed at ", compFarmingContract.address);

    return compFarmingContract.address;
  }

  async migrate_CompFarmingMath() {
    const name = "CompFarmingMath";
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

  async createUserProxy() {
    const createUserProxyTx = await this.deployedContracts.userProxyFactory.createUserProxy();
    console.log(`       > createUserProxy done! ${createUserProxyTx.hash}`);
    const userProxy = await this.deployedContracts.userProxyFactory.proxy_to_user(this.signers.deployer.address);
    console.log(`       > User proxy address ${userProxy}`);
    await Deployed_Contracts.save_deployed_contracts(
        "UserProxy",
        userProxy,
        "UserProxy.sol",
        "UserProxy"
    );
    return userProxy;
  }
}


module.exports = {
  CompFarmingContractTestEnv
}
