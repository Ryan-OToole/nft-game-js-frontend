const RNG_CONTRACT_ADDRESS='0x4C04eF705d9cA6bd05C8A8854570EAf21eD116b3';
const CONTRACT_GAME_ADDRESS = '0x3Add7153A9Df39F6EEAdD3dcA2d83463b02f5a48';

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

export { transformCharacterData, transformVillianData, RNG_CONTRACT_ADDRESS, CONTRACT_GAME_ADDRESS };