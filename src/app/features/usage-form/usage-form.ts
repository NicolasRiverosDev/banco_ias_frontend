import { Component, effect, input, output, untracked } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateUsageRequest, PreApproved } from '../../core/models';

/** Genera una referencia única legible, p. ej. REF-20261006-174512-483. */
export function newReference(now = new Date()): string {
  const pad = (n: number, size = 2) => String(n).padStart(size, '0');
  const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const time = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  return `REF-${date}-${time}-${pad(now.getMilliseconds(), 3)}`;
}

@Component({
  selector: 'app-usage-form',
  imports: [ReactiveFormsModule],
  templateUrl: './usage-form.html',
})
export class UsageForm {
  readonly customerId = input.required<string>();
  readonly preApproved = input<PreApproved[]>([]);
  readonly busy = input(false);
  readonly submitted = output<CreateUsageRequest>();
  private autoFilledFor: string | null = null;

  readonly form = new FormGroup({
    requestReference: new FormControl(newReference(), {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(64), Validators.pattern(/^[A-Za-z0-9._-]+$/)],
    }),
    preApprovedId: new FormControl('PRA-1001', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(20)],
    }),
    customerId: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(20)],
    }),
    // Sin validador de mínimo a propósito: un valor 0 o negativo debe llegar al backend,
    // que lo registra como solicitud RECHAZADA (regla de negocio RF02), no como error de formulario.
    amount: new FormControl<number | null>(600000, { validators: [Validators.required] }),
  });

  constructor() {
    // Al cambiar el cliente seleccionado se precarga en el formulario (sigue siendo editable
    // para poder probar la regla "el preaprobado corresponde al cliente").
    effect(() => {
      const customerId = this.customerId();
      untracked(() => this.form.controls.customerId.setValue(customerId));
    });
    // Cuando llegan los preaprobados de OTRO cliente se sugiere el primero; los refrescos
    // del mismo cliente no tocan lo que el usuario haya escrito.
    effect(() => {
      const list = this.preApproved();
      untracked(() => {
        if (list.length > 0 && list[0].customerId !== this.autoFilledFor) {
          this.autoFilledFor = list[0].customerId;
          this.form.controls.preApprovedId.setValue(list[0].id);
        }
      });
    });
  }

  regenerateReference(): void {
    this.form.controls.requestReference.setValue(newReference());
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.submitted.emit({
      requestReference: value.requestReference.trim(),
      preApprovedId: value.preApprovedId.trim(),
      customerId: value.customerId.trim(),
      amount: Number(value.amount),
    });
  }
}
