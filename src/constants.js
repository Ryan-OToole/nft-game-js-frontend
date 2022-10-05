const CONTRACT_GAME_ADDRESS = '0x892a7B52E9D80D2018100D42a346Dc1c978C7Be1';

const transformCharacterData = (characterData) => {
    return {
        sender: characterData.sender,
        name: characterData.name,
        imageURI: characterData.imageURI,
        hp: characterData.hp.toNumber(),
        maxHP: characterData.maxHP.toNumber(),
        attackDamage: characterData.attackDamage.toNumber(),
        damageDone: characterData.damageDone.toNumber()
    }
}

const transformVillianData = (characterData) => {
    return {
        name: characterData.name,
        imageURI: characterData.imageURI,
        hp: characterData.hp.toNumber(),
        maxHP: characterData.maxHP.toNumber(),
        attackDamage: characterData.attackDamage.toNumber(),
    }
}

export { transformCharacterData, transformVillianData, CONTRACT_GAME_ADDRESS };