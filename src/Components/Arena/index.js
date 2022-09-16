import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { transformVillianData, transformCharacterData } from '../../constants';
import myEpicGame from '../../utils/MyEpicGame.json';
import './Arena.css'
import LoadingIndicator from '../../Components/LoadingIndicator';

const Arena = ({ characterNFT, setCharacterNFT, currentAccount, players, setPlayers, setBossHome, contractAddress }) => {

    const [gameContract, setGameContract] = useState(null);
    const [boss, setBoss] = useState(null);
    const [attackState, setAttackState] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [nftDeathOther, setNftDeathOther] = useState(false);
    const [nftDeathBoss, setNftDeathBoss] = useState(false);

    useEffect(() => {
        const getPlayers = async (from, tokenID, characterIndex, allPlayersInGame) => {
            if (allPlayersInGame) {
                let playerArr = [];
                for (let player of allPlayersInGame) {
                    if (player.hp > 0) {
                        playerArr.push(transformCharacterData(player))
                    }
                }
                setPlayers(playerArr);
            }
        }
        const nftDeath = async (from, allPlayersInGame) => {
            if (!(currentAccount === from.toLowerCase())) {
                setNftDeathOther(true);
                setTimeout(() => {
                    setNftDeathOther(false);
                    setPlayers(allPlayersInGame);
                }, 5000);
            }
        }

        const { ethereum } = window;

        if (ethereum) {
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const gameContract = new ethers.Contract(
                "0x7Fde3Cd9183e84BFEc6c05E6dA2b02d13F93121f",
                myEpicGame.abi,
                signer
            );
            setGameContract(gameContract);
            getPlayers(gameContract);
            gameContract.on('CharacterNftMinted', getPlayers);
            gameContract.on('NftDeath', nftDeath);
        }
        else {
            console.log('ethereum object not found');
        }
        return () => {
            if (gameContract) {
                gameContract.off('CharacterNftMinted', getPlayers);
                gameContract.off('NftDeath', nftDeath);
            }
        }

    }, []);

    useEffect(() => {
        const fetchBoss = async () => {
            const bossTxn = await gameContract.getBigBoss();
            setBoss(transformVillianData(bossTxn));
            setBossHome(transformVillianData(bossTxn));
        }
        const onAttackComplete = async (from, newBossHP, newPlayerHP, accumulatedDamage, allPlayersInGame) => {
            const bossHP = newBossHP.toNumber();
            const playerHP = newPlayerHP.toNumber();
            const sender = from.toString();
            const damageDone = accumulatedDamage.toNumber();
            
            console.log(`AttackComplete: Boss Hp: ${bossHP} Player Hp: ${playerHP} damageDone: ${damageDone}`);

            if (currentAccount === sender.toLowerCase()) {
                setBoss((prevState) => {
                    return {...prevState, hp: bossHP};
                });
                setBossHome((prevState) => {
                    return {...prevState, hp: bossHP};
                });
                setCharacterNFT((prevState) => {
                    return {...prevState, hp: playerHP, damageDone: damageDone};
                });
            }
            if (currentAccount !== sender.toLowerCase()) {
                setBoss((prevState) => {
                    return {...prevState, hp: bossHP};
                })
                setBossHome((prevState) => {
                    return {...prevState, hp: bossHP};
                })
                let playerArr = [];
                for (let player of allPlayersInGame) {
                    playerArr.push(transformCharacterData(player));
                }
                    let newPlayerArr = [];
                    for (let player of playerArr) {
                      if ( !(currentAccount === sender.toLowerCase()) ) {
                        if (playerHP > 0) {
                            player.damageDone = damageDone;
                            player.hp = playerHP;
                            newPlayerArr.push(player);
                        }
                      }
                    }
                    setPlayers(newPlayerArr);
                }
                if (newBossHP == 0) {
                    setNftDeathBoss(true);
                    setBoss(null);
                    setBossHome(null);
                    setTimeout(() => {
                        setNftDeathBoss(false);
                    }, 5000);
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

    const renderOtherPlayers = () => {
        let playerArr = [];
        for (let player of players) {
            if (!(player.sender.toLowerCase() === currentAccount)) {
                if (!(player.sender.toLowerCase() === '0x0000000000000000000000000000000000000000')) {
                    playerArr.push(player);
                }
            }
        }
        return playerArr.map( player => (
            <div key={player.sender}>
                <h2>{`Other Player: ${player.sender}`}</h2>
                <div className="players-container">
                    <div className="players-container">
                        <div className="player">
                            <div className="image-content">
                                <h2>{player.name}</h2>
                                <img
                                    src={`https://cloudflare-ipfs.com/ipfs/${player.imageURI}`}
                                    alt={`Character ${player.name}`}
                                />
                                <div className="health-bar">
                                    <progress value={player.hp} max={player.maxHP} />
                                    <p>{`${player.hp} / ${player.maxHP} HP`}</p>
                                </div>
                            </div>
                        <div className="stats">
                            <h4>{`⚔️ Attack Damage: ${player.attackDamage}`}</h4>
                            <h4>{`⚔️ Damage Done To Boss: ${player.damageDone}`}</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ))
    }

    return (
        <div className="arena-container">
            {boss && characterNFT && (
            <div id="toast" className={showToast ? 'show' : ''}>
                <div id="desc">{`💥 ${boss.name} was hit for ${characterNFT.attackDamage}!`}</div>
            </div>
            )}
        { nftDeathBoss && (

            <div>
                <p className="header gradient-text">{`You killed the boss NFT :)  Celebrate Good Times ;)`}</p>
                <img
                    src={'https://i.imgur.com/SOGZ689.png'}
                    alt=""
                />
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
                    <h4>{`⚔️ Damage Done To Boss: ${characterNFT.damageDone}`}</h4>
                    </div>
                </div>
                </div>
            </div>
            )}
            <br />
            <br />
            <br />
            <br />
            {nftDeathOther && (
                <div>
                    <p className="header gradient-text">{`Another player's NFT has died =)  Don't worry. You got this!`}</p>
                    <img
                        src={'https://i.imgur.com/NVA0aZH.png'}
                    />
                </div>
            )}
            {players && (
                renderOtherPlayers()
            )}
        </div>
    )
};

export default Arena;