import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService, private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.auth.token;
    const outgoing = token
      ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : request;

    console.log(`[HTTP] ${outgoing.method} ${outgoing.urlWithParams}`);

    return next.handle(outgoing).pipe(
      tap((event: HttpEvent<unknown>) => {
        if (event instanceof HttpResponse) {
          console.log(`[HTTP] Response ${event.status} <- ${outgoing.urlWithParams}`);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error(`[HTTP] Error ${error.status} <- ${outgoing.urlWithParams}`, error.error);
        if (error.status === 401) {
          console.warn('[HTTP] 401 Unauthorized - clearing token and redirecting to login');
          localStorage.removeItem('pharmacy_token');
          localStorage.removeItem('pharmacy_user');
          this.router.navigate(['/auth']);
        }
        return throwError(() => error);
      })
    );
  }
}
