export interface LoginResponse { token: string; email: string; role: string; }
export interface User { id: string; name: string; email: string; mobileNumber: string; role: string; createdOn?: string; status?: string; }
export interface Drug { drugId: number; drugName: string; description: string; price: number; stockQuantity: number; supplierId: number; supplier?: { supplierId?: number; supplierName: string; email?: string; phone?: string }; }
export interface DrugWriteRequest { drugName: string; description: string; price: number; stockQuantity: number; supplierId: number; }
export interface OrderItem { id?: string; drugId: number; quantity: number; unitPrice?: number; }
export interface Order { id: string; userId: string; orderDate: string; status: string; totalAmount: number; items: OrderItem[]; }
