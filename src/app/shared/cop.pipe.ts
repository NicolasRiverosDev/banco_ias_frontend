import { Pipe, PipeTransform } from '@angular/core';

const formatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

/** Formatea un valor en pesos colombianos: 600000 -> "$ 600.000". */
@Pipe({ name: 'cop' })
export class CopPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    return value === null || value === undefined ? '' : formatter.format(value);
  }
}
