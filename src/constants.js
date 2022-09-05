const CONTRACT_ADDRESS = '0xCF6A5281bea657b671f3334aDd95Bf9332126C78';

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