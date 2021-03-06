const { ethers } = require("ethers");
const abi = require("./abi.json");
const multicallAddress = "0x5ba1e12693dc8f9c48aad8770482f4739beed696";

// set interface
const iface = new ethers.utils.Interface(abi.erc20);

(async () => {
  // set args
  const _provider = new ethers.providers.JsonRpcProvider("https://mainnet.infura.io/v3/858f183c2d0b4483bc6c44cfbd9883bf");
  const _contract = "0xdAC17F958D2ee523a2206206994597C13D831ec7"; // erc20 contract
  const _address = "0xD910F15d5C925Bdbd0733856Cf609fd107f2516e"; // user address

  // interact with multicall contract
  const contract = new ethers.Contract(multicallAddress, abi.multicall, _provider);

  // call multicall
  const response = await contract.callStatic["tryAggregate"](false, [
    {
      target: _contract,
      callData: iface.encodeFunctionData("balanceOf", [_address]),
    },
    {
      target: _contract,
      callData: iface.encodeFunctionData("totalSupply", []),
    },
    {
      target: _contract,
      callData: iface.encodeFunctionData("name", []),
    },
    {
      target: _contract,
      callData: iface.encodeFunctionData("symbol", []),
    },
    {
      target: _contract,
      callData: iface.encodeFunctionData("decimals", []),
    },
  ]);

  // parse response
  const balanceOf = parseNumber(response[0].returnData);
  const totalSupply = parseNumber(response[1].returnData);
  const name = parseString(response[2].returnData);
  const symbol = parseString(response[3].returnData);
  const decimals = parseNumber(response[4].returnData);

  console.log({ balanceOf, totalSupply, name, symbol, decimals });
})();

function parseNumber(_str) {
  try {
    return ethers.BigNumber.from(_str).toString();
  } catch (err) {
    return null;
  }
}

function parseString(_str) {
  try {
    // parse 0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000a5465746865722055534400000000000000000000000000000000000000000000 to 54657468657220555344
    const hex = _str.slice(130).replace(/^0+|0+$/g, "");
    if (hex === "") return null;
    // 54657468657220555344 to Tether USD
    let str = "";
    for (let n = 0; n < hex.length; n += 2) {
      str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
    }
    return str;
  } catch (err) {
    return null;
  }
}
