const JSBI = require("jsbi");

function bn_from_e_notation(numStr) {
  if (typeof numStr != "string") throw("input must be a string!");

  if (!numStr.includes("e")) {
    try {
      return JSBI.BigInt(numStr);
    }catch (e) {
      throw("Bad number string!");
    }
  } else {
      const numStrElements = numStr.split("e");
      if (numStrElements.length != 2) throw("Bad number string input! 0");

      const mantissa = numStrElements[0];
      const exp0 = numStrElements[1];

      var mantissaBN, exp0BN, exp1BN, expBN, result;

      const mantissaElements = mantissa.split(".");

      if (mantissaElements.length == 1) {
        try {
          mantissaBN = JSBI.BigInt(mantissa);
          exp1BN = JSBI.BigInt("0");
        } catch (e) {
          throw("Bad number string input! -1");
        }
      }

      if (mantissaElements.length == 2) {
        if (mantissaElements[0].length == 0 || mantissaElements[1].length == 0) {
          throw("Bad number string input! -2.1");
        }

        try {
          exp1BN = JSBI.BigInt(mantissaElements[1].length);
          mantissaBN = JSBI.BigInt(mantissaElements.join(""));
        } catch (e) {
          throw("Bad number string input! -2");
        }
      }

      exp0BN = JSBI.BigInt(exp0);

      if (JSBI.greaterThanOrEqual(exp0BN, exp1BN)) {
        expBN = JSBI.subtract(exp0BN, exp1BN);
        result = JSBI.multiply(
          mantissaBN,
          JSBI.exponentiate(JSBI.BigInt("10"), expBN)
        )
      } else {
        throw("Integer only!");
      }

      return result;
    }
}

module.exports = {
  e: bn_from_e_notation
}
