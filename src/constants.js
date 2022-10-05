const CONTRACT_GAME_ADDRESS = '0x1ae7940c88547EeEa95d201c2F6760427BFF1757';

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