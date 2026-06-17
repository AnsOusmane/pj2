import { Component, signal, AfterViewInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FournisseursService } from 'app/services/fournisseurs.service';
import { environment } from 'environments/environment';

declare global {
  interface Window { turnstile?: any; __cfTurnstileOnload?: () => void; }
}

@Component({
  selector: 'app-fournisseurs',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './fournisseurs.html',
  styleUrls: ['./fournisseurs.css']
})
export class FournisseursComponent implements AfterViewInit, OnDestroy {

  readonly domaines = ['Fournitures', 'Travaux', 'Services', 'Prestations intellectuelles'];

  form: FormGroup;
  saving = signal(false);
  error = signal<string | null>(null);

  // Anti-robot Cloudflare Turnstile
  captchaToken = signal<string | null>(null);
  private widgetId: string | null = null;

  // Écran de confirmation après dépôt réussi
  numeroConfirme = signal<string | null>(null);

  // Fichiers (hors FormControl)
  // Pièces du cahier des charges (obligatoires)
  docDemande = signal<File | null>(null);
  docNinea = signal<File | null>(null);
  docPresentation = signal<File | null>(null);
  // Pièces facultatives (bonus)
  docRegistre = signal<File | null>(null);
  docFiscale = signal<File | null>(null);

  constructor(
    private fb: FormBuilder,
    private service: FournisseursService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.form = this.fb.group({
      raison_sociale: ['', Validators.required],
      ninea: [''],
      rccm: [''],
      domaine: [''],
      adresse: [''],
      telephone: [''],
      email: ['', Validators.email],
      contact_nom: [''],
      message: ['']
    });
  }

  // ====================== TURNSTILE (anti-robot) ======================
  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return; // pas de window/document en SSR
    this.loadTurnstile();
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId) && this.widgetId && window.turnstile) {
      try { window.turnstile.remove(this.widgetId); } catch { /* no-op */ }
    }
  }

  private loadTurnstile(): void {
    // Le script déjà chargé (navigation interne) : on rend directement.
    if (window.turnstile) { this.renderWidget(); return; }

    // Sinon on injecte le script une seule fois, avec callback de rendu explicite.
    window.__cfTurnstileOnload = () => this.renderWidget();
    if (document.getElementById('cf-turnstile-script')) return;
    const s = document.createElement('script');
    s.id = 'cf-turnstile-script';
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=__cfTurnstileOnload';
    s.async = true;
    s.defer = true;
    document.head.appendChild(s);
  }

  private renderWidget(): void {
    const el = document.getElementById('cf-turnstile');
    if (!el || this.widgetId || !window.turnstile) return;
    this.widgetId = window.turnstile.render('#cf-turnstile', {
      sitekey: environment.turnstileSiteKey,
      callback: (token: string) => this.captchaToken.set(token),
      'expired-callback': () => this.captchaToken.set(null),
      'error-callback': () => this.captchaToken.set(null)
    });
  }

  onFileChange(event: Event, slot: 'demande' | 'ninea' | 'presentation' | 'registre' | 'fiscale'): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    if (file.type !== 'application/pdf') {
      this.error.set('Tous les documents doivent être au format PDF.');
      input.value = '';
      return;
    }
    this.error.set(null);
    if (slot === 'demande') this.docDemande.set(file);
    else if (slot === 'ninea') this.docNinea.set(file);
    else if (slot === 'presentation') this.docPresentation.set(file);
    else if (slot === 'registre') this.docRegistre.set(file);
    else this.docFiscale.set(file);
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    if (!this.docDemande() || !this.docNinea() || !this.docPresentation() || !this.docRegistre()) {
      this.error.set('La demande au Directeur Général, la copie du NINEA, la présentation de l\'entreprise et le registre de commerce (PDF) sont obligatoires.');
      return;
    }
    const token = this.captchaToken();
    if (!token) {
      this.error.set('Veuillez valider la vérification anti-robot avant d\'envoyer.');
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    const v = this.form.value;
    const fd = new FormData();
    fd.append('raison_sociale', v.raison_sociale);
    for (const key of ['ninea', 'rccm', 'domaine', 'adresse', 'telephone', 'email', 'contact_nom', 'message']) {
      if (v[key]) fd.append(key, v[key]);
    }
    fd.append('doc_demande', this.docDemande() as File);
    fd.append('doc_ninea', this.docNinea() as File);
    fd.append('doc_presentation', this.docPresentation() as File);
    if (this.docRegistre()) fd.append('doc_registre', this.docRegistre() as File);
    if (this.docFiscale()) fd.append('doc_fiscale', this.docFiscale() as File);

    this.service.deposer(fd, token).subscribe({
      next: (res) => {
        this.saving.set(false);
        this.numeroConfirme.set(res.numero);

        // Notifie l'agence (Web3Forms) — best-effort : un échec n'impacte pas la confirmation.
        this.service.notifierAgence({
          numero: res.numero,
          raison_sociale: v.raison_sociale,
          domaine: v.domaine, ninea: v.ninea, rccm: v.rccm,
          contact_nom: v.contact_nom, telephone: v.telephone, email: v.email,
          adresse: v.adresse, message: v.message
        }).subscribe({ error: (e) => console.error('Notification agence non envoyée :', e) });

        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err?.message || 'Erreur lors du dépôt.');
        // Le token Turnstile est à usage unique : on réarme le widget pour réessayer.
        this.resetCaptcha();
      }
    });
  }

  nouveauDepot(): void {
    this.numeroConfirme.set(null);
    this.form.reset({ email: '' });
    this.docDemande.set(null);
    this.docNinea.set(null);
    this.docPresentation.set(null);
    this.docRegistre.set(null);
    this.docFiscale.set(null);
    ['demande', 'ninea', 'present', 'reg', 'fisc'].forEach(id => {
      const el = document.getElementById('f-' + id) as HTMLInputElement | null;
      if (el) el.value = '';
    });
    this.resetCaptcha();
  }

  /** Réarme le widget Turnstile (token à usage unique). */
  private resetCaptcha(): void {
    this.captchaToken.set(null);
    if (isPlatformBrowser(this.platformId) && this.widgetId && window.turnstile) {
      try { window.turnstile.reset(this.widgetId); } catch { /* no-op */ }
    }
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c && c.invalid && c.touched);
  }
}
