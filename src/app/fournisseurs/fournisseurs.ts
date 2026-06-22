import { Component, signal, AfterViewInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FournisseursService } from 'app/services/fournisseurs.service';
import { BackButtonComponent } from 'app/shared/back-button/back-button';

interface RecapDossier {
  numero: string;
  date: string;
  raison_sociale: string;
  ninea: string;
  rccm: string;
  domaine: string;
  adresse: string;
  telephone: string;
  email: string;
  contact_nom: string;
  message: string;
  documents: { label: string; nom: string }[];
}

@Component({
  selector: 'app-fournisseurs',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BackButtonComponent],
  templateUrl: './fournisseurs.html',
  styleUrls: ['./fournisseurs.css']
})
export class FournisseursComponent implements AfterViewInit, OnDestroy {

  readonly domaines = ['Fournitures', 'Travaux', 'Services', 'Prestations intellectuelles'];

  form: FormGroup;
  saving = signal(false);
  error = signal<string | null>(null);

  // Écran de confirmation après dépôt réussi
  numeroConfirme = signal<string | null>(null);

  // Récapitulatif du dossier déposé (affichage + téléchargement)
  recap = signal<RecapDossier | null>(null);

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
      raison_sociale: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
      // Facultatifs : les validateurs de format ne s'appliquent que si le champ est rempli.
      // NINEA : 7 à 20 caractères (chiffres, lettres, espaces) — ex. « 0040228 2G3 ».
      ninea: ['', Validators.pattern(/^[A-Za-z0-9 ]{7,20}$/)],
      // RCCM : format OHADA SN-VVV-AAAA-T-NNNNN — ex. « SN-DKR-2020-B-12345 » (séparateurs - . ou espace).
      rccm: ['', Validators.pattern(/^SN[-. ][A-Za-z]{2,4}[-. ]\d{4}[-. ][A-Za-z][-. ]\d{1,6}$/i)],
      domaine: ['', Validators.required],
      adresse: ['', Validators.maxLength(255)],
      telephone: ['', [Validators.required, Validators.pattern(/^[+]?[0-9\s().-]{7,20}$/)]],
      // Validators.email accepte « dh@l » (sans point ni extension) : on ajoute un
      // motif qui exige un vrai domaine avec extension (ex. « nom@domaine.sn »).
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/),
        Validators.maxLength(255)
      ]],
      contact_nom: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
      message: ['', Validators.maxLength(2000)]
    });
  }

  // Anti-robot Cloudflare Turnstile désactivé pour l'instant.
  ngAfterViewInit(): void { /* no-op */ }

  ngOnDestroy(): void { /* no-op */ }

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
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Veuillez corriger les champs en rouge avant d\'envoyer.');
      return;
    }
    if (!this.docDemande() || !this.docNinea() || !this.docPresentation() || !this.docRegistre()) {
      this.error.set('La demande au Directeur Général, la copie du NINEA, la présentation de l\'entreprise et le registre de commerce (PDF) sont obligatoires.');
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

    this.service.deposer(fd).subscribe({
      next: (res) => {
        this.saving.set(false);
        this.numeroConfirme.set(res.numero);

        // Mémorise le récapitulatif du dossier (le formulaire n'est pas encore réinitialisé)
        this.recap.set({
          numero: res.numero,
          date: new Date().toLocaleString('fr-FR'),
          raison_sociale: v.raison_sociale,
          ninea: v.ninea || '—',
          rccm: v.rccm || '—',
          domaine: v.domaine,
          adresse: v.adresse || '—',
          telephone: v.telephone,
          email: v.email,
          contact_nom: v.contact_nom,
          message: v.message || '—',
          documents: [
            { label: 'Demande adressée au Directeur Général', nom: this.docDemande()?.name || '—' },
            { label: 'Copie du NINEA', nom: this.docNinea()?.name || '—' },
            { label: "Présentation de l'entreprise", nom: this.docPresentation()?.name || '—' },
            { label: 'Registre de commerce (RCCM)', nom: this.docRegistre()?.name || '—' },
            ...(this.docFiscale() ? [{ label: 'Attestation fiscale', nom: this.docFiscale()!.name }] : [])
          ]
        });

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
      }
    });
  }

  nouveauDepot(): void {
    this.numeroConfirme.set(null);
    this.recap.set(null);
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
  }

  /** Ouvre un document imprimable (logo SEN-CSU en haut) que l'utilisateur enregistre en PDF. */
  telechargerRecap(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const r = this.recap();
    if (!r) return;

    const esc = (s: string) =>
      String(s ?? '—').replace(/[&<>"]/g, c =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));

    const logoUrl = new URL('assets/logo.png', document.baseURI).href;

    const ligne = (label: string, valeur: string) =>
      `<tr><th>${esc(label)}</th><td>${esc(valeur)}</td></tr>`;

    const docs = r.documents
      .map(d => `<li><span>${esc(d.label)}</span><em>${esc(d.nom)}</em></li>`)
      .join('');

    const html = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8">
<title>Récapitulatif demande d'agrément ${esc(r.numero)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #1f2937; margin: 0; padding: 32px 40px; }
  .head { text-align: center; border-bottom: 3px solid #16a34a; padding-bottom: 16px; margin-bottom: 24px; }
  .head img { height: 80px; object-fit: contain; }
  .head h1 { font-size: 20px; margin: 12px 0 2px; color: #15803d; }
  .head p { margin: 0; font-size: 12px; color: #6b7280; }
  .numero { display: inline-block; margin: 0 auto 24px; background: #f0fdf4; border: 1px solid #bbf7d0;
            border-radius: 10px; padding: 10px 18px; text-align: center; }
  .numero span { display: block; font-size: 10px; text-transform: uppercase; color: #16a34a; letter-spacing: .05em; }
  .numero strong { font-size: 20px; color: #15803d; letter-spacing: .04em; }
  .center { text-align: center; }
  h2 { font-size: 13px; text-transform: uppercase; letter-spacing: .04em; color: #15803d;
       border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; margin: 24px 0 10px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th, td { text-align: left; padding: 7px 8px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
  th { width: 38%; color: #6b7280; font-weight: 600; }
  ul { list-style: none; padding: 0; margin: 0; font-size: 13px; }
  ul li { display: flex; justify-content: space-between; gap: 16px; padding: 7px 8px; border-bottom: 1px solid #f1f5f9; }
  ul li em { color: #6b7280; font-style: normal; }
  .foot { margin-top: 28px; font-size: 11px; color: #9ca3af; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 12px; }
  @media print { body { padding: 0; } }
</style></head>
<body>
  <div class="head">
    <img src="${logoUrl}" alt="SEN-CSU">
    <h1>Demande d'agrément — Récapitulatif</h1>
    <p>Agence de la Couverture Sanitaire Universelle (SEN-CSU)</p>
  </div>

  <div class="center">
    <div class="numero">
      <span>Numéro de dossier</span>
      <strong>${esc(r.numero)}</strong>
    </div>
  </div>

  <h2>Informations du fournisseur</h2>
  <table>
    ${ligne('Raison sociale', r.raison_sociale)}
    ${ligne('Domaine d\'activité', r.domaine)}
    ${ligne('NINEA', r.ninea)}
    ${ligne('RCCM', r.rccm)}
    ${ligne('Personne à contacter', r.contact_nom)}
    ${ligne('Téléphone', r.telephone)}
    ${ligne('Email', r.email)}
    ${ligne('Adresse', r.adresse)}
    ${ligne('Message / précisions', r.message)}
  </table>

  <h2>Pièces déposées</h2>
  <ul>${docs}</ul>

  <div class="foot">
    Document généré le ${esc(r.date)} — à conserver pour le suivi de votre demande auprès de l'Agence.
  </div>

  <script>window.onload = function () { window.print(); };</script>
</body></html>`;

    const w = window.open('', '_blank');
    if (!w) {
      this.error.set('Veuillez autoriser les fenêtres pop-up pour télécharger le récapitulatif.');
      return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c && c.invalid && c.touched);
  }
}
