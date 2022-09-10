import React, {useEffect, useState} from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import SelectCharacter from './Components/SelectCharacter';
import Arena from './Components/Arena';
import { CONTRACT_ADDRESS, transformCharacterData } from './constants';
import myEpicGame from './utils/MyEpicGame.json';
import { ethers } from 'ethers';
import LoadingIndicator from './Components/LoadingIndicator';

// Constants
const TWITTER_HANDLE = 'web3ForToday';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {


  const [players, setPlayers] = useState(null);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [characterNFT, setCharacterNFT] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log('Make sure you have MetaMask!');
        setIsLoading(false);
        return;
      } else {
        const accounts = await ethereum.request({ method: 'eth_accounts'});
        if (accounts.length !== 0) {
          let account = accounts[0];
          console.log('found an account', account);
          setCurrentAccount(account);
        }
        else {
          console.log('no authorized account found');
        }
      }
    }
    catch(e) {
      console.log(e);
    }
    setIsLoading(false);
  }

  const renderContent = () => {
    if (isLoading) {
     return <LoadingIndicator />;
    }
    if (!currentAccount) {
      return (
        <div className="connect-wallet-container">
          <img
            src="https://64.media.tumblr.com/tumblr_mbia5vdmRd1r1mkubo1_500.gifv"
            alt="Monty Python Gif"
          />
          <button className="cta-button connect-wallet-button" onClick={connectWallet}>
            Connect Your Wallet to Play
          </button>
      </div>
      );
    }
    else if ((currentAccount && !characterNFT) || (currentAccount && characterNFT.hp === 0)) {
      
      return (<SelectCharacter setCharacterNFT={setCharacterNFT} currentAccount={currentAccount} setPlayers={setPlayers}  />); 
    }
    else if (currentAccount && characterNFT) {

      return (<Arena setCharacterNFT={setCharacterNFT} characterNFT={characterNFT} currentAccount={currentAccount} players={players} setPlayers={setPlayers} />);
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert('get MetaMask!');
        return;
      }
      let chainId = await ethereum.request({ method: 'eth_chainId' });
      console.log("Connected to chain " + chainId);
      // String, hex code of the chainId of the Rinkebey test network
      const rinkebyChainId = "0x4";
      if (chainId !== rinkebyChainId) {
        alert("You are not connected to the Rinkeby Test Network!");
      }
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      console.log('connected:', accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log('error:', error);
    }
  }

  const checkNetwork = async () => {
    try {
      if (window.ethereum.networkVersion !== '4') {
        alert('Please connect to Rinkeby');
      }
    }
    catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    setIsLoading(true);
    checkIfWalletIsConnected();
    checkNetwork();
  }, []);

  useEffect(() => {
    const fetchNftMetadata = async () => {
      console.log('Checking for Character NFT on address:', currentAccount);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );
      const txn = await gameContract.checkIfUserHasNFT();
      if (txn.name) {
        setCharacterNFT(transformCharacterData(txn));
      }
      setIsLoading(false);
    }

    if (currentAccount) {
      fetchNftMetadata();
    }

  }, [currentAccount]);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">⚔️ Darkwing Nights ⚔️</p>
          <p className="sub-text">Slay your way on and off the chain!</p>
        </div>
        {renderContent()}
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
