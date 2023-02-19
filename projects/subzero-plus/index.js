const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { stakingUnknownPricedLP, staking } = require("../helper/staking");

const avaxZShare = "0xF5b1A0d66856CBF5627b0105714a7E8a89977349";

const avaxChef = "0xDAccfd92e37be54Ca1A8ff37A7922446614b4759"; // ZShare reward pool
const avaxBoardroom = "0xa252FfDB3A73Bd0F88Eea39658c7C00a281B3bB6"; 

const avaxAbzero = "0xD9Ef0818432b87a17709b62D0cB78a3fEa57Cb00";

const avaxLPs = [
  "0xD1D0340d80bee3c6f90116467a78dC3718121100", // SUB-AVAX LP
  "0xbfE8B1f30035262903927F5BfD65319ef09B48B5", // ZSHARE-SUB LP
];

async function calcPool2(masterchef, lps, block, chain) {
  let balances = {};
  const lpBalances = (
    await sdk.api.abi.multiCall({
      calls: lps.map((p) => ({
        target: p,
        params: masterchef,
      })),
      abi: "erc20:balanceOf",
      block,
      chain,
    })
  ).output;
  let lpPositions = [];
  lpBalances.forEach((p) => {
    lpPositions.push({
      balance: p.output,
      token: p.input.target,
    });
  });
  await unwrapUniswapLPs(
    balances,
    lpPositions,
    block,
    chain,
    (addr) => `${chain}:${addr}`
  );
  return balances;
}

async function avaxPool2(timestamp, block, chainBlocks) {
  return await calcPool2(avaxChef, avaxLPs, chainBlocks.avax, "avax");
}

module.exports = {
  avax: {
    tvl: async () => ({}),
    pool2: avaxPool2,
    staking: staking(avaxBoardroom, avaxZShare, avaxAbzero, "avax"),
  },
};
