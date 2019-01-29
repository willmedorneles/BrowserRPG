import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule} from '@angular/forms'

import { CharacterCreationComponent } from './components/character-creation/character-creation.component'
import { FightComponent } from './components/fight/fight.component'
import { InventoryComponent } from './components/inventory/inventory.component'
import { StartComponent } from './components/start/start.component'
import { StoryComponent } from './components/story/story.component'

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './components/app.component';
import { GameControllerService } from './services/game-controller.service';

@NgModule({
  declarations: [
    AppComponent,
    StartComponent,
    CharacterCreationComponent,
    StoryComponent,
    InventoryComponent,
    FightComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule
  ],
  providers: [
    GameControllerService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
