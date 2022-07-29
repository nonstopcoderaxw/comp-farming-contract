const provider = new ethers.providers.Web3Provider(
  window.ethereum,
  "any"
);
// 15216912
// 15216746
// 15216732
// 15216719
// 15216707
const blockTag = "latest";

const lensAddr = "0xd513d22422a3062Bd342Ae374b4b9c20E0a9a074";
const compAddr = "0xc00e94Cb662C3520282E6f5717214004A7f26888";
const comptrollerAddr = "0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B";
///mainnet
const impl = "0x9f2adedc1fc5a707480e2e1397694fa930a6bede";
const userProxy = "0x9c075138f684fd895cad7230573339b9dfcd8d6a";
const compoundMath = "0x8d74c064dfb0ad8225f942728b046d820623b6a1";

//hardhat
// const impl = "0x547382C0D1b23f707918D3c83A77317B71Aa8470";
// const userProxy = "0xe0DBBC30fF97C8034f0ca48c6606B025076ADaD9";
// const compoundMath = "0x22a9B82A6c3D2BFB68F324B2e8367f346Dd6f32a";


const implABI = [{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"address","name":"cToken","type":"address"}],"name":"borrowFailed","type":"error"},{"inputs":[],"name":"deltaHasToBeSameDirection","type":"error"},{"inputs":[],"name":"deltasCanBeAllZero","type":"error"},{"inputs":[{"internalType":"address","name":"cToken","type":"address"}],"name":"enterMarketFailed","type":"error"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"invaidFarmingAccount","type":"error"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"numberTooBig","type":"error"},{"inputs":[],"name":"positionAlreadyClosed","type":"error"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"redeemAllFailed","type":"error"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"redeemUnderlyingFailed","type":"error"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"address","name":"cToken","type":"address"}],"name":"repayBorrowFailed","type":"error"},{"inputs":[{"internalType":"uint256","name":"balance","type":"uint256"}],"name":"repayFlashLoanFailed","type":"error"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"components":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint256","name":"number","type":"uint256"}],"internalType":"struct Account.Info","name":"","type":"tuple"},{"internalType":"bytes","name":"actionData","type":"bytes"}],"name":"callFunction","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"internalType":"uint256","name":"marketId","type":"uint256"},{"internalType":"uint256","name":"loanAmount","type":"uint256"},{"internalType":"uint256","name":"loanFees","type":"uint256"},{"internalType":"bytes","name":"actionData","type":"bytes"}],"internalType":"struct CompFarmingContract.FlashLoanParams","name":"params","type":"tuple"}],"name":"flashLoan","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"harvest","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract ICompFarmingMath","name":"compFarmingMath","type":"address"},{"internalType":"address","name":"underlying","type":"address"},{"internalType":"int256","name":"deltaPrincipal","type":"int256"},{"internalType":"address","name":"cToken","type":"address"},{"internalType":"int256","name":"deltaBorrowLimitPCT","type":"int256"},{"internalType":"bool","name":"closePosition","type":"bool"}],"name":"previewAccountProfile","outputs":[{"components":[{"components":[{"internalType":"uint256","name":"marketId","type":"uint256"},{"internalType":"uint256","name":"loanAmount","type":"uint256"},{"internalType":"uint256","name":"loanFees","type":"uint256"},{"internalType":"bytes","name":"actionData","type":"bytes"}],"internalType":"struct CompFarmingContract.FlashLoanParams","name":"flashLoanParams","type":"tuple"}],"internalType":"struct CompFarmingContract.PreviewAccountProfileReturn","name":"r","type":"tuple"}],"stateMutability":"view","type":"function"}];
const userProxyABI = [{"inputs":[{"internalType":"address","name":"_target","type":"address"},{"internalType":"address","name":"_owner","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"onlyOwnerAllowed","type":"error"},{"stateMutability":"nonpayable","type":"fallback"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"setOwner","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newTarget","type":"address"}],"name":"setTarget","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"target","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes[]","name":"data","type":"bytes[]"}],"name":"write","outputs":[{"internalType":"bytes[]","name":"results","type":"bytes[]"}],"stateMutability":"nonpayable","type":"function"}];
const compoundMathABI = [{"inputs":[],"name":"borrowLimitPCTLessThanZero","type":"error"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"borrowLimitPCTOver100PCT","type":"error"},{"inputs":[{"internalType":"int256","name":"","type":"int256"}],"name":"deltaPrincipalTooBig","type":"error"},{"inputs":[{"components":[{"components":[{"internalType":"uint256","name":"cTokenAmt","type":"uint256"},{"internalType":"uint256","name":"amount_","type":"uint256"},{"internalType":"uint256","name":"exchangeRate_","type":"uint256"},{"internalType":"uint256","name":"collateralFactor_","type":"uint256"},{"internalType":"uint256","name":"compSupplySpeed_","type":"uint256"}],"internalType":"struct AccountProfileLib.Supply","name":"supply","type":"tuple"},{"components":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"compBorrowSpeed_","type":"uint256"}],"internalType":"struct AccountProfileLib.Borrow","name":"borrow","type":"tuple"},{"components":[{"internalType":"address","name":"cToken","type":"address"},{"internalType":"uint256","name":"underlyingDecimals_","type":"uint256"}],"internalType":"struct AccountProfileLib.Asset","name":"asset","type":"tuple"},{"internalType":"uint256","name":"principal_","type":"uint256"},{"internalType":"uint256","name":"borrowLimitPCT_","type":"uint256"},{"internalType":"uint256","name":"compRewardPerBlock_","type":"uint256"}],"internalType":"struct AccountProfileLib.AssetProfile","name":"p","type":"tuple"},{"internalType":"int256","name":"deltaPrincipal","type":"int256"},{"internalType":"int256","name":"deltaBorrowLimitPCT","type":"int256"}],"name":"computeAssetProfile","outputs":[{"components":[{"components":[{"internalType":"uint256","name":"cTokenAmt","type":"uint256"},{"internalType":"uint256","name":"amount_","type":"uint256"},{"internalType":"uint256","name":"exchangeRate_","type":"uint256"},{"internalType":"uint256","name":"collateralFactor_","type":"uint256"},{"internalType":"uint256","name":"compSupplySpeed_","type":"uint256"}],"internalType":"struct AccountProfileLib.Supply","name":"supply","type":"tuple"},{"components":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"compBorrowSpeed_","type":"uint256"}],"internalType":"struct AccountProfileLib.Borrow","name":"borrow","type":"tuple"},{"components":[{"internalType":"address","name":"cToken","type":"address"},{"internalType":"uint256","name":"underlyingDecimals_","type":"uint256"}],"internalType":"struct AccountProfileLib.Asset","name":"asset","type":"tuple"},{"internalType":"uint256","name":"principal_","type":"uint256"},{"internalType":"uint256","name":"borrowLimitPCT_","type":"uint256"},{"internalType":"uint256","name":"compRewardPerBlock_","type":"uint256"}],"internalType":"struct AccountProfileLib.AssetProfile","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"acc","type":"address"},{"internalType":"address","name":"cToken","type":"address"}],"name":"getAssetProfile","outputs":[{"components":[{"components":[{"internalType":"uint256","name":"cTokenAmt","type":"uint256"},{"internalType":"uint256","name":"amount_","type":"uint256"},{"internalType":"uint256","name":"exchangeRate_","type":"uint256"},{"internalType":"uint256","name":"collateralFactor_","type":"uint256"},{"internalType":"uint256","name":"compSupplySpeed_","type":"uint256"}],"internalType":"struct AccountProfileLib.Supply","name":"supply","type":"tuple"},{"components":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"compBorrowSpeed_","type":"uint256"}],"internalType":"struct AccountProfileLib.Borrow","name":"borrow","type":"tuple"},{"components":[{"internalType":"address","name":"cToken","type":"address"},{"internalType":"uint256","name":"underlyingDecimals_","type":"uint256"}],"internalType":"struct AccountProfileLib.Asset","name":"asset","type":"tuple"},{"internalType":"uint256","name":"principal_","type":"uint256"},{"internalType":"uint256","name":"borrowLimitPCT_","type":"uint256"},{"internalType":"uint256","name":"compRewardPerBlock_","type":"uint256"}],"internalType":"struct AccountProfileLib.AssetProfile","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"cToken","type":"address"}],"name":"getFarmingContext","outputs":[{"internalType":"uint256","name":"blockNumber","type":"uint256"},{"internalType":"uint256","name":"rate_u","type":"uint256"},{"internalType":"uint256","name":"k","type":"uint256"},{"internalType":"uint256","name":"rate_mul","type":"uint256"},{"internalType":"uint256","name":"rate_base","type":"uint256"},{"internalType":"uint256","name":"f_reserve","type":"uint256"},{"internalType":"uint256","name":"f_c","type":"uint256"},{"internalType":"uint256","name":"rate_jump","type":"uint256"},{"internalType":"uint256","name":"compSupplySpeed","type":"uint256"},{"internalType":"uint256","name":"compBorrowSpeed","type":"uint256"}],"stateMutability":"view","type":"function"}]

var signer;

var signerAddress;
(async function () {
  await provider.send("eth_requestAccounts", []);
  signer = provider.getSigner();
  signerAddress = await signer.getAddress();
  console.log("signerAddress", signerAddress);

})();

// usdc: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
async function UIApprove() {
  const token = document.getElementById("erc20ToApprove").value;
  const spender = userProxy;
  const amount = ethers.constants.MaxUint256;
  const tx = await approve(token, signer, spender, amount);
  console.log("erc20 approve tx: ", tx.hash);
}

// underlying: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
// deltaPrincipal: 100000000 -  100 usdc
// cToken: 0x39aa39c021dfbae8fac545936693ac917d5e7563
// deltaBorrowLimitPCT: 990000000000000000 - 99%
// close: false
async function UIFarming() {
  const underlying = document.getElementById("underlying").value;
  const deltaPrincipal = ethers.BigNumber.from(JSON.parse(JSON.stringify(ethers.BigNumber.from(document.getElementById("deltaPrincipal").value.toString()))));
  const cToken = document.getElementById("cToken").value;
  const deltaBorrowLimitPCT = ethers.BigNumber.from(JSON.parse(JSON.stringify(ethers.BigNumber.from(document.getElementById("deltaBorrowLimitPCT").value.toString()))))
  const close = document.getElementById("close").checked;

  const previewResult = await previewAccountProfile(
    compoundMath,
    underlying,
    deltaPrincipal,
    cToken,
    deltaBorrowLimitPCT,
    close
  );
  console.log(`       > previewResult: ${JSON.stringify(previewResult)}`);
  console.log(previewResult.flashLoanParams);
  const flashLoanTx = await flashLoan(
    previewResult.flashLoanParams
  );
  console.log("flashLoanTx: ", flashLoanTx.hash);
}

async function UICheck() {
  const cToken = document.getElementById("cTokenToCheck").value;
  document.getElementById("UserProxyAddr").innerText = userProxy;
  document.getElementById("UnclaimedComp").innerText = await totalCompBalance();
  const assetProfile = await getAssetProfile();
  document.getElementById("Principal").innerText = assetProfile.principal_;
  document.getElementById("PercentageOfBorrowLimit").innerText = assetProfile.borrowLimitPCT_;

}

async function getAssetProfile() {
  const compFarmingMath = await new ethers.Contract(compoundMath, compoundMathABI, signer);
  const assetProfile = await compFarmingMath.getAssetProfile(
    userProxy,
    "0x39aa39c021dfbae8fac545936693ac917d5e7563",
    { blockTag }
  );

  return assetProfile;
}


async function approve(token, signer, spender, amount) {
    const abi = [
        "function approve(address spender, uint256 amount)",
    ];
    const contract = await new ethers.Contract(token, abi, signer);
    return await contract.approve(spender, amount);
}

async function previewAccountProfile(myCompYield_addr, underlying, deltaPrincipal, cToken, borrow_limit_pct, close) {
    const contractImpl = await new ethers.Contract(userProxy, implABI, signer);
    const previewAccountProfileReturn = await contractImpl.previewAccountProfile(
        myCompYield_addr,
        underlying,
        deltaPrincipal,
        cToken,
        borrow_limit_pct,
        close
    );

    return previewAccountProfileReturn;
}

async function flashLoan(flashLoanParams) {

    const contractProxy = await new ethers.Contract(userProxy, userProxyABI, signer);
    const interface = new ethers.utils.Interface(implABI);
    const flashLoanData = interface.encodeFunctionData("flashLoan", [
        flashLoanParams
    ])
    const executeTx = await contractProxy.write([ flashLoanData ]);

    return executeTx;
}

//unclaimed + account balance
async function totalCompBalance() {
  const result = (await (await new ethers.Contract(lensAddr, [ "function getCompBalanceMetadataExt(address,address,address) view returns(tuple(uint256,uint256,address,uint256 allocated))" ], signer)).getCompBalanceMetadataExt(compAddr, comptrollerAddr, userProxy)).allocated;
  console.log("totalCompBalance:", totalCompBalance);
  return result;
}
