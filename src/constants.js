const CONTRACT_FACTORY_ADDRESS = '0x39236F886b29476BC88B8c1FdF4b09F451dF27f2';
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