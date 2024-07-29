import { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth.guard';
import { redirectGuard } from './shared/guards/redirect.guard';

export const routes: Routes = [

    {path: "", pathMatch: "full", redirectTo: "welcome" },
    

    {
        path:'',
        loadChildren: () => import('./pages/welcome/welcome.routes').then(m => m.WELCOME_ROUTES),
        canActivate:[redirectGuard]
    },

    {
        path:'',
        loadChildren: () => import('./pages/auth/auth.routes').then(m => m.AUTH_ROUTES),
        canActivate:[redirectGuard]
    },

    {
        path:'',
        loadChildren: () => import('./pages/home/home.routes').then(m => m.HOME_ROUTES),
        canActivate:[authGuard]
    },

    {
        path:'',
        loadChildren: () => import('./pages/account/account.routes').then(m => m.ACCOUNT_ROUTES),
        canActivate:[authGuard]
    },

    {
        path:'',
        loadChildren: () => import('./pages/groups/groups.routes').then(m => m.GROUPS_ROUTES),
        canActivate:[authGuard]
    },
    
    {
        path:'',
        loadChildren: () => import('./pages/about/about.routes').then(m => m.ABOUT_ROUTES),
    },

    {
        path:'',
        loadChildren: () => import('./pages/friends/friends.routes').then(m => m.FRIENDS_ROUTES),
        canActivate:[authGuard]
    },

    {
        path:'',
        loadChildren: () => import('./pages/contact/contact.routes').then(m => m.CONTACT_ROUTES)
    },

    { path: '**', redirectTo: 'welcome' }

    
];
