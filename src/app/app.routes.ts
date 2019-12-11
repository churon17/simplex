import { RouterModule, Routes } from '@angular/router';
import { SimplexComponent } from './components/simplex/simplex.component';

const APP_ROUTES: Routes = [
  { path: 'simplex', component: SimplexComponent },
  { path: '**', pathMatch: 'full', redirectTo: 'simplex' }
];

export const APP_ROUTING = RouterModule.forRoot(APP_ROUTES, {useHash: true});
