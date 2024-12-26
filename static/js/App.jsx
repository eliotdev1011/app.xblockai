import './App.css';
import 'notyf/notyf.min.css';
import '@rainbow-me/rainbowkit/styles.css';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { mainnet, polygon, bsc, bscTestnet } from 'wagmi/chains';
import { RainbowKitProvider, darkTheme, ConnectButton } from '@rainbow-me/rainbowkit';
import { publicProvider } from 'wagmi/providers/public';
import { getDefaultWallets, connectorsForWallets } from '@rainbow-me/rainbowkit';
import HomePage from './Pages/HomePage';
import Navbar from './components/Navbar/Navbar';
import HeroSection from './Pages/HeroSection';
import { Toaster } from 'react-hot-toast';
const projectId = "cc1c5638e9c1b3fd51cc96a66e4f40b4";

const { chains, provider } = configureChains([mainnet], [publicProvider()]);

const { wallets } = getDefaultWallets({
  appName: 'My RainbowKit App',
  projectId,
  chains,
});

const connectors = connectorsForWallets([...wallets]);

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

function App() {
  return (
    <>
      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider
          initialChain={1}
          chains={chains}
          theme={darkTheme({
            accentColor: '#332d53',
            accentColorForeground: 'white',
            overlayBlur: 'small',
            borderRadius: 'medium',
          })}
        >
          <div className='heroBackGround' >
            <Navbar ConnectButton={ConnectButton} />
            <HeroSection />
            <HomePage />
            <Toaster />
          </div>
        </RainbowKitProvider>
      </WagmiConfig>
    </>
  );
}

export default App;
