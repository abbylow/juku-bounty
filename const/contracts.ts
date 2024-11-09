// coinbase verification
export const coinbaseIndexerContractBaseSepolia = "0xd147a19c3B085Fb9B0c15D2EAAFC6CB086ea849B"
export const coinbaseIndexerContractBase = "0x2c7eE1E5f416dfF40054c27A62f7B357C4E8619C"
export const coinbaseIndexerContract = process.env.NODE_ENV === "production" ? coinbaseIndexerContractBase : coinbaseIndexerContractBaseSepolia

export const easContractBaseSepolia = "0x4200000000000000000000000000000000000021"
export const easContractBase = "0x4200000000000000000000000000000000000021"
export const easContract = process.env.NODE_ENV === "production" ? easContractBase : easContractBaseSepolia

// escrow 
export const escrowContractBaseSepolia = "0x0b61A7d294f21e498f8dcA974e6E9700984fD1E1"
export const escrowContractBase = ""; // TODO: fill this value
export const escrowContract = process.env.NODE_ENV === "production" ? escrowContractBase : escrowContractBaseSepolia

// acceptable currencies
export const usdcBaseSepolia = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
export const usdcBase = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
export const usdc = process.env.NODE_ENV === "production" ? usdcBase : usdcBaseSepolia

export const usdtBaseSepolia = "0x984F01ADdE46264164F6151597c6F14c148bd8CA";
export const usdtBase = "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2";
export const usdt = process.env.NODE_ENV === "production" ? usdtBase : usdtBaseSepolia

export const tokenAddressToTokenNameMapping = {
  [usdc]: "USDC",
  [usdt]: "USDT"
}