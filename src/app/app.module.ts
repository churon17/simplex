import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';


import { APP_ROUTING } from './app.routes';

/* Math equations */
import { KatexModule } from 'ng-katex';

import { AppComponent } from './app.component';
import { SimplexComponent } from './components/simplex/simplex.component';
import { NavbarComponent } from './components/shared/navbar/navbar.component';
import { FooterComponent } from './components/shared/footer/footer.component';

@NgModule({
  declarations: [
    AppComponent,
    SimplexComponent,
    NavbarComponent,
    FooterComponent
  ],
  imports: [
    FormsModule,
    BrowserModule,
    KatexModule,
    ReactiveFormsModule,
    APP_ROUTING
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
