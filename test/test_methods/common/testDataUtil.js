const { e } = require("../../lib/utils/bn_from_e_notation.js");
const { saveObj } = require("../../lib/files.js");

var comp_constant = require("../../data/comp_constant.json");
const csvToJson = require('convert-csv-to-json');
const compAddressDef = [ "underlying" ];
const numberDef = [ "cToken", "deltaBorrowLimitPCT", "offset" ];
const boolDef = [ "close" ];

var folder = "./test/data/csv/";

var signers;

async function initialize(_signers) {
  signers = _signers;
}

async function play() {
  folder = "../data/csv/";
  console.log(await getTestData("success.previewAndFlashloan"));
}

async function getTestData(key) {
  const jsonArray = await csvToJSONArray(folder, key);
  if (!jsonArray) throw ("parsed csv is empty");
  const formatted = await format(jsonArray.headers, jsonArray.data);

  await saveObj("./test/data/testdatajson", key, formatted);

  return formatted;
}

async function csvToJSONArray(folder, csvFileName) {
  const path = `${folder}${csvFileName}.csv`;
  const data = csvToJson.parseSubArray("*", ";").fieldDelimiter(',').getJsonFromCsv(path);

  if (data.length > 0) {
    const headers = Object.keys(data[0]);

    return {
      headers: headers,
      data: data
    }
  }

  return null;
}

async function format(headers, data) {
  for (var i = 0; i < data.length; i++) {
    for (var j = 0; j < headers.length; j++) {
      const dataRow = data[i];
      const header = headers[j];
      const headerSplits = header.split(".");
      if(header.length == 0) continue;
      if (headerSplits.length != 2) throw ("csv header format error!");

      const key = headerSplits[0];
      const ty = headerSplits[1];

      if (ty == "a") data[i][key] = await compAddress(dataRow[header]);
      if (ty == "n") data[i][key] = await number(dataRow[header]);
      if (ty == "b") data[i][key] = await bool(dataRow[header]);
      if (ty == "ua") data[i][key] = await user(dataRow[header]);
      if (ty == "sr") data[i][key] = await signer(dataRow[header]);
      if (ty == "l<n>") data[i][key] = await listOfNumber(dataRow[header]);
      if (ty == "l<s>") data[i][key] = await listOfString(dataRow[header]);

    }
  }

  return data;
}

async function user(value) {
  if(!value) return null;
  return signers[value].address;
}

async function signer(value) {
  if(!value) return null;
  return signers[value];
}

async function compAddress(value) {
  if(!value) return null;

  const params = value.split(".");
  return comp_constant[params[0]][params[1]];
}

async function number(value) {
  if(!value) return null;

  return e(value).toString();
}

async function bool(value) {
  if(!value) return null;

  //if (value != "true" && value != "false") throw ("bool parse error!");

  return value == "true" ? true : false;
}

async function listOfNumber(value) {
  if(!value) return null;

  for (var i = 0; i < value.length; i++) {
    value[i] = e(value[i].trim()).toString();
  }

  return value;
}

async function listOfString(value) {
  if(!value) return null;

  for (var i = 0; i < value.length; i++) {
    value[i] = value[i].trim();
  }

  return value;
}

module.exports = {
    initialize,
    getTestData
}
