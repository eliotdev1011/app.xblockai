import React from 'react';
import toast from 'react-hot-toast';

const useConfirmationToast = (type) => {
  let message = "";
  let color = "";
  if (type === "emergency") {
    color = "#DC4C64";
    message = "Are you sure you want to take out your tokens? You won't get any rewards.";
  } else if (type === "stake") {
    color = "#54B4D3";
    message = "It appears you have rewards available for claim. If you proceed, these rewards will be credited to your wallet.";
  } else {
    throw new Error("Invalid type");
  }
  return (fn) => toast((t) => (
    <div className="toast">
      <span>{message}</span>
      <div className="toast-btn-group">
        <button className="toast-btn" style={{ background: color }} onClick={() => { fn(); toast.dismiss(t.id); }}>Confirm</button>
        <button className="toast-btn close" onClick={() => toast.dismiss(t.id)}>Dismiss</button>
      </div>
    </div>
  )
  );
}

export default useConfirmationToast;