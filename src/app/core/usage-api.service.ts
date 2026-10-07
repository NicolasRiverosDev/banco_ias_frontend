import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { ApiError, CreateUsageRequest, Outcome, PreApproved, UsageRequest } from './models';

/**
 * Cliente HTTP del core de preaprobados. Las rutas son relativas (/api/...) y en desarrollo
 * el servidor de Angular las reenvía al backend mediante proxy.conf.json.
 */
@Injectable({ providedIn: 'root' })
export class UsageApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api';

  /** Envía una solicitud y traduce cualquier respuesta (201, 200, 409, 400, error de red) a un Outcome. */
  submit(request: CreateUsageRequest): Observable<Outcome> {
    return this.http
      .post<UsageRequest>(`${this.baseUrl}/usage-requests`, request, { observe: 'response' })
      .pipe(
        map((response): Outcome => ({
          kind: 'processed',
          request: response.body as UsageRequest,
          httpStatus: response.status,
        })),
        catchError((error: HttpErrorResponse) => of(toErrorOutcome(error))),
      );
  }

  findByReference(reference: string): Observable<Outcome> {
    return this.http
      .get<UsageRequest>(`${this.baseUrl}/usage-requests/${encodeURIComponent(reference)}`, {
        observe: 'response',
      })
      .pipe(
        map((response): Outcome => ({
          kind: 'processed',
          request: response.body as UsageRequest,
          httpStatus: response.status,
        })),
        catchError((error: HttpErrorResponse) => of(toErrorOutcome(error))),
      );
  }

  recent(customerId: string | null, limit = 20): Observable<UsageRequest[]> {
    let params = new HttpParams().set('limit', limit);
    if (customerId) {
      params = params.set('customerId', customerId);
    }
    return this.http.get<UsageRequest[]>(`${this.baseUrl}/usage-requests`, { params });
  }

  preApproved(customerId: string): Observable<PreApproved[]> {
    const params = new HttpParams().set('customerId', customerId);
    return this.http.get<PreApproved[]>(`${this.baseUrl}/pre-approved`, { params });
  }
}

function toErrorOutcome(error: HttpErrorResponse): Outcome {
  const body = error.error as ApiError | null;
  if (error.status === 409 && body?.code === 'REFERENCE_CONFLICT') {
    return { kind: 'conflict', error: body };
  }
  if (body && typeof body === 'object' && 'code' in body) {
    return { kind: 'error', error: body, httpStatus: error.status };
  }
  return {
    kind: 'error',
    httpStatus: error.status,
    error: {
      code: error.status === 0 ? 'BACKEND_UNAVAILABLE' : `HTTP_${error.status}`,
      message:
        error.status === 0
          ? 'No fue posible conectar con el backend. ¿Está ejecutándose en http://localhost:8080?'
          : 'Ocurrió un error inesperado',
    },
  };
}
