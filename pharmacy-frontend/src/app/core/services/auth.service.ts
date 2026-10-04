import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginResponse, User } from '../../shared/models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'pharmacy_token';
  private readonly userKey = 'pharmacy_user';
  constructor(private http: HttpClient, private router: Router) {}
  login(payload: { email: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/users/login`, payload).pipe(tap(response => {
      if (!response?.token) throw new Error('Login response did not include a JWT token.');
      localStorage.setItem(this.tokenKey, response.token);
      localStorage.setItem(this.userKey, JSON.stringify({
        name: response.email.split('@')[0], email: response.email, role: response.role
      }));
      console.info('[Auth] JWT saved to localStorage; user profile cache updated.');
    }));
  }
  register(payload: { name: string; email: string; mobileNumber: string; password: string; role: string }): Observable<unknown> {
    return this.http.post(`${environment.apiUrl}/users/register`, payload);
  }
  logout(): void { localStorage.removeItem(this.tokenKey); localStorage.removeItem(this.userKey); this.router.navigate(['/auth']); }
  get token(): string | null { return localStorage.getItem(this.tokenKey); }
  get currentUser(): User | null {
    const value = localStorage.getItem(this.userKey);
    if (!value) return null;
    try { return JSON.parse(value) as User; }
    catch { localStorage.removeItem(this.userKey); return null; }
  }
  isAuthenticated(): boolean { return !!this.token; }
}
