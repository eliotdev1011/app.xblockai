import toast from "react-hot-toast";
export * from "./helper"
export * from "./crypto"


export const handleError = (error, fallbackErr) => {
  const errMessage = findError(error, fallbackErr);
  toast.error(errMessage);
}

export const findError = (error, fallbackErr) => {
  try {
    const messageStr = error.reason ? error.reason : error.error.data.message;
    const messageArr = messageStr.split(":");
    if (messageArr[messageArr.length - 1]) {
      return messageArr[messageArr.length - 1]
    }
  } catch {
    const messageStr = error?.message;
    const messageArr = ["User rejected request", "User denied transaction signature", "user rejected transaction"]
    if (messageArr.some(predicate => messageStr.includes(predicate))) {
      return "Transaction rejected by user"
    }
  }
  return fallbackErr ? fallbackErr : "Something went wrong, please try again!"
}