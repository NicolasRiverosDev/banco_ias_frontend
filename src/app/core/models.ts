/** Contratos del API del backend (ver backend/.../infrastructure/web/dto). */

export type UsageStatus = 'AUTHORIZED' | 'REJECTED';

export interface CreateUsageRequest {
  requestReference: string;
  preApprovedId: string;
  customerId: string;
  amount: number;
}

export interface UsageRequest {
  requestReference: string;
  preApprovedId: string;
  customerId: string;
  amount: number;
  status: UsageStatus;
  reasonCode: string | null;
  reasonMessage: string | null;
  processedAt: string;
  /** true cuando la referencia ya existía y el backend devolvió la solicitud original. */
  replayed: boolean;
}

export interface PreApproved {
  id: string;
  customerId: string;
  status: 'ACTIVE' | 'BLOCKED';
  availableAmount: number;
}

export interface ApiError {
  code: string;
  message: string;
  timestamp?: string;
  details?: string[];
  /** Solicitud original, cuando la referencia ya existía con otros datos (409). */
  original?: UsageRequest;
}

/** Lo que la interfaz muestra después de enviar o consultar una solicitud. */
export type Outcome =
  | { kind: 'processed'; request: UsageRequest; httpStatus: number }
  | { kind: 'conflict'; error: ApiError }
  | { kind: 'error'; error: ApiError; httpStatus: number };
