import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { User } from '../../shared/models/models';
@Component({ selector: 'app-profile', standalone: false, template: `
<div class="mb-4"><p class="eyebrow mb-1">ACCOUNT</p><h1 class="page-heading mb-1">Profile</h1><p class="text-secondary mb-0">Your personal details and workspace access.</p></div>
<div *ngIf="error" class="alert alert-warning" role="alert">{{ error }}</div>
<div *ngIf="loading" class="text-secondary small mb-3"><span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Loading profile from the API…</div>
<div class="row g-4"><div class="col-lg-4"><div class="card profile-card text-center"><div class="profile-avatar">{{ initials }}</div><h4>{{ user?.name || 'Administrator' }}</h4><p>{{ user?.email }}</p><span class="role-badge">{{ user?.role || 'Admin' }}</span></div></div><div class="col-lg-8"><div class="card p-4"><h5 class="mb-1">Personal information</h5><p class="text-secondary small mb-4">Profile details are loaded from the backend.</p>
<form [formGroup]="form"><div class="row"><div class="col-md-6 mb-3"><label>Full name</label><input class="form-control" formControlName="name" readonly></div><div class="col-md-6 mb-3"><label>Email address</label><input class="form-control" formControlName="email" readonly></div><div class="col-md-6 mb-4"><label>Phone number</label><input class="form-control" formControlName="mobileNumber" readonly></div><div class="col-md-6 mb-4"><label>Role</label><input class="form-control" formControlName="role" readonly></div></div>
<p class="text-secondary small mb-0">Profile editing is unavailable because the backend currently exposes no profile-update endpoint.</p>
</form></div></div></div>`, styles: [`
.eyebrow{font-size:.7rem;letter-spacing:.12em;color:#2563eb;font-weight:800}.profile-card{padding:32px 20px}.profile-avatar{width:74px;height:74px;display:grid;place-items:center;margin:0 auto 18px;border-radius:22px;background:#dbeafe;color:#2563eb;font-weight:800;font-size:1.4rem}.profile-card h4{font-size:1.1rem;color:#0f172a}.profile-card p{font-size:.82rem;color:#64748b}.role-badge{font-size:.72rem;padding:6px 9px;background:#ede9fe;color:#6d28d9;border-radius:6px;font-weight:700}.card label{font-size:.78rem;font-weight:700;margin-bottom:6px}
` ]})
export class ProfileComponent implements OnInit {
  user: User | null = null; loading = false; error = ''; form!: FormGroup;

  constructor(private auth: AuthService, private users: UserService, private fb: FormBuilder) {
    this.user = this.auth.currentUser;
    this.form = this.fb.group({
      name: [this.user?.name || '', Validators.required],
      email: [{ value: this.user?.email || '', disabled: true }],
      mobileNumber: [this.user?.mobileNumber || ''],
      role: [{ value: this.user?.role || 'Admin', disabled: true }]
    });
  }

  ngOnInit() {
    const email = this.auth.currentUser?.email;
    if (!email) { this.error = 'Sign in again to load your profile.'; return; }
    this.loading = true;
    this.users.getUsers().subscribe({
      next: users => {
        const profile = Array.isArray(users)
          ? users.find(user => user.email?.toLowerCase() === email.toLowerCase())
          : undefined;
        if (!profile) { this.error = 'Your profile was not found in the users response.'; return; }
        this.user = profile;
        this.form.patchValue({ name: profile.name, email: profile.email, mobileNumber: profile.mobileNumber, role: profile.role });
        console.debug('[Profile] component state', this.user);
      },
      error: err => { this.error = err.error?.message || 'Unable to load your profile from the API.'; },
      complete: () => this.loading = false
    });
  }

  get initials() { return (this.user?.name || 'AD').slice(0, 2).toUpperCase(); }
}
