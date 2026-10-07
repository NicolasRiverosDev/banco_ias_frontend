import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { CreateUsageRequest, Outcome, PreApproved, UsageRequest } from './core/models';
import { UsageApiService } from './core/usage-api.service';
import { RecentRequests } from './features/recent-requests/recent-requests';
import { ResultCard } from './features/result-card/result-card';
import { UsageForm } from './features/usage-form/usage-form';
import { CopPipe } from './shared/cop.pipe';

/**
 * Pantalla única que orquesta: cupos del cliente, registro de solicitudes, resultado,
 * consulta por referencia y listado de solicitudes recientes.
 */
@Component({
  selector: 'app-root',
  imports: [FormsModule, UsageForm, ResultCard, RecentRequests, CopPipe],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private readonly api = inject(UsageApiService);

  readonly customers = ['USR-10', 'USR-20'];
  readonly customerId = signal('USR-10');
  readonly onlyCurrentCustomer = signal(false);

  readonly preApproved = signal<PreApproved[]>([]);
  readonly recent = signal<UsageRequest[]>([]);
  readonly outcome = signal<Outcome | null>(null);
  readonly busy = signal(false);
  readonly loadError = signal<string | null>(null);

  lookupReference = '';

  ngOnInit(): void {
    this.refresh();
  }

  changeCustomer(customerId: string): void {
    this.customerId.set(customerId);
    this.refresh();
  }

  toggleOnlyCurrentCustomer(value: boolean): void {
    this.onlyCurrentCustomer.set(value);
    this.loadRecent();
  }

  submit(request: CreateUsageRequest): void {
    this.busy.set(true);
    this.api
      .submit(request)
      .pipe(finalize(() => this.busy.set(false)))
      .subscribe((outcome) => {
        this.outcome.set(outcome);
        this.refresh();
      });
  }

  lookup(reference: string): void {
    const value = reference.trim();
    if (!value) {
      return;
    }
    this.lookupReference = value;
    this.api.findByReference(value).subscribe((outcome) => this.outcome.set(outcome));
  }

  refresh(): void {
    this.api.preApproved(this.customerId()).subscribe({
      next: (list) => {
        this.preApproved.set(list);
        this.loadError.set(null);
      },
      error: () => this.loadError.set('No fue posible conectar con el backend (http://localhost:8080).'),
    });
    this.loadRecent();
  }

  private loadRecent(): void {
    const filter = this.onlyCurrentCustomer() ? this.customerId() : null;
    this.api.recent(filter).subscribe({
      next: (list) => this.recent.set(list),
      error: () => this.recent.set([]),
    });
  }
}
