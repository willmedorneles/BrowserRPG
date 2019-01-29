import { Component } from '@angular/core';
import { GameControllerService } from '../../services/game-controller.service';
import { Hero, Monster, BaseCharacter, FightOptions, Warrior, Ranger, Rogue, Cleric } from '../../models/character';
import { Router } from '@angular/router';

enum Teams {
    heroes,
    enemies,
    none
}

@Component({
    selector: "fight-component",
    templateUrl: "./fight.component.html",
    styleUrls: ["./fight.component.css"]
})
export class FightComponent{
    constructor(private gameControllerService: GameControllerService,
        private router: Router){}

        heroTurn: boolean = true;
        actionDelay: number = this.gameControllerService.actionDelay;
        turnsBetweenSpecial: number = 2;
        characterIndex: number = 0;
        freezeActions: boolean = false;
        
        heroParty: Hero[] = this.gameControllerService.heroParty;
        heroesIncapacitaded: number = 0;
        enemyParty: Monster[] = this.gameControllerService.enemyParty;
        enemiesIncapacitaded: number = 0;

        currentCharacter: BaseCharacter = this.heroParty[this.characterIndex];
        _fightOptions: typeof FightOptions = FightOptions;
        _teams: typeof Teams = Teams;
        selectedAction: FightOptions = FightOptions.none;
        availableTarget: Teams = Teams.none;
        selectedTargets: BaseCharacter[] = [];

        displayMessage: string = `Turno de ${this.currentCharacter.name}`;
        successMessages: string[] = [];
        showNextChapterButton: boolean = false;
        showGameOverButton: boolean = false;

        selectOption(selectedOption: FightOptions){
            if(this.freezeActions && this.heroTurn){
                return;
            }
            this.selectedAction = selectedOption;
            this.selectedTargets = [];

            if(this.selectedAction === FightOptions.attack){
                this.availableTarget = Teams.enemies;
                this.displayMessage = "Selecione um alvo para o ataque.";
            } else if(this.selectedAction === FightOptions.specialAttack
                && this.currentCharacter instanceof Hero
                && this.currentCharacter.level < 3){

                this.displayMessage = "Ataques especiais são liberados no nível 3";
                } else if(this.selectedAction === FightOptions.specialAttack
                    && this.currentCharacter instanceof Hero
                    && this.currentCharacter.level >= 3){

                        if(this.currentCharacter.turnsUntilSpecialAvailableAgain){
                            this.displayMessage = `Ataque especial poderá ser usado em ${this.currentCharacter.turnsUntilSpecialAvailableAgain} turnos.`;
                        } else {
                            if(this.currentCharacter instanceof Warrior){
                                this.availableTarget = Teams.enemies;
                                this.displayMessage = `Ataque dois alvos de uma vez.`;
                            }
                            if(this.currentCharacter instanceof Ranger){
                                this.availableTarget = Teams.heroes;
                                this.displayMessage = `Instala uma armadilha para proteger um aliado.`;
                            }
                            if(this.currentCharacter instanceof Rogue){
                                this.availableTarget = Teams.enemies;
                                this.displayMessage = "Envenena um inimigo.";
                            }
                            if(this.currentCharacter instanceof Cleric){
                                this.availableTarget = Teams.heroes;
                                this.displayMessage = "Cura um aliado.";
                            }
                        }
                    }
        }

        tryAttack(target : BaseCharacter){
            if(this.freezeActions && this.currentCharacter instanceof Hero){
                return;
            }
            if(target.isIncapacitated){
                this.displayMessage = `Alvo já está incapcitado.`;
                return;
            }

            if(this.currentCharacter instanceof Monster && target instanceof Hero){
                if(target.hasTrapDefense){
                    this.currentCharacter.isTrapped = true;

                    if(target.hasDamagingTrap) {
                        let damage = Math.floor(Math.random() * 8) + 1;
                        this.currentCharacter.currentHealth -= damage;
                        this.displayMessage = `${target.name} foi protegido pela armadilha e ${this.currentCharacter.name} recebeu ${damage} de dano.`;
                        if(this.currentCharacter.currentHealth <= 0){
                            this.currentCharacter.isIncapacitated = true;
                            this.enemiesIncapacitaded++;
                        }
                    }
                    else{
                        this.displayMessage = `${target.name} foi protegido pela armadilha e ${this.currentCharacter} está preso pela armadilha`;
                    }

                    target.hasTrapDefense = false;
                    target.hasDamagingTrap = false;
                    setTimeout(() => {
                        this.checkIfWin();
                    }, this.actionDelay);
                    return;
                }
            }

            if(this.selectedAction === FightOptions.attack){
                this.freezeActions = true;
                this.attack(target);
            } else if(this.currentCharacter instanceof Hero
                && this.currentCharacter.level > 2
                && this.selectedAction === FightOptions.specialAttack){
                    const upgraded: boolean = this.currentCharacter.level > 5;

                    if(this.currentCharacter instanceof Warrior){
                        this.warriorSpecialAttack(target, upgraded);
                    }
                    if(this.currentCharacter instanceof Ranger){
                        this.rangerSpecialAttack(target, upgraded);
                    }
                    if(this.currentCharacter instanceof Rogue){
                        this.rogueSpecialAttack(target, upgraded);
                    }
                    if(this.currentCharacter instanceof Cleric){
                        this.clericSpecialAttack(target, upgraded);
                    }
            } else {
                this.displayMessage = "Por favor escolha uma ação.";
            }     
        }

        warriorSpecialAttack(target: BaseCharacter, upgraded: boolean){
            if(!(target instanceof Monster)){
                this.displayMessage = `Apenas inimigos podem ser alvos desse ataque.`;
                return;
            }

            this.selectedTargets.push(target);

            if(this.selectedTargets.length < 2){
                this.displayMessage = `Escolha um segundo alvo para o ataque especial.`;
            }
            else if(this.currentCharacter instanceof Hero){
                this.freezeActions = true;
                this.currentCharacter.turnsUntilSpecialAvailableAgain = this.turnsBetweenSpecial;
                let doubleAttackPenalty = upgraded ? 0 : 4;
                let firstTarget : BaseCharacter = this.selectedTargets[0];
                let secondTarget : BaseCharacter = this.selectedTargets[1];

                if(this.currentCharacter.attack() - doubleAttackPenalty >= firstTarget.barriers.attack){
                    let damage = this.currentCharacter.dealDamage();
                    firstTarget.currentHealth -= damage;
                    this.displayMessage = `${this.currentCharacter.name} deu ${damage} de dano a ${target.name}.`;
                    if(firstTarget.currentHealth <= 0){
                        firstTarget.isIncapacitated = true;
                        this.enemiesIncapacitaded++;
                    }
                }
                else{
                    this.displayMessage = `${this.currentCharacter.name} errou!`;
                }

                setTimeout(() => {
                    if(this.currentCharacter.attack() - doubleAttackPenalty >= secondTarget.barriers.attack){
                        let damage = this.currentCharacter.dealDamage();
                        secondTarget.currentHealth -= damage;
                        this.displayMessage = `${this.currentCharacter.name} deu ${damage} de dano a ${target.name}.`;
                        if(secondTarget.currentHealth <= 0 && !secondTarget.isIncapacitated){
                            secondTarget.isIncapacitated = true;
                            this.enemiesIncapacitaded++;
                        }
                    }
                    else{
                        this.displayMessage = `${this.currentCharacter.name} errou!`;
                    }

                    setTimeout(() => {
                        this.selectedTargets = [];
                        this.checkIfWin();
                    }, this.actionDelay);
                }, this.actionDelay);
            
            }
        }

        rangerSpecialAttack(target: BaseCharacter, upgraded: boolean){
            if(!(target instanceof Hero)){
                this.displayMessage = `Escolha um aliado para proteger.`;
                return;
            }

            if(target.hasTrapDefense){
                this.displayMessage = `O alvo já está protegido por outra armadilha.`;
                return;
            }

            this.freezeActions = true;
            if(this.currentCharacter instanceof Hero){
                this.currentCharacter.turnsUntilSpecialAvailableAgain = this.turnsBetweenSpecial;
            }

            this.displayMessage = `${this.currentCharacter.name} instalou uma armadilha para proteger ${target.name}.`;
            target.hasTrapDefense = true;
            target.hasDamagingTrap = upgraded;
            setTimeout(() => {
                this.nextTurn();
            }, this.actionDelay);
        }

        rogueSpecialAttack(target: BaseCharacter, upgraded: boolean){
            if(!(target instanceof Monster)){
                this.displayMessage = `Escolha um inimigo para envenenar.`;
                return;
            }

            this.freezeActions = true;
            if(this.currentCharacter instanceof Hero){
                this.currentCharacter.turnsUntilSpecialAvailableAgain = this.turnsBetweenSpecial;
            }

            target.isStrongPoison = upgraded;
            target.poisonStacks++;
            this.displayMessage = `${target.name} foi envenenado. (Nível do veneno: ${target.poisonStacks})`;
            setTimeout(() => {
                this.nextTurn();
            }, this.actionDelay);
        }

        clericSpecialAttack(target: BaseCharacter, upgraded: boolean){
            if(!(target instanceof Hero)){
                this.displayMessage = `Escolha um aliado para curar.`;
                return;
            }

            if(upgraded){
                this.selectedTargets.push(target);

                if(this.selectedTargets.length < 2){
                    this.displayMessage = `Escolha mais um aliado para curar.`;
                    return;
                }
                this.freezeActions = true;
                if(this.currentCharacter instanceof Hero){
                    this.currentCharacter.turnsUntilSpecialAvailableAgain = this.turnsBetweenSpecial;
                }

                let heal1 = Math.floor((Math.random() * 6) + 1 + this.currentCharacter.skills.intelligence);
                let heal2 = Math.floor((Math.random() * 6) + 1 + this.currentCharacter.skills.intelligence);
                let target1 = this.selectedTargets[0];
                let target2 = this.selectedTargets[1];

                target1.currentHealth = target1.currentHealth + heal1 > target1.maxHealth ? target1.maxHealth : target1.currentHealth + heal1;
                this.displayMessage = `${target1.name} foi curado em ${heal1} pontos.`;

                setTimeout(() => {
                    target2.currentHealth = target2.currentHealth + heal2 > target2.maxHealth ? target2.maxHealth : target2.currentHealth + heal2;
                    this.displayMessage = `${target2.name} foi curado em ${heal2} pontos.`;
                    this.selectedTargets = [];
                    setTimeout(() => {
                        this.nextTurn();
                    }, this.actionDelay);
    
                }, this.actionDelay);

            }
            else {
                this.freezeActions = true;
                if(this.currentCharacter instanceof Hero){
                    this.currentCharacter.turnsUntilSpecialAvailableAgain = this.turnsBetweenSpecial;
                }
                let healing = Math.floor((Math.random() * 6) + 1 + this.currentCharacter.skills.intelligence);
                target.currentHealth = target.currentHealth + healing > target.maxHealth ? target.maxHealth : target.currentHealth + healing;
                this.displayMessage = `${target.name} foi curado em ${healing} pontos.`;
                setTimeout(() => {
                    this.nextTurn();
                }, this.actionDelay);
            }
        }

        attack(target: BaseCharacter) {
            this.availableTarget = Teams.none;
            if(this.currentCharacter.attack() >= target.barriers.attack){
                let damage = this.currentCharacter.dealDamage();
                target.currentHealth -= damage;
                this.displayMessage = `${this.currentCharacter.name} acertou ${target.name} dando ${damage} de dano.`;
                setTimeout(() => {
                    if(target.currentHealth <= 0){
                        target.isIncapacitated = true;
                        this.heroTurn ? this.enemiesIncapacitaded++ : this.heroesIncapacitaded++;
                        this.checkIfWin();
                    } else {
                        this.nextTurn();
                    }                    
                }, this.actionDelay);
            } else {
                this.displayMessage = `${this.currentCharacter.name} errou.`;
                setTimeout(() => {
                    this.nextTurn();
                }, this.actionDelay);
            }
        }

        checkIfWin(){
            this.selectedAction = FightOptions.none;
            if(this.enemiesIncapacitaded === this.enemyParty.length){
                this.displayMessage = `Todos os inimigos foram derrotados!`;
                this.successMessages = this.gameControllerService.encounterSuccess();
                this.showNextChapterButton = true;
                this.gameControllerService.isFighting = false;
                return;
            }
            if(this.heroesIncapacitaded === this.heroParty.length){
                this.displayMessage = `Todos os heróis foram derrotados!`;
                this.showGameOverButton = true;
                this.gameControllerService.isFighting = false;
                return;
            }
            this.nextTurn();
        }

        nextTurn(){
            if(this.currentCharacter instanceof Monster
                && this.currentCharacter.poisonStacks
                && !this.currentCharacter.hasTakenPoisonDamageThisTurn){
                    
                    this.currentCharacter.hasTakenPoisonDamageThisTurn = true;
                    let maxDamage = this.currentCharacter.isStrongPoison ? 6 : 3;
                    let poisonDamage = (Math.floor(Math.random() * maxDamage) + 1) * this.currentCharacter.poisonStacks;
                    this.currentCharacter.currentHealth -= poisonDamage;
                    this.displayMessage = `${this.currentCharacter.name} recebeu ${poisonDamage} de dano por veneno!`;
                    if(this.currentCharacter.currentHealth <= 0){
                        this.currentCharacter.isIncapacitated = true;
                        this.enemiesIncapacitaded++;
                    }
                    setTimeout(() => {
                        this.checkIfWin();
                    }, this.actionDelay);
                    return;

            }
            if(this.currentCharacter instanceof Monster && this.currentCharacter.hasTakenPoisonDamageThisTurn){
                this.currentCharacter.hasTakenPoisonDamageThisTurn = false;
            }

            this.availableTarget = Teams.none;
            this.selectedAction = FightOptions.none;
            this.characterIndex++;
            let nextCharacter;

            if(this.heroTurn){
                nextCharacter = this.heroParty[this.characterIndex];
            } else{
                nextCharacter = this.enemyParty[this.characterIndex];
            }

            if(nextCharacter){
                if(!nextCharacter.isIncapacitated){
                    this.currentCharacter = nextCharacter;
                    this.displayMessage = `É o turno de ${this.currentCharacter.name}`;
                    if(this.currentCharacter instanceof Hero){
                        this.freezeActions = false;
                        if(this.currentCharacter.turnsUntilSpecialAvailableAgain) {
                            this.currentCharacter.turnsUntilSpecialAvailableAgain--;
                        }
                    } else {
                        setTimeout(() => {
                            this.takeEnemyTurn();
                        }, this.actionDelay);
                    }
                } else {
                    this.nextTurn();
                }
            } else {
                this.heroTurn = !this.heroTurn;
                this.characterIndex = -1;
                this.nextTurn();
            }
        }

        takeEnemyTurn() {      

            if(this.currentCharacter instanceof Monster && this.currentCharacter.isTrapped){
                this.currentCharacter.isTrapped = false;
                this.displayMessage = `${this.currentCharacter.name} se livrou da armadilha.`;
                setTimeout(() => {
                    this.nextTurn();
                }, this.actionDelay);
            } 
            else {     
                let target: Hero;           
                this.selectedAction = FightOptions.attack;

                while(!target){
                    let randomTargetIndex = Math.floor(Math.random() * this.heroParty.length);
                    let potentialTarget = this.heroParty[randomTargetIndex];
                    if(!potentialTarget.isIncapacitated){
                        target = potentialTarget;
                    }
                }
                this.displayMessage = `${this.currentCharacter.name} atacou ${target.name}.`;

                setTimeout(() => {
                    this.tryAttack(target);
                }, this.actionDelay);
            }
        }

        nextChapter(){
            this.gameControllerService.nextChapter();
            this.router.navigateByUrl("/story");
        }

        gameOver(){
            this.gameControllerService.gameOver();
        }

        
    
}
