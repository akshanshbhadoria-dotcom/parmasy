import { Component, OnInit } from '@angular/core';
import { InventoryService } from '../../core/services/inventory.service';
import { OrderService } from '../../core/services/order.service';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { Drug, Order, User } from '../../shared/models/models';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  template: `
    <div class="d-flex justify-content-between align-items-start mb-4">
      <div>
        <p class="eyebrow mb-1">OVERVIEW</p>
        <h1 class="page-heading mb-1">Good morning, {{ firstName }}.</h1>
        <p class="text-secondary mb-0">Here is what is happening across your pharmacy today.</p>
      </div>
      <span class="date-pill"><i class="bi bi-calendar3 me-2"></i>{{ today | date:'MMM d, y' }}</span>
    </div>
    <div class="row g-3 mb-4">
      <div class="col-sm-6 col-xl-3" *ngFor="let stat of stats">
        <div class="card stat-card h-100">
          <div class="stat-icon" [ngClass]="stat.color"><i class="bi" [ngClass]="stat.icon"></i></div>
          <div class="stat-label">{{ stat.label }}</div>
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-trend"><i class="bi bi-arrow-up-right"></i> {{ stat.note }}</div>
        </div>
      </div>
    </div>
    <div *ngIf="errors.length" class="alert alert-warning">{{ errors.join(' ') }}</div>
    <div class="row g-4">
      <div class="col-xl-7">
        <div class="card table-card">
          <div class="card-header">
            <div><h5>Recent orders</h5><span>Latest activity from your pharmacy</span></div>
            <a routerLink="/orders">View all <i class="bi bi-arrow-up-right"></i></a>
          </div>
          <div class="table-responsive">
            <table class="table mb-0">
              <thead><tr><th>Order</th><th>Date</th><th>Items</th><th>Status</th><th class="text-end">Amount</th></tr></thead>
              <tbody>
                <tr *ngFor="let order of orders.slice(0,5)">
                  <td><strong>#{{ order.id | slice:0:8 }}</strong></td>
                  <td>{{ order.orderDate | date:'MMM d, y' }}</td>
                  <td>{{ order.items?.length || 0 }} items</td>
                  <td><span [ngClass]="['badge', statusClass(order.status)]">{{ order.status || 'Pending' }}</span></td>
                  <td class="text-end fw-semibold">{{ (order.totalAmount || 0) | currency }}</td>
                </tr>
                <tr *ngIf="!ordersLoading && !orders.length"><td colspan="5" class="empty">No recent orders found.</td></tr>
                <tr *ngIf="ordersLoading"><td colspan="5" class="empty"><span class="spinner-border spinner-border-sm me-2"></span>Loading orders...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="col-xl-5">
        <div class="card table-card">
          <div class="card-header">
            <div><h5>Low stock</h5><span>Medicines that need attention</span></div>
            <a routerLink="/inventory">Manage <i class="bi bi-arrow-up-right"></i></a>
          </div>
          <div class="low-stock" *ngFor="let drug of lowStock">
            <div class="medicine-icon"><i class="bi bi-capsule"></i></div>
            <div class="flex-grow-1">
              <strong>{{ drug.drugName }}</strong>
              <small>{{ drug.supplier?.supplierName || 'General stock' }}</small>
            </div>
            <span class="stock-count">{{ drug.stockQuantity }} left</span>
          </div>
          <div *ngIf="!drugsLoading && !lowStock.length" class="empty">All medicines are well stocked.</div>
          <div *ngIf="drugsLoading" class="empty"><span class="spinner-border spinner-border-sm me-2"></span>Loading...</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .eyebrow{font-size:.7rem;letter-spacing:.12em;color:#2563eb;font-weight:800}
    .date-pill{background:#fff;border:1px solid var(--accent);border-radius:8px;padding:9px 13px;font-size:.8rem;color:#64748b}
    .stat-card{padding:20px}.stat-icon{width:38px;height:38px;border-radius:10px;display:grid;place-items:center;margin-bottom:18px}
    .blue{color:#2563eb;background:#dbeafe}.green{color:#059669;background:#d1fae5}.amber{color:#d97706;background:#fef3c7}.violet{color:#7c3aed;background:#ede9fe}
    .stat-label{font-size:.78rem;color:#64748b}.stat-value{font-size:1.8rem;font-weight:800;color:#0f172a;margin:3px 0}.stat-trend{font-size:.72rem;color:#059669}
    .table-card{overflow:hidden}.card-header{background:#fff;border-bottom:1px solid var(--accent);padding:18px 20px;display:flex;justify-content:space-between;align-items:center}
    .card-header h5{font-size:1rem;margin:0;color:#0f172a}.card-header span{font-size:.75rem;color:#94a3b8}.card-header a{font-size:.78rem;color:#2563eb;text-decoration:none}
    .table thead th{font-size:.68rem;letter-spacing:.04em;text-transform:uppercase;color:#94a3b8;font-weight:700;border-bottom-width:1px}
    .table tbody td{font-size:.8rem;color:#64748b}.table tbody strong{color:#334155}
    .badge{padding:6px 9px}.status-pending{background:#fef3c7;color:#a16207}.status-completed{background:#d1fae5;color:#047857}.status-cancelled{background:#fee2e2;color:#b91c1c}
    .empty{text-align:center;padding:28px!important;color:#94a3b8!important}
    .low-stock{display:flex;gap:12px;align-items:center;padding:15px 20px;border-bottom:1px solid #f1f5f9}
    .medicine-icon{width:34px;height:34px;display:grid;place-items:center;background:#eff6ff;color:#2563eb;border-radius:9px}
    .low-stock strong,.low-stock small{display:block}.low-stock strong{font-size:.82rem;color:#334155}.low-stock small{font-size:.7rem;color:#94a3b8;margin-top:3px}
    .stock-count{font-size:.72rem;font-weight:700;color:#dc2626;background:#fee2e2;padding:5px 7px;border-radius:6px}
  `]
})
export class DashboardComponent implements OnInit {
  today = new Date();
  drugs: Drug[] = [];
  orders: Order[] = [];
  users: User[] = [];
  drugsLoading = true;
  ordersLoading = true;
  usersLoading = true;
  errors: string[] = [];

  constructor(
    private inventory: InventoryService,
    private orderService: OrderService,
    private userService: UserService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    console.log('[Dashboard] ngOnInit called - fetching from 3 microservices...');

    this.inventory.getMedicines().subscribe({
      next: data => {
        this.drugs = Array.isArray(data) ? data : [];
        this.drugsLoading = false;
        console.log('[Dashboard] drugs loaded:', this.drugs.length);
      },
      error: err => {
        this.drugs = [];
        this.drugsLoading = false;
        this.errors.push('Could not load medicines.');
        console.error('[Dashboard] drugs error:', err);
      }
    });

    this.orderService.getOrders().subscribe({
      next: data => {
        this.orders = Array.isArray(data) ? data : [];
        this.ordersLoading = false;
        console.log('[Dashboard] orders loaded:', this.orders.length);
      },
      error: err => {
        this.orders = [];
        this.ordersLoading = false;
        this.errors.push('Could not load orders.');
        console.error('[Dashboard] orders error:', err);
      }
    });

    this.userService.getUsers().subscribe({
      next: data => {
        this.users = Array.isArray(data) ? data : [];
        this.usersLoading = false;
        console.log('[Dashboard] users loaded:', this.users.length);
      },
      error: err => {
        this.users = [];
        this.usersLoading = false;
        this.errors.push('Could not load users.');
        console.error('[Dashboard] users error:', err);
      }
    });
  }

  get lowStock(): Drug[] {
    return this.drugs.filter(d => d.stockQuantity <= 10).slice(0, 5);
  }

  get firstName(): string {
    const u = this.auth.currentUser;
    return u?.name?.split(' ')[0] || u?.email?.split('@')[0] || 'there';
  }

  get stats() {
    return [
      { label: 'Total medicines',     value: this.drugsLoading  ? '…' : String(this.drugs.length),                                     icon: 'bi-capsule',     color: 'blue',   note: 'Live inventory'    },
      { label: 'Available medicines', value: this.drugsLoading  ? '…' : String(this.drugs.filter(d => d.stockQuantity > 0).length),     icon: 'bi-check2-circle', color: 'green', note: 'In stock now'    },
      { label: 'Total orders',        value: this.ordersLoading ? '…' : String(this.orders.length),                                     icon: 'bi-receipt',     color: 'amber',  note: 'Order history'     },
      { label: 'Total users',         value: this.usersLoading  ? '…' : String(this.users.length),                                      icon: 'bi-people',      color: 'violet', note: 'Registered users'  }
    ];
  }

  statusClass(status: string): string {
    return `status-${(status || 'pending').toLowerCase()}`;
  }
}
 