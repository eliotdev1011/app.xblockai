import { toast } from "react-hot-toast";
import useNetworkData from "./useNetworkData";

const useTransactionToast = () => {

  const network = useNetworkData();

  return (txHash) => toast((t) => (
    <div className="toast">
      <span>Transaction Sent Successfully.</span>
      <div className="toast-btn-group">
        <a target="_blank" href={`${network.explorerUrl}/tx/${txHash}`} rel="noopener noreferrer" className="toast-btn">View</a>
        <button className="toast-btn close" onClick={() => toast.dismiss(t.id)}>Dismiss</button>
      </div>
    </div>
  ));
}

export default useTransactionToast;