import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './features/auth/auth.component';
import { LayoutComponent } from './layouts/layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { InventoryComponent } from './features/inventory/inventory.component';
import { OrdersComponent } from './features/orders/orders.component';
import { UsersComponent } from './features/users/users.component';
import { ProfileComponent } from './features/profile/profile.component';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  { path: 'auth', component: AuthComponent },
  { path: '', canActivate: [AuthGuard], component: LayoutComponent, children: [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'inventory', component: InventoryComponent },
    { path: 'orders', component: OrdersComponent },
    { path: 'users', component: UsersComponent },
    { path: 'profile', component: ProfileComponent }
  ]},
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
