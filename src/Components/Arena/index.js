import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, transformVillianData, transformCharacterData } from '../../constants';
import myEpicGame from '../../utils/MyEpicGame.json';
import './Arena.css'
import LoadingIndicator from '../../Components/LoadingIndicator';

const Arena = ({ characterNFT, setCharacterNFT, currentAccount, playersMap }) => {

    const [players, setPlayers] = useState(null);
    const [gameContract, setGameContract] = useState(null);
    const [boss, setBoss] = useState(null);
    const [attackState, setAttackState] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [provider, setProvider] = useState(false);

    useEffect(() => {

        const { ethereum } = window;

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
        }
        else {
            console.log('ethereum object not found');
        }
    }, []);

    useEffect(() => {
        const fetchBoss = async () => {
            const bossTxn = await gameContract.getBigBoss();
            setBoss(transformVillianData(bossTxn));
        }
        const onAttackComplete = (from, newBossHP, newPlayerHP, accumulatedDamage) => {
            console.log('players in arena***', players);
            const bossHP = newBossHP.toNumber();
            const playerHP = newPlayerHP.toNumber();
            const sender = from.toString();
            const damageDone = accumulatedDamage.toNumber();

            console.log(`AttackComplete: Boss Hp: ${bossHP} Player Hp: ${playerHP} damageDone: ${damageDone}`);

            if (currentAccount === sender.toLowerCase()) {
                setBoss((prevState) => {
                    return {...prevState, hp: bossHP};
                });
                setCharacterNFT((prevState) => {
                    return {...prevState, hp: playerHP};
                });
            }
            else {
                setBoss((prevState) => {
                    return {...prevState, hp: bossHP};
                });
            }
        }
        if (gameContract) {
            fetchBoss();
            gameContract.on('AttackComplete', onAttackComplete);
        }
        return () => {
            if (gameContract) {
                gameContract.off('AttackComplete', onAttackComplete);
            }
        }
    }, [gameContract, currentAccount, setCharacterNFT]);

    useEffect(() => { 
        const getPlayers = async () => {
            let allPlayersInGame = await gameContract.getAllPlayersInGame();
            let allPlayersMap = {};
            for (let player of allPlayersInGame) {
                allPlayersMap[player.sender] = transformCharacterData(player);
            }
            setPlayers(allPlayersMap);
            console.log('allPlayersMap Arena:', allPlayersMap);
        }
        if (gameContract) {
            getPlayers();
        }

    })

    const runAttackAction = async () => {
        try {
            if (gameContract) {
                setAttackState('attacking...');
                console.log('attacking boss');
                const attackTxn = await gameContract.attackBoss();
                await attackTxn.wait();
                setAttackState('hit');
                setShowToast(true);
                setTimeout(() => {
                    setShowToast(false);
                }, 5000);
            }
        }
        catch (e) {
            console.log('There was an error with the attack:', e);
            setAttackState('');
        }
    }

    return (
        <div className="arena-container">
            {boss && characterNFT && (
            <div id="toast" className={showToast ? 'show' : ''}>
                <div id="desc">{`💥 ${boss.name} was hit for ${characterNFT.attackDamage}!`}</div>
            </div>
            )}
            { boss && (
            <div className="boss-container">
                <div className={`boss-content ${attackState}`}>
                    <h2>🔥 {boss.name} 🔥</h2>
                    <div className="image-content">
                        <img src={`https://cloudflare-ipfs.com/ipfs/${boss.imageURI}`} alt={`Boss ${boss.name}`}></img>
                        <div className="health-bar">
                            <progress value={boss.hp} max={boss.maxHP} />
                            <p>{`${boss.hp} / ${boss.maxHP} HP`}</p>
                        </div>
                    </div>
                </div>
                <div className="attack-container">
                    <button className="cta-button" onClick={runAttackAction}>
                        {`💥 Attack ${boss.name}`}
                    </button>
                </div>
                {
                    attackState === 'attacking' && (
                        <div className="loading-indicator">
                            <LoadingIndicator />
                            <p>Attacking ⚔️</p>
                        </div>
                )}
            </div>
            )}

            {characterNFT && (
            <div className="players-container">
                <div className="player-container">
                <h2>Your Character</h2>
                <div className="player">
                    <div className="image-content">
                    <h2>{characterNFT.name}</h2>
                    <img
                        src={`https://cloudflare-ipfs.com/ipfs/${characterNFT.imageURI}`}
                        alt={`Character ${characterNFT.name}`}
                    />
                    <div className="health-bar">
                        <progress value={characterNFT.hp} max={characterNFT.maxHP} />
                        <p>{`${characterNFT.hp} / ${characterNFT.maxHP} HP`}</p>
                    </div>
                    </div>
                    <div className="stats">
                    <h4>{`⚔️ Attack Damage: ${characterNFT.attackDamage}`}</h4>
                    </div>
                </div>
                </div>
            </div>
            )}
        </div>
    );
};

export default Arena;