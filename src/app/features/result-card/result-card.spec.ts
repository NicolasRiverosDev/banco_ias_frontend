import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Outcome, UsageRequest } from '../../core/models';
import { ResultCard } from './result-card';

const base: UsageRequest = {
  requestReference: 'REF-001',
  preApprovedId: 'PRA-1002',
  customerId: 'USR-10',
  amount: 1000,
  status: 'REJECTED',
  reasonCode: 'PRE_APPROVED_NOT_ACTIVE',
  reasonMessage: 'El preaprobado no se encuentra habilitado',
  processedAt: '2026-10-06T15:00:00Z',
  replayed: false,
};

describe('ResultCard', () => {
  let fixture: ComponentFixture<ResultCard>;

  function render(outcome: Outcome | null): string {
    fixture.componentRef.setInput('outcome', outcome);
    fixture.detectChanges();
    return (fixture.nativeElement as HTMLElement).textContent ?? '';
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ResultCard] });
    fixture = TestBed.createComponent(ResultCard);
  });

  it('muestra un rechazo con su razón', () => {
    const text = render({ kind: 'processed', request: base, httpStatus: 201 });
    expect(text).toContain('RECHAZADA');
    expect(text).toContain('El preaprobado no se encuentra habilitado');
  });

  it('indica cuando la referencia ya existía y se devolvió la original', () => {
    const text = render({
      kind: 'processed',
      request: { ...base, status: 'AUTHORIZED', reasonCode: null, reasonMessage: null, replayed: true },
      httpStatus: 200,
    });
    expect(text).toContain('AUTORIZADA');
    expect(text).toContain('Referencia repetida');
  });

  it('muestra el conflicto de referencia con la solicitud original conservada', () => {
    const text = render({
      kind: 'conflict',
      error: { code: 'REFERENCE_CONFLICT', message: 'ya procesada con información diferente', original: base },
    });
    expect(text).toContain('CONFLICTO DE REFERENCIA');
    expect(text).toContain('Solicitud original conservada');
  });
});
