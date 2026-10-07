import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { UsageRequest } from '../../core/models';
import { CopPipe } from '../../shared/cop.pipe';

/** Tabla de solicitudes procesadas recientemente (RF06/RF07). */
@Component({
  selector: 'app-recent-requests',
  imports: [CopPipe, DatePipe],
  templateUrl: './recent-requests.html',
})
export class RecentRequests {
  readonly requests = input<UsageRequest[]>([]);
  readonly selected = output<string>();
}
