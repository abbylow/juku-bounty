// coinbase verification
export const coinbaseIndexerContractBaseSepolia = "0xd147a19c3B085Fb9B0c15D2EAAFC6CB086ea849B"
export const coinbaseIndexerContractBase = "0x2c7eE1E5f416dfF40054c27A62f7B357C4E8619C"
export const coinbaseIndexerContract = process.env.NODE_ENV === "production" ? coinbaseIndexerContractBase : coinbaseIndexerContractBaseSepolia

export const easContractBaseSepolia = "0x4200000000000000000000000000000000000021"
export const easContractBase = "0x4200000000000000000000000000000000000021"
export const easContract = process.env.NODE_ENV === "production" ? easContractBase : easContractBaseSepolia

// escrow contract
export const escrowContractBaseSepolia = "0x0811Cb0991A60016Df2098480193508C567DD4d6"
export const escrowContractBase = "" // TODO: paste mainnet escrow contract address here
export const escrowContract = process.env.NODE_ENV === "production" ?  escrowContractBase : escrowContractBaseSepolia
