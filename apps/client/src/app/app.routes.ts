import { Routes } from '@angular/router';
import { VerifyToken } from './guard/verify-token';
import { LayoutComponent } from './pages/layout/layout.component';

export const routes: Routes = [
  {
    path: '*',
    redirectTo: 'form/login',
  },
  {
    path: 'form',
    loadChildren: () =>
      import('./pages/form/form.routes').then((m) => m.ROUTES),
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [VerifyToken],
    loadChildren: () => import('./pages/pages.routes').then((m) => m.ROUTES),
  },
];
