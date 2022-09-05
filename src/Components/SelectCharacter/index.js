import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, transformCharacterData } from '../../constants';
import myEpicGame from '../../utils/MyEpicGame.json';
import './SelectCharacter.css';

const SelectCharacter = ({ setCharacterNFT }) => {

    const [characters, setCharacters] = useState([]);
    const [gameContract, setGameContract] = useState(null);
    const [provider, setProvider] = useState(null);

    const mintCharacterNFTAction = async (characterId) => {
        try {
            if (gameContract) {
                console.log('Minting character in progress');
                const mintTxn = await gameContract.mintCharacterNFT(characterId);
                await mintTxn.wait();
                console.log('mintTxn:', mintTxn);
            }
        }
        catch (e) {
            console.log('Mint character error:', e);
        }
    }

    const renderCharacters = () =>
        characters.map((character, index) => (
            <div className="character-item" key={character.name}>
                <div className="name-container">
                    <p>{character.name}</p>
                </div>
                <img src={character.imageURI} alt={character.name} />
                <button
                    type="button"
                    className="character-mint-button"
                    onClick={()=> mintCharacterNFTAction(index)}
                >{`Mint ${character.name}`}</button>
            </div>
    ));

    useEffect( () => {
        const {ethereum} = window;

        const onCharacterMint = async (sender, tokenId, characterIndex) => {
            console.log(
                `CharacterNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex.toNumber()}`
              );
              if (gameContract) {
                const characterNFT = await gameContract.checkIfUserHasNFT();
                console.log('CharacterNFT: ', characterNFT);
                setCharacterNFT(transformCharacterData(characterNFT));
              }
        }

        if (ethereum) {
            const provider = new ethers.providers.Web3Provider(ethereum);
            setProvider(provider);
            const signer = provider.getSigner();
            const gameContract = new ethers.Contract(
                CONTRACT_ADDRESS,
                myEpicGame.abi,
                signer
            );
            setGameContract(gameContract);
            provider.on("CharacterNftMinted", onCharacterMint)
        }
        else {
            console.log('Ethereum object not found');

        }

        return () => {
            /*
             * When your component unmounts, let;s make sure to clean up this listener
             */
            if (gameContract) {
              provider.off('CharacterNFTMinted', onCharacterMint);
            }
          };
    }, [gameContract, provider, setCharacterNFT]);

    useEffect( () => {
        const getCharacter = async () => {
            try {
                console.log('Getting character to mint');
                const characterTxn = await gameContract.getAllDefaultCharacters();

                const characters = characterTxn.map(character => {
                    return transformCharacterData(character);
                });
                setCharacters(characters);
            }
            catch(e) {
                console.log('something went wrong fetching characters:', e);
            }
        }

        if (gameContract) {
            getCharacter();
        }

    }, [gameContract]);

    return (
        <div className="select-character-container">
            <h2>Mint Your Hero. Choose Wisely...</h2>
            {
            characters.length > 0 
                ?
            <div className="character-grid">{renderCharacters()}</div>
                :
            <div></div>
            }

        </div>
    );
}

export default SelectCharacter;