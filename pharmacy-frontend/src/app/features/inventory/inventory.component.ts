import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InventoryService } from '../../core/services/inventory.service';
import { Drug, DrugWriteRequest } from '../../shared/models/models';
@Component({ selector: 'app-inventory', standalone: false, template: `
<div class="d-flex justify-content-between align-items-start mb-4"><div><p class="eyebrow mb-1">CATALOG</p><h1 class="page-heading mb-1">Inventory</h1><p class="text-secondary mb-0">Keep your medicine catalog accurate and healthy.</p></div><button class="btn btn-primary" (click)="openForm()"><i class="bi bi-plus-lg me-2"></i>Add medicine</button></div>
<div *ngIf="message" class="alert" [class.alert-success]="success" [class.alert-danger]="!success">{{ message }}</div>
<div class="card table-card"><div class="toolbar"><div class="search-box"><i class="bi bi-search"></i><input [(ngModel)]="search" placeholder="Search medicines..."></div><span class="result-count">{{ filtered.length }} medicines</span></div><div class="table-responsive"><table class="table mb-0"><thead><tr><th>ID</th><th>Medicine</th><th>Description</th><th>Price</th><th>Stock</th><th>Supplier ID</th><th></th></tr></thead><tbody><tr *ngFor="let drug of filtered"><td class="text-muted">#{{ drug.drugId }}</td><td><strong>{{ drug.drugName }}</strong></td><td>{{ drug.description || '—' }}</td><td>{{ drug.price | currency }}</td><td><span [class]="drug.stockQuantity <= 10 ? 'stock-low' : 'stock-ok'">{{ drug.stockQuantity }} units</span></td><td>{{ drug.supplierId }}</td><td class="text-end"><button class="action-btn" (click)="edit(drug)" title="Edit"><i class="bi bi-pencil"></i></button><button class="action-btn danger" (click)="remove(drug)" title="Delete"><i class="bi bi-trash3"></i></button></td></tr>
<tr *ngIf="loading"><td colspan="7" class="empty"><span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Loading medicines…</td></tr>
<tr *ngIf="!loading && !filtered.length"><td colspan="7" class="empty">No medicines found.</td></tr></tbody></table></div></div>
<div class="modal-backdrop-custom" *ngIf="showForm"><div class="form-modal"><div class="modal-head"><div><p class="eyebrow mb-1">{{ editing ? 'UPDATE RECORD' : 'NEW RECORD' }}</p><h4>{{ editing ? 'Edit medicine' : 'Add medicine' }}</h4></div><button class="close-btn" (click)="showForm=false"><i class="bi bi-x-lg"></i></button></div><form [formGroup]="form" (ngSubmit)="save()"><div class="mb-3"><label>Medicine name</label><input class="form-control" formControlName="drugName" placeholder="e.g. Amoxicillin 500mg"></div><div class="mb-3"><label>Description / category</label><input class="form-control" formControlName="description" placeholder="Antibiotic, pain relief..."></div><div class="row"><div class="col-6 mb-3"><label>Price</label><input class="form-control" type="number" formControlName="price"></div><div class="col-6 mb-3"><label>Quantity</label><input class="form-control" type="number" formControlName="stockQuantity"></div></div><div class="mb-4"><label>Supplier ID</label><input class="form-control" type="number" formControlName="supplierId" placeholder="Supplier ID"></div><button class="btn btn-primary w-100">{{ editing ? 'Save changes' : 'Create medicine' }}</button></form></div></div>`, styles: [`
.eyebrow{font-size:.7rem;letter-spacing:.12em;color:#2563eb;font-weight:800}.table-card{overflow:hidden}.toolbar{display:flex;justify-content:space-between;padding:18px 20px;border-bottom:1px solid var(--accent)}.search-box{position:relative;width:min(320px,100%)}.search-box i{position:absolute;left:12px;top:10px;color:#94a3b8}.search-box input{width:100%;border:1px solid var(--accent);border-radius:8px;padding:8px 12px 8px 34px;font-size:.8rem}.result-count{font-size:.78rem;color:#94a3b8}.table th{font-size:.68rem;text-transform:uppercase;color:#94a3b8}.table td{font-size:.8rem;color:#64748b}.table strong{color:#334155}.stock-low,.stock-ok{font-size:.72rem;padding:5px 8px;border-radius:6px;font-weight:700}.stock-low{background:#fee2e2;color:#b91c1c}.stock-ok{background:#d1fae5;color:#047857}.action-btn{border:0;background:transparent;color:#64748b;padding:6px}.action-btn:hover{color:#2563eb}.action-btn.danger:hover{color:#dc2626}.empty{text-align:center;padding:34px!important;color:#94a3b8!important}.modal-backdrop-custom{position:fixed;inset:0;background:rgba(15,23,42,.45);z-index:50;display:grid;place-items:center;padding:20px}.form-modal{background:#fff;border-radius:14px;width:min(500px,100%);padding:24px;box-shadow:0 20px 60px rgba(15,23,42,.2)}.modal-head{display:flex;justify-content:space-between;margin-bottom:22px}.modal-head h4{margin:0;color:#0f172a}.close-btn{border:0;background:transparent;color:#94a3b8}.form-modal label{font-size:.78rem;font-weight:700;margin-bottom:6px}
` ]})
export class InventoryComponent implements OnInit {
  drugs: Drug[] = []; search = ''; showForm = false; editing: Drug | null = null; message = ''; success = false; loading = false;
  form!: FormGroup;

  constructor(private inventory: InventoryService, private fb: FormBuilder) {
    this.form = this.fb.group({
      drugName: ['', Validators.required],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      stockQuantity: [0, [Validators.required, Validators.min(0)]],
      supplierId: [1, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit() { this.load(); }
  load() {
    this.loading = true;
    this.inventory.getMedicines().subscribe({
      next: data => { this.drugs = Array.isArray(data) ? data : []; console.debug('[Inventory] component state', this.drugs); },
      error: err => { this.drugs = []; this.message = err.error?.message || 'Unable to load inventory.'; this.success = false; this.loading = false; },
      complete: () => this.loading = false
    });
  }
  get filtered() { const query = this.search.toLowerCase(); return this.drugs.filter(d => `${d.drugName || ''} ${d.description || ''}`.toLowerCase().includes(query)); }
  openForm() { this.editing = null; this.form.reset({ drugName: '', description: '', price: 0, stockQuantity: 0, supplierId: 1 }); this.showForm = true; }
  edit(drug: Drug) { this.editing = drug; this.form.patchValue(drug); this.showForm = true; }
  save() { if (this.form.invalid) { this.form.markAllAsTouched(); return; } const value = this.form.getRawValue(); const payload: DrugWriteRequest = { drugName: value.drugName ?? '', description: value.description ?? '', price: Number(value.price ?? 0), stockQuantity: Number(value.stockQuantity ?? 0), supplierId: Number(value.supplierId ?? 1) }; const request = this.editing ? this.inventory.updateMedicine(this.editing.drugId, payload) : this.inventory.createMedicine(payload); request.subscribe({ next: () => { this.showForm = false; this.success = true; this.message = this.editing ? 'Medicine updated.' : 'Medicine created.'; this.load(); }, error: err => { this.success = false; this.message = err.error?.message || 'Unable to save medicine.'; } }); }
  remove(drug: Drug) { if (!confirm(`Delete ${drug.drugName}?`)) return; this.inventory.deleteMedicine(drug.drugId).subscribe({ next: () => { this.success = true; this.message = 'Medicine deleted.'; this.load(); }, error: err => { this.success = false; this.message = err.error?.message || 'Unable to delete medicine.'; } }); }
}
