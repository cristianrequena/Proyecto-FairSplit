import { Routes } from "@angular/router";
import { LoginComponent } from "./login/login.component";
import { RegisterComponent } from "./register/register.component";
import { RecoverComponent } from "./recover/recover.component";
import { RecoverIdComponent } from "./recover-id/recover-id.component";



export const AUTH_ROUTES: Routes = [
    {path: "login", component: LoginComponent},
    {path: "register", component: RegisterComponent},
    {path: "recover", component: RecoverComponent},
    {path: "recover-id", component: RecoverIdComponent}
]