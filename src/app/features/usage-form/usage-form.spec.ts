import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateUsageRequest } from '../../core/models';
import { UsageForm, newReference } from './usage-form';

describe('UsageForm', () => {
  let fixture: ComponentFixture<UsageForm>;
  let component: UsageForm;
  let emitted: CreateUsageRequest | undefined;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [UsageForm] });
    fixture = TestBed.createComponent(UsageForm);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('customerId', 'USR-10');
    fixture.detectChanges();
    emitted = undefined;
    component.submitted.subscribe((value) => (emitted = value));
  });

  it('precarga el cliente seleccionado', () => {
    expect(component.form.controls.customerId.value).toBe('USR-10');
  });

  it('emite la solicitud con los datos del formulario', () => {
    component.form.setValue({
      requestReference: 'REF-001',
      preApprovedId: ' PRA-1001 ',
      customerId: 'USR-10',
      amount: 600000,
    });
    component.submit();

    expect(emitted).toEqual({
      requestReference: 'REF-001',
      preApprovedId: 'PRA-1001',
      customerId: 'USR-10',
      amount: 600000,
    });
  });

  it('permite enviar valores no positivos para que el backend los registre como rechazados', () => {
    component.form.controls.amount.setValue(0);
    component.submit();
    expect(emitted?.amount).toBe(0);
  });

  it('no emite si la referencia tiene caracteres inválidos', () => {
    component.form.controls.requestReference.setValue('REF 001 con espacios');
    component.submit();
    expect(emitted).toBeUndefined();
  });

  it('genera referencias con un formato válido', () => {
    expect(newReference(new Date(2026, 9, 6, 17, 45, 12, 7))).toBe('REF-20261006-174512-007');
  });
});
