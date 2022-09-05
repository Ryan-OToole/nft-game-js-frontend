const CONTRACT_ADDRESS = '0x1d3451Ce54664CE0655D56334D248AB5a8d5A7a7';

const transformCharacterData = (characterData) => {
    return {
        name: characterData.name,
        imageURI: characterData.imageURI,
        hp: characterData.hp.toNumber(),
        maxHP: characterData.maxHP.toNumber(),
        attackDamage: characterData.attackDamage.toNumber()
    }
}

export { CONTRACT_ADDRESS, transformCharacterData };