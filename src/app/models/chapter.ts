import { Hero, Monster, Weapon, Armor } from './character';

export enum CharacterAction {
    attack = "Atacar",
    sneak = "Fugir",
    persuade = "Persuadir",
    doNothing = "Não Reagir"
}

export enum FailureOptions {
    gameOver,
    nextChapter
}

export enum SuccessOptions {
    rewardExperience,
    rewardEquipment,
    addHeroToParty
}

export class Chapter {
    story: string[];
    options: CharacterAction[];
    enemyParty: Monster[];
    sneakPersuadeFail: CharacterAction;
    ifFail: FailureOptions;
    ifSucceed: SuccessOptions[];
    rewards: {
        experience: number,
        equipment: (Weapon | Armor)[];
        newHero: Hero;
    }
    nextChapter: Chapter;
}