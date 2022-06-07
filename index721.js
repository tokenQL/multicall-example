const { ethers } = require("ethers");
const abi = require("./abi.json");
const multicallAddress = "0x5ba1e12693dc8f9c48aad8770482f4739beed696";

// set interface
const iface = new ethers.utils.Interface(abi.erc721);

(async () => {
  // set args
  const _provider = new ethers.providers.JsonRpcProvider("https://mainnet.infura.io/v3/858f183c2d0b4483bc6c44cfbd9883bf");
  const _contract = "0x659a4bdaaacc62d2bd9cb18225d9c89b5b697a5a"; // erc721 contract
  const _tokenId = "1";

  // interact with multicall contract
  const contract = new ethers.Contract(multicallAddress, abi.multicall, _provider);

  // call multicall
  const response = await contract.callStatic["tryAggregate"](false, [
    {
      target: _contract,
      callData: iface.encodeFunctionData("ownerOf", [_tokenId]),
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
      callData: iface.encodeFunctionData("tokenURI", [_tokenId]),
    },
  ]);

  // parse response
  const address = parseAddress(response[0].returnData);
  const name = parseString(response[1].returnData);
  const symbol = parseString(response[2].returnData);
  const tokenURI = parseString(response[3].returnData);

  console.log({ address, name, symbol, tokenURI });
})();

function parseAddress(_str) {
  try {
    return ethers.utils.getAddress("0x" + _str.slice(26));
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
