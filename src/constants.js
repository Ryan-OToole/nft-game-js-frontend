const CONTRACT_FACTORY_ADDRESS = '0xDE74E3D5f1b399b2a2b46f390865BD3dD6a0F6b4';
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