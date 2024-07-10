 
import './App.css'
import HomePage from './Pages/HomePage'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import StakePage from './Pages/StakePage';
import { Toaster } from "react-hot-toast";
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum';
import { Web3Modal } from '@web3modal/react';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { bsc } from 'viem/chains';


const chains = [bsc];
const projectId = 'e4afaa996192e3d484b46d43a9f6f870';  //aeecfbcaaf30576d781f3da13a186c26   // c86a583333393f73c3218e131a7d46fc

const metadata = {
  name: 'Ramsena Stake',
  description: 'Ramsena offers a paradigm shift in the way individuals or business connect, & communicate in todays digital landscape, that leverage the power of blockchain to enhance security, privacy, and flexibility in communication.',
  url: 'https://stake.voipfinance.com',
  icons: ['https://voip-web.netlify.app/assets/icon1-DGHckJj4.png']
}

const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);
const wagmiConfig = createConfig({
  metadata,
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient

});
const ethereumClient = new EthereumClient(wagmiConfig, chains);

function App() {
  

  return (
    <>
      <BrowserRouter>
      <WagmiConfig config={ wagmiConfig }>
      <Toaster />
        <Routes>
          <Route path="*" element={<Navigate to="/" />} />
          <Route path="/" element={<HomePage />} />
         <Route path="/Stake" element={<StakePage />} />
        </Routes>
        </WagmiConfig>
       <Web3Modal projectId={ projectId } ethereumClient={ ethereumClient } /> 
      </BrowserRouter>
      
      
    </>
  )
}

export default App
