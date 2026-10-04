import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
@Component({ selector: 'app-layout', standalone: false, template: `
<div class="app-shell" [class.sidebar-open]="sidebarOpen">
  <aside class="sidebar">
    <div class="brand"><span class="brand-mark"><i class="bi bi-capsule"></i></span><span>Med<span>Flow</span></span></div>
    <div class="workspace-label">WORKSPACE</div>
    <nav>
      <a routerLink="/dashboard" routerLinkActive="active"><i class="bi bi-grid-1x2-fill"></i> Dashboard</a>
      <a routerLink="/inventory" routerLinkActive="active"><i class="bi bi-box-seam-fill"></i> Inventory</a>
      <a routerLink="/orders" routerLinkActive="active"><i class="bi bi-receipt"></i> Orders</a>
      <a routerLink="/users" routerLinkActive="active"><i class="bi bi-people-fill"></i> Users</a>
      <a routerLink="/profile" routerLinkActive="active"><i class="bi bi-person-circle"></i> Profile</a>
    </nav>
    <button class="logout-link" (click)="logout()"><i class="bi bi-box-arrow-left"></i> Sign out</button>
    <div class="sidebar-footer"><div class="status-dot"></div><span>Systems operational</span></div>
  </aside>
  <main class="main-panel">
    <header class="topbar"><button class="menu-toggle" (click)="sidebarOpen = !sidebarOpen"><i class="bi bi-list"></i></button><div class="topbar-title">Pharmacy operations <span>/</span> {{ pageTitle }}</div><div class="top-actions"><button class="icon-button"><i class="bi bi-bell"></i></button><div class="user-chip"><div class="avatar">{{ initials }}</div><div class="d-none d-sm-block"><strong>{{ userName }}</strong><small>{{ role }}</small></div></div></div></header>
    <section class="content-wrap"><router-outlet /></section>
  </main>
</div>`, styles: [`
.app-shell{min-height:100vh;display:flex}.sidebar{width:250px;background:var(--sidebar);color:#cbd5e1;padding:24px 16px;display:flex;flex-direction:column;position:fixed;inset:0 auto 0 0;z-index:20}.brand{font-size:1.35rem;font-weight:800;color:#fff;display:flex;align-items:center;gap:10px;padding:0 10px 34px}.brand span span{color:#60a5fa}.brand-mark{background:#2563eb;border-radius:10px;width:35px;height:35px;display:grid;place-items:center}.workspace-label{font-size:.68rem;letter-spacing:.12em;color:#64748b;padding:0 12px 12px}nav{display:grid;gap:4px}nav a,.logout-link{display:flex;gap:12px;align-items:center;color:#94a3b8;text-decoration:none;border:0;background:transparent;padding:12px;border-radius:9px;font-size:.92rem;text-align:left}nav a:hover,nav a.active,.logout-link:hover{color:#fff;background:#334155}nav a.active{box-shadow:inset 3px 0 #60a5fa}.logout-link{margin-top:auto}.sidebar-footer{font-size:.72rem;color:#64748b;display:flex;gap:8px;align-items:center;padding:18px 10px 4px}.status-dot{width:7px;height:7px;background:#10b981;border-radius:50%}.main-panel{margin-left:250px;min-width:0;flex:1}.topbar{height:72px;background:#fff;border-bottom:1px solid var(--accent);display:flex;align-items:center;padding:0 32px;gap:18px}.topbar-title{font-size:.87rem;color:#64748b;flex:1}.topbar-title span{color:#cbd5e1;margin:0 8px}.top-actions{display:flex;align-items:center;gap:18px}.icon-button,.menu-toggle{border:0;background:transparent;color:#64748b;font-size:1.1rem}.user-chip{display:flex;align-items:center;gap:9px}.user-chip strong,.user-chip small{display:block}.user-chip strong{font-size:.82rem;color:#0f172a}.user-chip small{font-size:.7rem;color:#64748b;margin-top:2px}.avatar{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:#dbeafe;color:#1d4ed8;font-size:.75rem;font-weight:800}.menu-toggle{display:none}.content-wrap{padding:32px;max-width:1500px}.sidebar-footer{margin-top:20px}@media(max-width:900px){.sidebar{transform:translateX(-100%);transition:transform .2s}.sidebar-open .sidebar{transform:translateX(0)}.main-panel{margin-left:0}.menu-toggle{display:block}.topbar{padding:0 18px}.content-wrap{padding:22px 16px}}
`]})
export class LayoutComponent {
  sidebarOpen = false;
  constructor(private auth: AuthService, private router: Router) {}
  get userName() { return this.auth.currentUser?.name || 'Administrator'; }
  get role() { return this.auth.currentUser?.role || 'Admin'; }
  get initials() { return this.userName.slice(0, 2).toUpperCase(); }
  get pageTitle() { return this.router.url.split('/')[1] || 'dashboard'; }
  logout() { this.auth.logout(); }
}
