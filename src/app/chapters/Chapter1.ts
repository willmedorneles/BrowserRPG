import { Chapter, CharacterAction, FailureOptions, SuccessOptions } from '../models/chapter';
import { Weapon, Armor, Monster, Warrior } from '../models/character';
import { GenderOptions, RaceOptions, ClassOptions } from "../models/character-options";

export const Chapter1: Chapter = {
    story: [
        'Você chega numa floresta e é atacado!.',
        'O que você vai fazer?'
    ],
    options: [
        CharacterAction.attack,
        CharacterAction.sneak,
        CharacterAction.persuade
    ],
    enemyParty: [
        new Monster("Goblin", 5, {attack: 2, sneak: 0, persuade: 0}, {attack: 10, sneak: 10, persuade: 10}, 1, 3, "../../assets/goblin.png")
    ],
    sneakPersuadeFail: CharacterAction.attack,
    ifFail: FailureOptions.nextChapter,
    ifSucceed: [
        SuccessOptions.rewardExperience,
        SuccessOptions.rewardEquipment,
        SuccessOptions.addHeroToParty
    ],
    rewards: {
        experience: 500,
        equipment: [new Weapon("Espada Enferrujada", 1, 6)],
        newHero: new Warrior("Benjamin", GenderOptions.male, RaceOptions.elf, 1, 10, {attack: 2, sneak: 1, persuade: 1, intelligence: 1}, new Weapon("Adaga", 1, 4), new Armor("Camisa de Couro", 2))

    },
    nextChapter: null
}