const CONTRACT_FACTORY_ADDRESS = '0xF6aA3eec7618F542827B8F074Ca0f3Bd931a8E51';
const RNG_CONTRACT_ADDRESS='0xE134fdcFC017c858eb8d8203Ed648c6fcDa8178b';
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

export { CONTRACT_FACTORY_ADDRESS, transformCharacterData, transformVillianData, RNG_CONTRACT_ADDRESS };