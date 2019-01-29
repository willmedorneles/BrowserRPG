import { Component } from '@angular/core'
import { GameControllerService } from 'src/app/services/game-controller.service';
import { Router } from '@angular/router';
import { Hero, Monster } from '../../models/character'
import { CharacterAction } from 'src/app/models/chapter';


@Component({
    selector: "story-component",
    templateUrl: "./story.component.html",
    styleUrls: ["./story.component.css"]
})
export class StoryComponent{
    constructor(private gameControllerService: GameControllerService,
        private router: Router) {}

        currentChapter = this.gameControllerService.currentChapter;
        heroParty: Hero[] = this.gameControllerService.heroParty;
        enemyParty: Monster[] = this.currentChapter.enemyParty;

        actionDelay: number = this.gameControllerService.actionDelay;
        displayMessage: string = "";
        successMessages: string[] = [];
        showNextChapterButton: boolean = false;
    
    chooseAction(action: string) : void {
        if(this.successMessages.length){
            return;
        }

        this.displayMessage = `Você decidiu ${action}.`;
        setTimeout(() => {
            switch(action){
                case CharacterAction.attack:
                    this.tryAttack();
                    break;
                case CharacterAction.sneak:
                    this.trySneak();
                    break;
                case CharacterAction.persuade:
                    this.tryPersuade();
                    break;
                case CharacterAction.doNothing:
                    this.doNothing();
                    break;
                default:
                    console.log("Deu ruim");
            }
        }, this.actionDelay)
    }

    tryAttack(): void {
        this.gameControllerService.isFighting = true;
        this.router.navigateByUrl("/fight");
    }

    trySneak(): void {
        let sneakBarrier = 0;
        let sneakPower = 0;
        this.enemyParty.forEach(enemy => {
            sneakBarrier += enemy.barriers.sneak;
        });
        this.heroParty.forEach(hero => {
            sneakPower += hero.sneak();
        });
        if(sneakPower >= sneakBarrier){
            this.displayMessage = "Você conseguiu fugir!";
            setTimeout(() => {
                this.onSuccess();
            }, this.actionDelay);
        } else {
            this.displayMessage = "Você não conseguiu fugir!";
            setTimeout(() => {
                this.onSneakPersuadeFailure();
            }, this.actionDelay);
        }
    }

    tryPersuade(): void {
        let persuasionBarrier = 0;
        let persuasionPower = 0;
        this.enemyParty.forEach(enemy => {
            persuasionBarrier += enemy.barriers.persuade;
        });
        this.heroParty.forEach(hero => {
            persuasionPower += hero.persuade();
        });
        if(persuasionPower >= persuasionBarrier){
            this.displayMessage = "Você conseguiu convencê-los!";
            setTimeout(() => {
                this.onSuccess();
            }, this.actionDelay);
        } else {
            this.displayMessage = "Você não conseguiu convencê-los!";
            setTimeout(() => {
                this.onSneakPersuadeFailure();
            }, this.actionDelay);
        }
    }

    doNothing(): void {
        this.displayMessage = "Você ficou imóvel.";
        setTimeout(() => {
            this.nextChapter();
        }, this.actionDelay);
    }

    onSuccess(): void {
        this.successMessages = this.gameControllerService.encounterSuccess();
        this.showNextChapterButton = true;
    }
    
    onSneakPersuadeFailure(): void {
        switch(this.currentChapter.sneakPersuadeFail){
            case CharacterAction.attack:
            default:
                this.displayMessage = 'Você foi atacado!';
                setTimeout(() => {
                    this.tryAttack();
                }, this.actionDelay);
                break;
            case CharacterAction.doNothing:
                this.displayMessage = 'Você falhou e perdeu a batalha';
                setTimeout(() => {
                    this.nextChapter();
                }, this.actionDelay);
                break;
        }
    }

    nextChapter(): void {
        this.gameControllerService.nextChapter();
        this.currentChapter = this.gameControllerService.currentChapter;
        this.heroParty = this.gameControllerService.heroParty;
        this.enemyParty = this.gameControllerService.enemyParty;
        this.displayMessage = "";
        this.successMessages = [];
        this.showNextChapterButton = false;
    }



}