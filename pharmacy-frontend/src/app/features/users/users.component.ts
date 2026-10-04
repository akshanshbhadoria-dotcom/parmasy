import { Component, OnInit } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { User } from '../../shared/models/models';
@Component({ selector: 'app-users', standalone: false, template: `
<div class="d-flex justify-content-between align-items-start mb-4"><div><p class="eyebrow mb-1">TEAM DIRECTORY</p><h1 class="page-heading mb-1">Users</h1><p class="text-secondary mb-0">Manage the people with access to your workspace.</p></div></div><div *ngIf="message" class="alert alert-danger">{{ message }}</div><div class="card table-card"><div class="toolbar"><div class="search-box"><i class="bi bi-search"></i><input [(ngModel)]="search" (ngModelChange)="setSearch($event)" placeholder="Search users..."></div><span class="result-count">{{ filtered.length }} users</span></div><div class="table-responsive"><table class="table mb-0"><thead><tr><th>User</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th></tr></thead><tbody><tr *ngFor="let user of pagedUsers"><td><div class="user-cell"><div class="avatar">{{ (user.name || '??').slice(0,2).toUpperCase() }}</div><strong>{{ user.name }}</strong></div></td><td>{{ user.email }}</td><td>{{ user.mobileNumber }}</td><td><span class="role-badge">{{ user.role }}</span></td><td>{{ user.createdOn | date:'MMM d, y' }}</td></tr><tr *ngIf="loading"><td colspan="5" class="empty"><span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Loading users…</td></tr><tr *ngIf="!loading && !filtered.length"><td colspan="5" class="empty">No users found. The backend currently exposes read-only user listing.</td></tr></tbody></table></div><div *ngIf="filtered.length" class="d-flex justify-content-end align-items-center gap-3 mt-3"><button class="btn btn-outline-secondary btn-sm" (click)="changePage(page - 1)" [disabled]="page === 1">Previous</button><span class="small text-secondary">{{ page }} / {{ pageCount }}</span><button class="btn btn-outline-secondary btn-sm" (click)="changePage(page + 1)" [disabled]="page === pageCount">Next</button></div></div>`, styles: [`
.eyebrow{font-size:.7rem;letter-spacing:.12em;color:#2563eb;font-weight:800}.table-card{overflow:hidden}.toolbar{display:flex;justify-content:space-between;padding:18px 20px;border-bottom:1px solid var(--accent)}.search-box{position:relative;width:min(320px,100%)}.search-box i{position:absolute;left:12px;top:10px;color:#94a3b8}.search-box input{width:100%;border:1px solid var(--accent);border-radius:8px;padding:8px 12px 8px 34px;font-size:.8rem}.result-count{font-size:.78rem;color:#94a3b8}.table th{font-size:.68rem;text-transform:uppercase;color:#94a3b8}.table td{font-size:.8rem;color:#64748b}.table strong{color:#334155}.user-cell{display:flex;align-items:center;gap:10px}.avatar{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:#dbeafe;color:#2563eb;font-size:.68rem;font-weight:800}.role-badge{font-size:.72rem;padding:5px 8px;background:#ede9fe;color:#6d28d9;border-radius:6px;font-weight:700}.empty{text-align:center;padding:34px!important;color:#94a3b8!important}
` ]})
export class UsersComponent implements OnInit {
  users: User[] = []; search = ''; message = ''; loading = false; page = 1; pageSize = 10;
  constructor(private userService: UserService) {}
  ngOnInit() {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: data => { this.users = Array.isArray(data) ? data : []; console.debug('[Users] component state', this.users); },
      error: err => { this.users = []; this.message = err.error?.message || 'Unable to load users.'; this.loading = false; },
      complete: () => this.loading = false
    });
  }
  get filtered() {
    const query = this.search.trim().toLowerCase();
    return this.users.filter(user => `${user.name || ''} ${user.email || ''} ${user.role || ''} ${user.mobileNumber || ''}`.toLowerCase().includes(query));
  }
  get pagedUsers() { return this.filtered.slice((this.page - 1) * this.pageSize, this.page * this.pageSize); }
  get pageCount() { return Math.max(1, Math.ceil(this.filtered.length / this.pageSize)); }
  setSearch(value: string) { this.search = value; this.page = 1; }
  changePage(page: number) { this.page = Math.min(Math.max(page, 1), this.pageCount); }
}
