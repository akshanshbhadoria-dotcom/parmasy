import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../../shared/models/models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly url = `${environment.apiUrl}/users`;
  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    console.log('[UserService] GET', this.url);
    return this.http.get<User[]>(this.url).pipe(
      catchError(err => { console.error('[UserService] ERROR', err.status, err.message); return throwError(() => err); })
    );
  }
}
