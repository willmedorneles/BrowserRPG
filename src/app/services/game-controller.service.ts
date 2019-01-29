import { Injectable } from '@angular/core';
import { Router, Routes } from '@angular/router';
import { Hero, Weapon, Armor, Monster, Warrior, Ranger, Rogue, Cleric, checkRace, ExperienceToLevel } from '../models/character';
import { Chapter, SuccessOptions } from '../models/chapter';
import { Chapter1 } from '../chapters/Chapter1';
import { ClassOptions } from '../models/character-options';

@Injectable()
export class GameControllerService {
    constructor(private router: Router){}

        mainCharacter: Hero;
        currentChapter: Chapter = Chapter1;
        isFighting: boolean = false;

        actionDelay: number = 1500;

        heroParty: Hero[] = [];
        partyInventory: (Weapon | Armor)[] = [];
        availableHeroes: Hero[] = [];
        enemyParty: Monster[] = this.currentChapter.enemyParty;

        setMainCharacter(character){
            switch(character.class){
                case ClassOptions.warrior:
                    this.mainCharacter = new Warrior(character.name, character.gender, character.race, 1, 10, {attack: 0, sneak: 0, persuade: 0, intelligence: 0}, new Weapon("Adaga", 1, 3), new Armor("Jaqueta", 0));
                    break;
                case ClassOptions.ranger:
                    this.mainCharacter = new Ranger(character.name, character.gender, character.race, 1, 10, {attack: 0, sneak: 0, persuade: 0, intelligence: 0}, new Weapon("Adaga", 1, 3), new Armor("Jaqueta", 0));  
                    break;    
                case ClassOptions.rogue:
                    this.mainCharacter = new Rogue(character.name, character.gender, character.race, 1, 10, {attack: 0, sneak: 0, persuade: 0, intelligence: 0}, new Weapon("Adaga", 1, 3), new Armor("Jaqueta", 0));
                    break;
                case ClassOptions.cleric:
                    this.mainCharacter = new Cleric(character.name, character.gender, character.race, 1, 10, {attack: 0, sneak: 0, persuade: 0, intelligence: 0}, new Weapon("Adaga", 1, 3), new Armor("Jaqueta", 0));
                    break;
            }

            checkRace(this.mainCharacter);
            this.heroParty.push(this.mainCharacter);
            this.router.navigateByUrl('/story');
        }

        encounterSuccess(): string[] {
            let messages: string[] = [];
            this.currentChapter.ifSucceed.forEach(reward => {
                switch(reward){
                    case SuccessOptions.rewardExperience:
                        messages.push(`Cada membro recebeu ${this.currentChapter.rewards.experience} de experiência.`);
                        this.heroParty.forEach(hero => {
                            hero.experience += this.currentChapter.rewards.experience;
                            if(hero.experience >= ExperienceToLevel[hero.level]){
                                messages.push(`${hero.name} Subiu de nível!`);
                                hero.levelUp();
                            }
                        });
                        break;
                    case SuccessOptions.rewardEquipment:
                        messages.push("Você recebeu os seguintes equipamentos: ");
                        this.currentChapter.rewards.equipment.forEach(equipment => {

                            if(equipment instanceof Armor){
                                messages.push(`${equipment.name} -- Bônus de Armadura: ${equipment.attackArmorBonus}`);
                            } else {
                                messages.push(`${equipment.name} -- Dano Mínimo: ${equipment.minDamage} Dano Máximo: ${equipment.maxDamage}`);
                            }
                            this.partyInventory.push(equipment);
                        });
                        break;
                    case SuccessOptions.addHeroToParty:
                        let newHero = this.currentChapter.rewards.newHero;
                        if(this.heroParty.length < 3){
                            messages.push(`Um novo membro entrou para o seu time! ${newHero.name} - ${newHero.characterRole} - Nível: ${newHero.level}`);
                            this.heroParty.push(newHero);
                        } else {
                            messages.push(`Um novo membro está disponível! ${newHero.name} - ${newHero.characterRole} - Nível: ${newHero.level}`);
                            this.availableHeroes.push(newHero);
                        }
                        break;
                }
            });
            return messages;
        }

        nextChapter(): void {
            this.heroParty.forEach(hero => hero.rest());
            this.currentChapter = this.currentChapter.nextChapter;
            this.enemyParty = this.currentChapter.enemyParty;
        }

        gameOver(): void {
            this.mainCharacter = undefined;
            this.currentChapter = Chapter1;
            this.heroParty = [];
            this.partyInventory = [];
            this.availableHeroes = [];
            this.enemyParty = this.currentChapter.enemyParty;

            this.router.navigateByUrl("/");
        }
        

}