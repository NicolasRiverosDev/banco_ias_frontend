import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { Outcome } from '../../core/models';
import { CopPipe } from '../../shared/cop.pipe';

/** Muestra claramente el resultado de la última solicitud enviada o consultada (RF07). */
@Component({
  selector: 'app-result-card',
  imports: [CopPipe, DatePipe],
  templateUrl: './result-card.html',
})
export class ResultCard {
  readonly outcome = input<Outcome | null>(null);
}
