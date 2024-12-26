export const networks = {
    97: {
        "contract": "0xC4Cb6c49d75259929d13ff74C2eCC1a87544a484",
        "token": "0xFa60D973F7642B748046464e165A65B7323b0DEE",
        "router": "0xD99D1c33F9fC3444f8101754aBC46c52416550D1",
        "wallet": "0xF1BacAdbBDb30ae21765f2dEb89a4C5Bb2726675",
        "explorerUrl": "https://testnet.bscscan.com/"
    },
    1: {
        "contract": "0xb538022231265C8E7707CdaF9A07a3F85aC70cFc",
        "token": "0xC5842df170b8C8D09EB851A8D5DB3dfa00669E3F",
        "router": "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
        "wallet": "0xF1BacAdbBDb30ae21765f2dEb89a4C5Bb2726675",
        "explorerUrl": "https://etherscan.io/"
    }
}

export const getNetwork = (chainId) => {
    if (!chainId || !networks[chainId]) return networks[1];
    return networks[chainId];
}