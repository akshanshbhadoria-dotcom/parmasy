import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Order } from '../../shared/models/models';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly url = `${environment.apiUrl}/orders`;
  constructor(private http: HttpClient) {}

  getOrders(): Observable<Order[]> {
    const target = `${this.url}/history`;
    console.log('[OrderService] GET', target);
    return this.http.get<Order[]>(target).pipe(
      catchError(err => { console.error('[OrderService] ERROR', err.status, err.message); return throwError(() => err); })
    );
  }
  getOrderById(id: string): Observable<Order> { return this.http.get<Order>(`${this.url}/${id}`); }
  createOrder(payload: { items: { drugId: number; quantity: number }[] }): Observable<Order> { return this.http.post<Order>(this.url, payload); }
  updateOrder(id: string, payload: { items: { drugId: number; quantity: number }[] }): Observable<Order> { return this.http.put<Order>(`${this.url}/${id}`, payload); }
  deleteOrder(id: string): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }
  verifyOrder(id: string): Observable<Order> { return this.http.patch<Order>(`${this.url}/${id}/verify`, {}); }
}
