import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { transformCharacterData, CONTRACT_GAME_ADDRESS } from '../../constants';
import myEpicGame from '../../utils/MyEpicGame.json';
import './SelectCharacter.css';
import LoadingIndicator from "../../Components/LoadingIndicator";

const SelectCharacter = ({ setCharacterNFT, currentAccount, setPlayers }) => {

    const [characters, setCharacters] = useState([]);
    const [gameContract, setGameContract] = useState(null);
    const [mintingCharacter, setMintingCharacter] = useState(false);

    const mintCharacterNFTAction = async (characterId) => {
        try {
            if (gameContract) {
                setMintingCharacter(true);
                console.log('Minting character in progress');
                const mintTxn = await gameContract.mintCharacterNFT(characterId);
                await mintTxn.wait();
                setMintingCharacter(false);
            }
        }
        catch (e) {
            console.warn('Mint character error:', e);
            setMintingCharacter(false);
        }
    }

    const renderCharacters = () =>
        characters.map((character, index) => (
            <div className="character-item" key={character.name}>
                <div className="name-container">
                    <p>{character.name}</p>
                </div>
                <img src={`https://cloudflare-ipfs.com/ipfs/${character.imageURI}`} alt={character.name} />
                <button
                    type="button"
                    className="character-mint-button"
                    onClick={()=> mintCharacterNFTAction(index)}
                >{`Mint ${character.name}`}</button>
            </div>
    ));


    useEffect(() => {
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
        } else {
        console.log('Ethereum object not found');
        }
    }, []);

    useEffect(() => {
        const getCharacters = async () => {
          try {
            console.log('Getting contract characters to mint');
      
            let charactersTxn = await gameContract.getAllDefaultCharacters();
            console.log('charactersTxn', charactersTxn)
            const characters = charactersTxn.map((characterData) =>
              transformCharacterData(characterData)
            );
      
            setCharacters(characters);
          } catch (error) {
            console.error('Something went wrong fetching characters:', error);
          }
        };
        const onCharacterMint = async (sender, tokenId, characterIndex) => {
          console.log(
            `CharacterNftMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex.toNumber()}`
          );

          if (gameContract) {
            const characterNFT = await gameContract.checkIfUserHasNFT();
            setCharacterNFT(transformCharacterData(characterNFT));
            const otherPlayers = await gameContract.getAllPlayersInGame();
            let newotherPlayersArr = [];
            for (let player of otherPlayers) {
              newotherPlayersArr.push(transformCharacterData(player));
            }
            setPlayers(newotherPlayersArr);
          }
        };
      
        if (gameContract) {
          getCharacters();
          gameContract.on('CharacterNftMinted', onCharacterMint);
        }
      
        return () => {
          if (gameContract) {
            gameContract.off('CharacterNftMinted', onCharacterMint);
          }
        };
      }, [gameContract, setCharacterNFT]);

    return (
        <div className="select-character-container">
            <h2>Mint Your Hero. Choose Wisely...</h2>
            {
                characters.length > 0 && (
                    <div className="character-grid">{renderCharacters()}</div>
                )
            }
                {/* Only show our loading state if mintingCharacter is true */}
            {mintingCharacter && (
            <div className="loading">
                <div className="indicator">
                    <LoadingIndicator />
                    <p>Minting In Progress...</p>
                </div>
                <img
                    src="https://media2.giphy.com/media/61tYloUgq1eOk/giphy.gif?cid=ecf05e47dg95zbpabxhmhaksvoy8h526f96k4em0ndvx078s&rid=giphy.gif&ct=g"
                    alt="Minting loading indicator"
                />
            </div>
            )}
        </div>
    );
}

export default SelectCharacter;