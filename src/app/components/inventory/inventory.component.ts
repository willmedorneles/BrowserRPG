import { Component } from '@angular/core';
import { GameControllerService } from '../../services/game-controller.service';
import { Hero, Weapon, Armor, ExperienceToLevel, CharacterSkill } from '../../models/character';

@Component({
    selector: "inventory-component",
    templateUrl: "./inventory.component.html",
    styleUrls: ["./inventory.component.css"]
})
export class InventoryComponent{
    constructor(private gameControllerService: GameControllerService) {}

    inventoryIsOpen : boolean = false;

    _characterSkills: typeof CharacterSkill = CharacterSkill;
    heroParty: Hero[] = this.gameControllerService.heroParty;
    mainCharacter: Hero = this.gameControllerService.mainCharacter;
    availableHeroes: Hero[] = this.gameControllerService.availableHeroes;
    inventory: (Weapon | Armor)[] = this.gameControllerService.partyInventory;
    _experienceToLevel: typeof ExperienceToLevel = ExperienceToLevel;

    selectedHero: Hero = this.heroParty[0];
    showAvailableHeroesScreen: boolean = false;
    isFighting: boolean = this.gameControllerService.isFighting;

    openInventory(){
        this.inventoryIsOpen = true;
        this.heroParty = this.gameControllerService.heroParty;
        this.availableHeroes = this.gameControllerService.availableHeroes;
        this.inventory = this.gameControllerService.partyInventory;
        this.selectedHero = this.heroParty[0];
        this.showAvailableHeroesScreen = false;
        this.isFighting = this.gameControllerService.isFighting;
    }

    closeInventory(){
        this.inventoryIsOpen = false;
    }

    setSelectedHero(newHero: Hero){
        this.showAvailableHeroesScreen = false;
        if(this.selectedHero !== newHero){
            this.selectedHero = newHero;
        }
    }

    improveSkill(skill: CharacterSkill){
        this.selectedHero.skills[skill]++;
        this.selectedHero.availableSkillPoints--;
    }

    equipItem(item: Weapon|Armor){
        if(item instanceof Weapon){
            this.inventory.push(this.selectedHero.equippedWeapon);
            this.selectedHero.equipNewWeapon(item);
        }
        else if(item instanceof Armor){
            this.inventory.push(this.selectedHero.equippedArmor);
            this.selectedHero.equipNewArmor(item);
        }
        this.inventory.splice(this.inventory.indexOf(item), 1);
    }

    removeCharacterFromParty(){
        this.availableHeroes.push(this.selectedHero);
        this.heroParty.splice(this.heroParty.indexOf(this.selectedHero), 1);
        this.selectedHero = this.mainCharacter;
    }

    showAvailableHeroes(){
        this.selectedHero = undefined;
        this.showAvailableHeroesScreen = true;
    }

    addHeroToParty(hero: Hero){
        this.heroParty.push(hero);
        this.availableHeroes.splice(this.availableHeroes.indexOf(hero), 1);
        this.setSelectedHero(hero);
    }


}