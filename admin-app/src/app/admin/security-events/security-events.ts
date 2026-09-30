import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SecurityEventsService, SecurityEventsData } from 'app/services/security-events.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-security-events',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './security-events.html',
})
export class SecurityEventsComponent implements OnInit {
  readonly periods = [
    { value: 1, label: '24 h' },
    { value: 7, label: '7 jours' },
    { value: 30, label: '30 jours' },
  ];

  days = signal(7);
  activeType = signal<string | null>(null);
  data = signal<SecurityEventsData | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private service: SecurityEventsService) {}

  ngOnInit(): void {
    this.load();
  }

  setDays(d: number): void {
    if (this.days() === d) return;
    this.days.set(d);
    this.load();
  }

  filterType(type: string): void {
    this.activeType.set(this.activeType() === type ? null : type);
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service.getEvents(this.days(), this.activeType() ?? undefined).subscribe({
      next: (data) => { this.data.set(data); this.loading.set(false); },
      error: (err) => { this.error.set(err?.message || 'Erreur de chargement'); this.loading.set(false); },
    });
  }
}
