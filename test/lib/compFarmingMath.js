const { e } = require("./utils/bn_from_e_notation.js");

var contract;

async function initialize(_contract) {
    contract = _contract;
}

async function getMaxFarmingAccountProfile(account, offset, signer) {
    const currentProfileArray = await contract.getAccountProfile(account);
    const maxFarmingProfileObj = await (async function(){
        const result = await contract.getFarmingAccountProfileByAP(
          currentProfileArray,
          e("0.9e18"),
          offset
        );
        console.log("result", result);
        if(!result[0]) {
            throw("Farming Account not Valid!");
        }

        return AccountProfile(result[1]);
    })();

    return maxFarmingProfileObjl
}

function AccountProfile(array){
    const obj = {};

    obj["supplyAssets"] = SupplyAssetArray(array["supplyAssets"]);
    obj["borrowAssets"] = BorrowAssetArray(array["borrowAssets"]);
    obj["totalSuppliedInUSD_"] = array["totalSuppliedInUSD_"];
    obj["totalBorrowedInUSD_"] = array["totalBorrowedInUSD_"];
    obj["principal_"] = array["principal_"];
    obj["totalCollateralInUSD_"] = array["totalCollateralInUSD_"];
    obj["overallBorrowLimitPCT_"] = array["overallBorrowLimitPCT_"];

    return obj;
}

function AccountProfile_obj2Array(obj){
    var objToConvert;
    for(var i = 0; i < obj.supplyAssets.length; i++){
        objToConvert = obj.supplyAssets[i].asset;
        obj.supplyAssets[i].asset = Object.values(objToConvert);

        objToConvert = obj.supplyAssets[i];
        obj.supplyAssets[i] = Object.values(objToConvert);
    }

    for(var i = 0; i < obj.borrowAssets.length; i++){
        objToConvert = obj.borrowAssets[i].asset;
        obj.borrowAssets[i].asset = Object.values(objToConvert);

        objToConvert = obj.borrowAssets[i];
        obj.borrowAssets[i] = Object.values(objToConvert);
    }

    return Object.values(obj);
}

function SupplyAssetArray(raw_array){
    const result_array = [];

    for(var i = 0; i < raw_array.length; i++){
        result_array.push(SupplyAsset(raw_array[i]));
    }

    return result_array;
}

function BorrowAssetArray(raw_array){
    const result_array = [];

    for(var i = 0; i < raw_array.length; i++){
        result_array.push(BorrowAsset(raw_array[i]));
    }

    return result_array;
}

function SupplyAsset(array){
    const obj = {};

    obj["asset"] = Asset(array["asset"]);
    obj["collateralFactor_"] = array["collateralFactor_"];
    obj["collateralInUSD_"] = array["collateralInUSD_"];

    return obj;
}

function BorrowAsset(array){
    const obj = {};

    obj["asset"] = Asset(array["asset"]);

    return obj;
}

function Asset(array){
    const obj = {};

    obj["cToken"] = array["cToken"];
    obj["amount"] = array["amount"];
    obj["underlyingSymbol_"] = array["underlyingSymbol_"];
    obj["underlyingDecimals_"] = array["underlyingDecimals_"];
    obj["valueInUSD_"] = array["valueInUSD_"];
    obj["compSupplySpeed_"] = array["compSupplySpeed_"];
    obj["compBorrowSpeed_"] = array["compBorrowSpeed_"];
    return obj;
}

function CTokenInterest(array){
    const obj = {};

    obj["cTokenAddr"] = array["cTokenAddr"];
    obj["interestRateMantissa"] = array["interestRateMantissa"];
    obj["balance"] = array["balance"];
    obj["underlyingSymbol_"] = array["underlyingSymbol_"];
    obj["interestInUSD_"] = array["interestInUSD_"];

    return obj;
}

function CTokenInterestArray(raw_array){
    const result_array = [];

    for(var i = 0; i < raw_array.length; i++){
        result_array.push(CTokenInterest(raw_array[i]));
    }

    return result_array;
}

function AccountInterestProfile(array){
    const obj = {};

    obj["supplyInterests"] = CTokenInterestArray(array["supplyInterests"]);
    obj["borrowInterests"] = CTokenInterestArray(array["borrowInterests"]);
    obj["totalInterestInUSD_"] = array["totalInterestInUSD_"];
    obj["isPositiveInterest_"] = array["isPositiveInterest_"];

    return obj;
}

module.exports = {
    address: function() {
        return contract.address;
    },
    contract: function() {
        return contract;
    },
    initialize,
    getMaxFarmingAccountProfile,
    AccountProfile,
    AccountInterestProfile
}
