import React from 'react';
import { useNetwork } from 'wagmi';
import { getNetwork } from '../blockchain/value';

const useNetworkData = () => {
  const { chain } = useNetwork();
  const { contract, token, router, wallet, explorerUrl } = getNetwork(chain && chain?.id);
  return React.useMemo(() => ({ contract, token, router, wallet, explorerUrl }), [chain?.id, contract, token, router, wallet, explorerUrl]);
}

export default useNetworkData;