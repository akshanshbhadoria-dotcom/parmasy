import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Drug, DrugWriteRequest } from '../../shared/models/models';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly url = `${environment.apiUrl}/drugs`;
  constructor(private http: HttpClient) {}

  getMedicines(): Observable<Drug[]> {
    console.log('[InventoryService] GET', this.url);
    return this.http.get<Drug[]>(this.url).pipe(
      catchError(err => { console.error('[InventoryService] ERROR', err.status, err.message); return throwError(() => err); })
    );
  }
  getMedicineById(id: number): Observable<Drug> { return this.http.get<Drug>(`${this.url}/${id}`); }
  createMedicine(payload: DrugWriteRequest): Observable<Drug> { return this.http.post<Drug>(this.url, payload); }
  updateMedicine(id: number, payload: DrugWriteRequest): Observable<Drug> { return this.http.put<Drug>(`${this.url}/${id}`, payload); }
  deleteMedicine(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }
}
