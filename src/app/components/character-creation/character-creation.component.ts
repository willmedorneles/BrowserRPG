import { Component } from '@angular/core'
import { CharacterOptions } from '../../models/character-options'
import { GameControllerService } from 'src/app/services/game-controller.service';

@Component({
    selector: "character-creation-component",
    templateUrl: "./character-creation.component.html",
    styleUrls: ["./character-creation.component.css"]

})
export class CharacterCreationComponent{
    constructor(private gameControllerService: GameControllerService){}
    character = {
        race: '--Escolha--',
        class: '--Escolha--',
        gender: undefined,
        name: undefined,
    }

    characterComplete: boolean = false;

    races = CharacterOptions.races;
    classes = CharacterOptions.classes;
    genders = CharacterOptions.genders;

    changeRace(newRace: string){
        this.character.race = newRace;
        this.checkCompleted();
    }

    changeClass(newClass: string){
        this.character.class = newClass;
        this.checkCompleted();
    }

    changeGender(newGender: string){
        this.character.gender = newGender;
        this.checkCompleted();
    }

    changeName(){
        this.checkCompleted();
    }

    checkCompleted(){
        this.characterComplete = this.character.race !== "--Escolha--"
            && this.character.class !== "--Escolha--"
            && this.character.gender
            && this.character.name
    }
    
    createCharacter(){
        if(!this.characterComplete){
            return;
        }

        this.gameControllerService.setMainCharacter(this.character);
    }
    
}
