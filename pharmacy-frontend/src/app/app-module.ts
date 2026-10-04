import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { AuthComponent } from './features/auth/auth.component';
import { LayoutComponent } from './layouts/layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { InventoryComponent } from './features/inventory/inventory.component';
import { OrdersComponent } from './features/orders/orders.component';
import { UsersComponent } from './features/users/users.component';
import { ProfileComponent } from './features/profile/profile.component';

@NgModule({
  declarations: [
    App, AuthComponent, LayoutComponent, DashboardComponent, InventoryComponent,
    OrdersComponent, UsersComponent, ProfileComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule, HttpClientModule, ReactiveFormsModule, FormsModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [App]
})
export class AppModule { }
