import React, {useEffect, useState} from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import SelectCharacter from './Components/SelectCharacter';
import Arena from './Components/Arena';
import { transformCharacterData, CONTRACT_GAME_ADDRESS } from './constants';
import myEpicGame from './utils/MyEpicGame.json';
// import RNG from './utils/RNG.json';
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
  const [nftDeathOwner, setNftDeathOwner] = useState(false);
  const [gameContract, setGameContract] = useState(null);
  const [randomNumber, setRandomNumber] = useState(null);

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

  const displayRandomNumber = async () => {
    console.log('inside display randomness');
    // const provider = new ethers.providers.Web3Provider(window.ethereum);
    // const signer = provider.getSigner();
    // const gameContract = new ethers.Contract(
    //   CONTRACT_GAME_ADDRESS,
    //   myEpicGame.abi,
    //   signer
    // );
    const txn2 = await gameContract.s_randomWords(1);
    console.log('Number(txn2)', Number(txn2) % 10);
    setRandomNumber(Number(txn2) % 10);
  }

  const requestRandomNumber = async () => {
    console.log('randomness sequence beginning');
    // const provider = new ethers.providers.Web3Provider(window.ethereum);
    // const signer = provider.getSigner();
    // const gameContract = new ethers.Contract(
    //   CONTRACT_GAME_ADDRESS,
    //   myEpicGame.abi,
    //   signer
    // );
    const txn = await gameContract.requestRandomWords();
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
      if (nftDeathOwner) {
        return (
          <div>
            <p className="header gradient-text">Your NFT has died. You must mint another to finish the battle</p>
              <img
                src={'https://i.imgur.com/NVA0aZH.png'}
                alt=""
              />
          </div>
        );
      }
      else {
        return (<SelectCharacter setCharacterNFT={setCharacterNFT} currentAccount={currentAccount} setPlayers={setPlayers} />); 
      }
    }
    // else if (currentAccount && characterNFT && !bossHome) {
    //   return (
    //     <div className="connect-wallet-container">
    //       <img
    //         src="https://64.media.tumblr.com/tumblr_mbia5vdmRd1r1mkubo1_500.gifv"
    //         alt="Monty Python Gif"
    //       />
    //       <button className="cta-button connect-wallet-button" onClick={handleNewGame}>
    //         Play a new game? The blockchain needs you...
    //       </button>
    //     </div>
    //   )
    // }
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
      const goerliChainId = "0x5";
      if (chainId !== goerliChainId) {
        alert("You are not connected to the Goerli Test Network!");
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
      if (window.ethereum.networkVersion !== '5') {
        alert('Please connect to Goerli');
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
    const handleNFTDeath = async (from, allPlayersInGame) => {
      if (from.toLowerCase() === currentAccount) {
        setNftDeathOwner(true);
        setTimeout(() => {
          setNftDeathOwner(false);
      }, 5000);
      }
    }

    const fetchNftMetadata = async () => {
      console.log('Checking for Character NFT on address:', currentAccount);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_GAME_ADDRESS,
        myEpicGame.abi,
        signer
      );
      setGameContract(gameContract);
      gameContract.on('NftDeath', handleNFTDeath)
      const txn = await gameContract.checkIfUserHasNFT();
      if (txn.name) {
        setCharacterNFT(transformCharacterData(txn));
      }
      setIsLoading(false);
    }

    if (currentAccount) {
      fetchNftMetadata();
    }

  }, [currentAccount, CONTRACT_GAME_ADDRESS]);

  return (
    <div className="App">
          <button className="cta-button connect-wallet-button" onClick={requestRandomNumber}>
            Request Random Number
          </button>
          <button className="cta-button connect-wallet-button" onClick={displayRandomNumber}>
            Display Random Number
          </button>
     
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">⚔️ Darkwing Nights ⚔️</p>
          <p className="sub-text">Slay your way on and off the chain!</p>
        </div>
        {/* <div className="connect-wallet-container">
          <img
            src="https://64.media.tumblr.com/tumblr_mbia5vdmRd1r1mkubo1_500.gifv"
            alt="Monty Python Gif"
          />
          <button className="cta-button connect-wallet-button" onClick={connectWallet}>
            Play a new game? The blockchain needs you...
          </button>
        </div> */}
        { renderContent() }
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
