const CONTRACT_GAME_ADDRESS = '0x95F1aD1a103c820F68D727B61C40275d93C1a884';

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