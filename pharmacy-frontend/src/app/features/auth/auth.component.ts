import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
@Component({ selector: 'app-auth', standalone: false, template: `
<div class="auth-page"><div class="auth-art"><div class="auth-brand"><span class="brand-mark"><i class="bi bi-capsule"></i></span> Med<span>Flow</span></div><div class="art-copy"><p class="eyebrow">PHARMACY OPERATIONS</p><h1>Care, clarity,<br><em>connected.</em></h1><p>One calm workspace for the medicines, orders, and people that keep your pharmacy moving.</p></div><div class="art-note"><i class="bi bi-shield-check"></i> Secure access for your team</div></div><div class="auth-panel"><div class="auth-form-wrap"><div class="mobile-brand"><span class="brand-mark"><i class="bi bi-capsule"></i></span> Med<span>Flow</span></div><div class="auth-heading"><p class="eyebrow">WELCOME BACK</p><h2>{{ isRegister ? 'Create your account' : 'Sign in to MedFlow' }}</h2><p>{{ isRegister ? 'Set up your pharmacy workspace in a minute.' : 'Enter your details to continue to your workspace.' }}</p></div><div *ngIf="error" class="alert alert-danger py-2">{{ error }}</div><form [formGroup]="form" (ngSubmit)="submit()"><ng-container *ngIf="isRegister"><div class="mb-3"><label>Full name</label><input class="form-control" formControlName="name" placeholder="Dr. Alex Morgan"><small *ngIf="invalid('name')">Name is required.</small></div><div class="row"><div class="col-6 mb-3"><label>Phone</label><input class="form-control" formControlName="mobileNumber" placeholder="10-digit number"></div><div class="col-6 mb-3"><label>Role</label><select class="form-select" formControlName="role"><option value="Admin">Admin</option><option value="Doctor">Doctor</option></select></div></div></ng-container><div class="mb-3"><label>Email address</label><input class="form-control" type="email" formControlName="email" placeholder="you@pharmacy.com"><small *ngIf="invalid('email')">Enter a valid email.</small></div><div class="mb-4"><label>Password</label><input class="form-control" type="password" formControlName="password" placeholder="At least 6 characters"><small *ngIf="invalid('password')">Password must be at least 6 characters.</small></div><button class="btn btn-primary w-100 py-2" [disabled]="loading">{{ loading ? 'Please wait...' : (isRegister ? 'Create account' : 'Sign in') }} <i class="bi bi-arrow-right ms-2"></i></button></form><p class="switch-auth">{{ isRegister ? 'Already have an account?' : 'New to MedFlow?' }} <button (click)="toggle()">{{ isRegister ? 'Sign in' : 'Create an account' }}</button></p></div></div></div>`, styles: [`
.auth-page{min-height:100vh;display:grid;grid-template-columns:42% 58%;background:#fff}.auth-art{background:linear-gradient(145deg,#1e3a8a,#2563eb);padding:42px 9%;color:#fff;display:flex;flex-direction:column;position:relative;overflow:hidden}.auth-art:after{content:'';position:absolute;width:420px;height:420px;border:1px solid rgba(255,255,255,.18);border-radius:50%;right:-180px;bottom:-120px}.auth-brand,.mobile-brand{font-weight:800;font-size:1.3rem}.auth-brand span,.mobile-brand span{color:#93c5fd}.brand-mark{display:inline-grid;place-items:center;width:36px;height:36px;border-radius:10px;background:#fff;color:#2563eb;margin-right:8px}.art-copy{margin:auto 0;max-width:400px}.eyebrow{font-size:.72rem;letter-spacing:.13em;font-weight:700;color:#60a5fa}.auth-art .eyebrow{color:#bfdbfe}.art-copy h1{font-size:clamp(2.4rem,4vw,4.5rem);line-height:1.05;margin:18px 0}.art-copy em{font-style:normal;color:#a7f3d0}.art-copy p:not(.eyebrow){color:#dbeafe;line-height:1.7}.art-note{font-size:.82rem;color:#bfdbfe}.auth-panel{display:grid;place-items:center;padding:40px}.auth-form-wrap{width:min(420px,100%)}.mobile-brand{display:none;color:#2563eb}.auth-heading{margin-bottom:28px}.auth-heading h2{font-size:2rem;color:#0f172a;margin:8px 0}.auth-heading p:last-child{color:#64748b}.auth-form-wrap label{font-size:.8rem;font-weight:700;margin-bottom:7px}.auth-form-wrap small{color:#dc2626}.switch-auth{text-align:center;color:#64748b;margin-top:24px;font-size:.85rem}.switch-auth button{border:0;background:transparent;color:#2563eb;font-weight:700}@media(max-width:800px){.auth-page{display:block}.auth-art{display:none}.auth-panel{min-height:100vh;padding:28px 22px}.mobile-brand{display:block;margin-bottom:70px}.auth-heading h2{font-size:1.7rem}}
`]})
export class AuthComponent {
  isRegister = false; loading = false; error = '';
  form!: FormGroup;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      name: [''],
      mobileNumber: [''],
      role: ['Admin'],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  toggle() {
    this.isRegister = !this.isRegister;
    this.error = '';
    const name = this.form.get('name');
    const mobileNumber = this.form.get('mobileNumber');
    if (this.isRegister) {
      name?.setValidators([Validators.required, Validators.minLength(2), Validators.maxLength(100)]);
      mobileNumber?.setValidators([Validators.required, Validators.pattern(/^\d{10}$/)]);
    } else {
      name?.clearValidators();
      mobileNumber?.clearValidators();
    }
    name?.updateValueAndValidity();
    mobileNumber?.updateValueAndValidity();
  }
  invalid(control: string) { const field = this.form.get(control); return field?.invalid && field.touched; }
  submit() { this.form.markAllAsTouched(); if (this.form.invalid) return; this.loading = true; this.error = ''; const value = this.form.getRawValue(); const request = this.isRegister ? this.auth.register({ name: value.name || '', email: value.email || '', mobileNumber: value.mobileNumber || '', password: value.password || '', role: value.role || 'Admin' }) : this.auth.login({ email: value.email || '', password: value.password || '' }); request.subscribe({ next: () => { this.loading = false; if (this.isRegister) { this.isRegister = false; } else { this.router.navigate(['/dashboard']); } }, error: err => { this.loading = false; this.error = err.error?.message || 'Something went wrong. Please try again.'; } }); }
}
