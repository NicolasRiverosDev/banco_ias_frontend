import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Outcome, UsageRequest } from './models';
import { UsageApiService } from './usage-api.service';

const authorized: UsageRequest = {
  requestReference: 'REF-001',
  preApprovedId: 'PRA-1001',
  customerId: 'USR-10',
  amount: 600000,
  status: 'AUTHORIZED',
  reasonCode: null,
  reasonMessage: null,
  processedAt: '2026-10-06T15:00:00Z',
  replayed: false,
};

describe('UsageApiService', () => {
  let service: UsageApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(UsageApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('envía la solicitud al backend y devuelve el resultado procesado', () => {
    let outcome: Outcome | undefined;
    service
      .submit({ requestReference: 'REF-001', preApprovedId: 'PRA-1001', customerId: 'USR-10', amount: 600000 })
      .subscribe((o) => (outcome = o));

    const req = http.expectOne('/api/usage-requests');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.amount).toBe(600000);
    req.flush(authorized, { status: 201, statusText: 'Created' });

    expect(outcome).toEqual({ kind: 'processed', request: authorized, httpStatus: 201 });
  });

  it('traduce un 409 de referencia repetida a un conflicto con la solicitud original', () => {
    let outcome: Outcome | undefined;
    service
      .submit({ requestReference: 'REF-001', preApprovedId: 'PRA-1001', customerId: 'USR-10', amount: 1 })
      .subscribe((o) => (outcome = o));

    http
      .expectOne('/api/usage-requests')
      .flush(
        { code: 'REFERENCE_CONFLICT', message: 'ya procesada', original: authorized },
        { status: 409, statusText: 'Conflict' },
      );

    expect(outcome?.kind).toBe('conflict');
    if (outcome?.kind === 'conflict') {
      expect(outcome.error.original?.amount).toBe(600000);
    }
  });

  it('informa un error legible cuando el backend no está disponible', () => {
    let outcome: Outcome | undefined;
    service.findByReference('REF-001').subscribe((o) => (outcome = o));

    http.expectOne('/api/usage-requests/REF-001').error(new ProgressEvent('error'), { status: 0 });

    expect(outcome?.kind).toBe('error');
    if (outcome?.kind === 'error') {
      expect(outcome.error.code).toBe('BACKEND_UNAVAILABLE');
    }
  });

  it('consulta las solicitudes recientes filtrando por cliente', () => {
    service.recent('USR-10', 5).subscribe();

    const req = http.expectOne((r) => r.url === '/api/usage-requests');
    expect(req.request.params.get('customerId')).toBe('USR-10');
    expect(req.request.params.get('limit')).toBe('5');
    req.flush([]);
  });
});
