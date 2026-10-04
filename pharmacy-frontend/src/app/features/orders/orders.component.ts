import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InventoryService } from '../../core/services/inventory.service';
import { OrderService } from '../../core/services/order.service';
import { Drug, Order } from '../../shared/models/models';
@Component({ selector: 'app-orders', standalone: false, template: `
<div class="d-flex justify-content-between align-items-start mb-4"><div><p class="eyebrow mb-1">FULFILLMENT</p><h1 class="page-heading mb-1">Orders</h1><p class="text-secondary mb-0">Track and place medicine orders.</p></div><button class="btn btn-primary" (click)="showForm=true"><i class="bi bi-plus-lg me-2"></i>Place order</button></div><div *ngIf="message" class="alert" [class.alert-success]="success" [class.alert-danger]="!success">{{ message }}</div><div class="card table-card"><div class="toolbar"><div class="search-box"><i class="bi bi-search"></i><input [(ngModel)]="search" placeholder="Search order status..."></div><span class="result-count">{{ filtered.length }} orders</span></div><div class="table-responsive"><table class="table mb-0"><thead><tr><th>Order ID</th><th>Order date</th><th>Items</th><th>Total</th><th>Status</th><th></th></tr></thead><tbody><tr *ngFor="let order of filtered"><td><strong>#{{ order.id | slice:0:8 }}</strong></td><td>{{ order.orderDate | date:'MMM d, y, h:mm a' }}</td><td>{{ order.items?.length || 0 }} medicines</td><td class="fw-semibold">{{ order.totalAmount | currency }}</td><td><span [ngClass]="['badge', statusClass(order.status)]">{{ order.status }}</span></td><td class="text-end"><button class="action-btn danger" (click)="remove(order)"><i class="bi bi-trash3"></i></button></td></tr>
<tr *ngIf="loading"><td colspan="6" class="empty"><span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Loading orders…</td></tr>
<tr *ngIf="!loading && !filtered.length"><td colspan="6" class="empty">No orders yet. Place your first order to see it here.</td></tr></tbody></table></div></div><div class="modal-backdrop-custom" *ngIf="showForm"><div class="form-modal"><div class="modal-head"><div><p class="eyebrow mb-1">NEW ORDER</p><h4>Place an order</h4></div><button class="close-btn" (click)="showForm=false"><i class="bi bi-x-lg"></i></button></div><form [formGroup]="form" (ngSubmit)="save()"><div class="mb-3"><label>Medicine</label><select class="form-select" formControlName="drugId"><option [ngValue]="null">Select a medicine</option><option *ngFor="let drug of drugs" [ngValue]="drug.drugId">{{ drug.drugName }} ({{ drug.stockQuantity }} available)</option></select></div><div class="mb-4"><label>Quantity</label><input class="form-control" type="number" formControlName="quantity" min="1"></div><button class="btn btn-primary w-100" [disabled]="form.invalid">Submit order</button></form></div></div>`, styles: [`
.eyebrow{font-size:.7rem;letter-spacing:.12em;color:#2563eb;font-weight:800}.table-card{overflow:hidden}.toolbar{display:flex;justify-content:space-between;padding:18px 20px;border-bottom:1px solid var(--accent)}.search-box{position:relative;width:min(320px,100%)}.search-box i{position:absolute;left:12px;top:10px;color:#94a3b8}.search-box input{width:100%;border:1px solid var(--accent);border-radius:8px;padding:8px 12px 8px 34px;font-size:.8rem}.result-count{font-size:.78rem;color:#94a3b8}.table th{font-size:.68rem;text-transform:uppercase;color:#94a3b8}.table td{font-size:.8rem;color:#64748b}.table strong{color:#334155}.badge{padding:6px 9px}.status-pending{background:#fef3c7;color:#a16207}.status-completed{background:#d1fae5;color:#047857}.status-cancelled{background:#fee2e2;color:#b91c1c}.action-btn{border:0;background:transparent;color:#64748b;padding:6px}.danger:hover{color:#dc2626}.empty{text-align:center;padding:34px!important;color:#94a3b8!important}.modal-backdrop-custom{position:fixed;inset:0;background:rgba(15,23,42,.45);z-index:50;display:grid;place-items:center;padding:20px}.form-modal{background:#fff;border-radius:14px;width:min(500px,100%);padding:24px;box-shadow:0 20px 60px rgba(15,23,42,.2)}.modal-head{display:flex;justify-content:space-between;margin-bottom:22px}.modal-head h4{margin:0;color:#0f172a}.close-btn{border:0;background:transparent;color:#94a3b8}.form-modal label{font-size:.78rem;font-weight:700;margin-bottom:6px}
` ]})
export class OrdersComponent implements OnInit {
  orders: Order[] = []; drugs: Drug[] = []; search = ''; showForm = false; message = ''; success = false; loading = false;
  form!: FormGroup;

  constructor(private orderService: OrderService, private inventory: InventoryService, private fb: FormBuilder) {
    this.form = this.fb.group({
      drugId: [null as number | null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit() {
    this.load();
    this.inventory.getMedicines().subscribe({
      next: data => { this.drugs = Array.isArray(data) ? data : []; console.debug('[Orders] medicine options', this.drugs); },
      error: err => { this.message = err.error?.message || 'Unable to load medicines for order entry.'; this.success = false; }
    });
  }
  load() {
    this.loading = true;
    this.orderService.getOrders().subscribe({
      next: data => { this.orders = Array.isArray(data) ? data : []; console.debug('[Orders] component state', this.orders); },
      error: err => { this.orders = []; this.message = err.error?.message || 'Unable to load orders.'; this.success = false; this.loading = false; },
      complete: () => this.loading = false
    });
  }
  get filtered() { return this.orders.filter(o => (o.status || '').toLowerCase().includes(this.search.toLowerCase())); }
  statusClass(status: string) { return `status-${(status || 'pending').toLowerCase()}`; }
  save() { if (this.form.invalid) return; const value = this.form.getRawValue() as { drugId: number | null; quantity: number | null }; if (value.drugId == null || value.quantity == null) return; this.orderService.createOrder({ items: [{ drugId: value.drugId, quantity: value.quantity }] }).subscribe({ next: () => { this.showForm = false; this.success = true; this.message = 'Order placed successfully.'; this.form.reset({ drugId: null, quantity: 1 }); this.load(); }, error: err => { this.success = false; this.message = err.error?.message || 'Unable to place order.'; } }); }
  remove(order: Order) { if (!confirm('Delete this order?')) return; this.orderService.deleteOrder(order.id).subscribe({ next: () => this.load(), error: err => { this.success = false; this.message = err.error?.message || 'Unable to delete order.'; } }); }
}
