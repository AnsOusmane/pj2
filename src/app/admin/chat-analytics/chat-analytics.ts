import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatAnalyticsService, ChatStats } from 'app/services/chat-analytics.service';

// Libellés lisibles pour les identifiants d'entrées FAQ (matched_id).
const TOPIC_LABELS: Record<string, string> = {
  greeting: 'Salutations',
  languages: 'Langues parlées',
  affirm: 'Acquiescement (oui / suite)',
  thanks: 'Remerciements',
  bye: 'Au revoir',
  'what-is-csu': 'CSU (c\'est quoi)',
  'how-to-join': 'Adhérer à la CSU',
  cesarienne: 'Césarienne',
  dialyse: 'Dialyse',
  'plan-sesame': 'Plan Sésame',
  'zero-cinq': 'Enfants 0-5 ans',
  pnbsf: 'PNBSF',
  cec: 'Carte Égalité des Chances',
  agence: 'Localiser une agence',
  contact: 'Contact',
  reclamation: 'Réclamation',
  emploi: 'Emploi / Carrière',
  cost: 'Coûts / tarifs',
};

const LANG_LABELS: Record<string, string> = { fr: 'Français', wo: 'Wolof', en: 'Anglais' };

@Component({
  selector: 'app-chat-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-analytics.html',
  styleUrls: ['./chat-analytics.css'],
})
export class ChatAnalyticsComponent implements OnInit {
  readonly periods = [
    { value: 7, label: '7 jours' },
    { value: 30, label: '30 jours' },
    { value: 90, label: '90 jours' },
  ];

  days = signal(30);
  stats = signal<ChatStats | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  /** Plus grand volume quotidien (pour dimensionner les barres). */
  maxDaily = computed(() => Math.max(1, ...(this.stats()?.daily.map(d => d.total) ?? [1])));
  /** Total des messages par langue (pour les proportions). */
  langTotal = computed(() => (this.stats()?.byLang.reduce((s, l) => s + l.n, 0) ?? 0) || 1);

  constructor(private service: ChatAnalyticsService) {}

  ngOnInit(): void {
    this.load();
  }

  setDays(d: number): void {
    if (this.days() === d) return;
    this.days.set(d);
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service.getStats(this.days()).subscribe({
      next: (data) => { this.stats.set(data); this.loading.set(false); },
      error: (err) => { this.error.set(err?.message || 'Erreur de chargement'); this.loading.set(false); },
    });
  }

  topicLabel(id: string | null): string {
    if (!id) return '—';
    return TOPIC_LABELS[id] ?? id;
  }

  langLabel(code: string | null): string {
    if (!code) return 'Indéterminée';
    return LANG_LABELS[code] ?? code;
  }

  pct(n: number, total: number): number {
    return total ? Math.round((n / total) * 100) : 0;
  }
}
