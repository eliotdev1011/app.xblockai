import axios from "axios";

export const sendAndConfirmTransaction = async (transaction) => {
  const tx = await transaction();
  const receipt = await tx.wait();
  if (receipt.status === 0) {
    throw new Error("Transaction failed");
  }
  return tx.hash;
}


export async function getValueInUSD(totalToken) {
  const lexaToken = "0xC5842df170b8C8D09EB851A8D5DB3dfa00669E3F";
  try {
    const api = `https://api.dexscreener.com/latest/dex/tokens/${lexaToken}`
    const response = await axios.get(api);
    const singleTokenPriceInUsd = response.data?.pairs[0]?.priceUsd;
    const tokenPriceInUSD = Number(singleTokenPriceInUsd) * Number(totalToken);
    return tokenPriceInUSD;
  } catch (error) {
    console.error("Error fetching token price:", error);
  }
}


export const wethPriceInUSD = async () => {
  try {
    // const api = "https://api.dexscreener.com/latest/dex/tokens/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
    // const response = await axios.get(api);
    // const value = response.data?.pairs[1]?.priceUsd;
    const api = "https://api.coinbase.com/v2/prices/ETH-USD/spot"
    const response = await axios.get(api);
    const value = response.data?.data?.amount;
    return value;
  } catch (error) {
    console.log('error: ', error);
  }
}
