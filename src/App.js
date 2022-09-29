import React, {useEffect, useState} from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import SelectCharacter from './Components/SelectCharacter';
import Arena from './Components/Arena';
import { transformCharacterData, CONTRACT_GAME_ADDRESS } from './constants';
import myEpicGame from './utils/MyEpicGame.json';
import { ethers } from 'ethers';
import LoadingIndicator from './Components/LoadingIndicator';
import JokerDeath from './assets/Joker_death.png';

// Constants
const TWITTER_HANDLE = 'plentyWeb3';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {

  const [players, setPlayers] = useState(null);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [characterNFT, setCharacterNFT] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [nftDeathOwner, setNftDeathOwner] = useState(false);
  const [gameContract, setGameContract] = useState(null);
  const [randomNumberSequenceOn, setRandomNumberSequenceOn] = useState(false);
  const [bossHome, setBossHome] = useState({hp: 5});
  const [nftDeathBoss, setNftDeathBoss] = useState(false);
  const [randomNumber, setRandomNumber] = useState(0);

  useEffect(() => {
    console.log('randomNumberSequenceOn', randomNumberSequenceOn);
    // random comment 
    if (!randomNumberSequenceOn) {
      alert(`Please complete upcoming Metamask transaction with GoerliEth to generate random number from Chainlink for the game. Don't worry I loaded a subscription with LINK you just have to pay transaction fee =)`);
      const handleRandomNumberEvent = (requestId, randomNumber) => {
        console.log('requestId', Number(requestId));
        console.log('randomArray', Number(randomNumber));
        setRandomNumber(Number(randomNumber));
        // setRandomNumberArray(randomNumberArray => [...randomNumberArray, Number(randomNumber)]);
      }

      const handleRandomWordsRequest = async (gameContract) => {
        await gameContract.requestRandomWords();
      }
  
      const { ethereum } = window;
  
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const gameContract = new ethers.Contract(
            CONTRACT_GAME_ADDRESS,
            myEpicGame.abi,
            signer
        );
        setGameContract(gameContract);
        console.log('turning random number listener on');
        handleRandomWordsRequest(gameContract);
        gameContract.on('RequestFulfilled', handleRandomNumberEvent);
        setRandomNumberSequenceOn(true);
      } else {
      console.log('Ethereum object not found');
      }
    }
}, []);

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

  const handleNewGame = () => {
    console.log('more work for you sir =)');
    // look at Stephen Grider video how to 
    // instantiate a new game from frontend
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
    else if (currentAccount && characterNFT) {
      return (<Arena setCharacterNFT={setCharacterNFT} characterNFT={characterNFT} currentAccount={currentAccount} players={players} setPlayers={setPlayers} setBossHome={setBossHome} randomNumber={randomNumber} setNftDeathBoss={setNftDeathBoss} />);
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
      gameContract.on('NftDeath', handleNFTDeath);
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

  const renderEnding = () => {
      return (
        <div>
          <div>
          <br />
          <br />
          <p className="header gradient-text">{`The Joker has been slain!!!`}</p>
            <img
              src={JokerDeath}
              alt=""
            />
          </div>
          <div className="bufferzone"></div>
            <div className="connect-wallet-container">
              <img
                src="https://64.media.tumblr.com/tumblr_mbia5vdmRd1r1mkubo1_500.gifv"
                alt="Monty Python Gif"
              />
              <button className="cta-button connect-wallet-button" onClick={handleNewGame}>
                Play a new game? The blockchain needs you...
              </button>
            </div>
        </div>

      );
    }

  return (
    <div className="App"> 
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">⚔️ Darkwing Nights ⚔️</p>
          <p className="sub-text">Slay your way on and off the chain!</p>
        </div>
        {
          bossHome.hp === 0
                ?
            renderEnding()
                :
            renderContent() 
        }
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
