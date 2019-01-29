export enum RaceOptions {
    human = "Humano",
    dwarf = "Anão",
    elf = "Elfo",
    duckling = "Pato"
}

export enum ClassOptions {
    warrior = "Guerreiro",
    ranger = "Arqueiro",
    rogue = "Ladrão",
    cleric = "Clérigo"
}

export enum GenderOptions {
    male = "Homem",
    female = "Mulher"
}

export const CharacterOptions = {
    races: [
        RaceOptions.human,
        RaceOptions.dwarf,
        RaceOptions.elf,
        RaceOptions.duckling
    ],
    classes: [
        ClassOptions.warrior,
        ClassOptions.ranger,
        ClassOptions.rogue,
        ClassOptions.cleric
    ],
    genders: [
        GenderOptions.male,
        GenderOptions.female
    ]
}