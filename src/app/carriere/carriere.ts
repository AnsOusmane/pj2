import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CandidaturesService } from '../services/candidatures.service';
import { OffresEmploiService, OffreEmploi } from '../services/offres-emploi.service';

@Component({
  selector: 'app-carriere',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './carriere.html',
})
export class CarriereComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private candidaturesService = inject(CandidaturesService);
  private offresService = inject(OffresEmploiService);

  envoiEnCours = false;
  messageSucces = '';
  messageErreur = '';

  // Offres d'emploi publiées depuis l'admin (chargées via l'API).
  offres: OffreEmploi[] = [];
  isLoadingOffres = false;

  form: FormGroup = this.fb.group({
    nom: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telephone: [''],
    poste: [''],
    cv: [null]
  });

  filtre = '';
  offreSelectionnee: OffreEmploi | null = null;  // ← stocke l'offre actuellement ouverte

  ngOnInit(): void {
    this.chargerOffres();
  }

  /** Charge les offres d'emploi actives publiées depuis l'admin. */
  chargerOffres(): void {
    this.isLoadingOffres = true;
    this.offresService.getAll().subscribe({
      next: (offres) => { this.offres = offres; this.isLoadingOffres = false; },
      error: () => { this.offres = []; this.isLoadingOffres = false; }
    });
  }

  get offresFiltrees() {
    const q = this.filtre.toLowerCase();
    return this.offres.filter(o =>
      (o.title || '').toLowerCase().includes(q) ||
      (o.company || '').toLowerCase().includes(q) ||
      (o.location || '').toLowerCase().includes(q)
    );
  }

  afficherDetails(offre: OffreEmploi) {
    // Toggle : si c'est la même offre qui est ouverte → on la ferme
    if (this.offreSelectionnee?.id === offre.id) {
      this.offreSelectionnee = null;
    } else {
      this.offreSelectionnee = offre;
      // Scroll vers la description après ouverture
      setTimeout(() => {
        document.getElementById('details-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      this.messageErreur = 'Le fichier dépasse la taille maximale de 10 Mo';
      return;
    }
    this.form.patchValue({ cv: file });
    this.messageErreur = '';
  }

  async uploadCV(file: File): Promise<string> {
    const cloudName = 'djyelsta1';
    const uploadPreset = 'cv_upload';
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', uploadPreset);
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`, {
      method: 'POST',
      body: data
    });
    const result = await response.json();
    if (!result.secure_url) throw new Error('Erreur upload Cloudinary');
    return result.secure_url;
  }

  async envoyer() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.envoiEnCours = true;
    this.messageSucces = '';
    this.messageErreur = '';
    try {
      let cvLink = 'Non fourni';
      if (this.form.value.cv) {
        cvLink = await this.uploadCV(this.form.value.cv);
      }

      // Stockage en base (best-effort) — en plus de l'envoi par mail ci-dessous.
      // Un échec ici ne doit pas empêcher la notification e-mail à l'agence.
      try {
        await this.candidaturesService.enregistrer({
          nom: this.form.value.nom,
          email: this.form.value.email,
          telephone: this.form.value.telephone || undefined,
          poste: this.form.value.poste || undefined,
          cv_url: this.form.value.cv ? cvLink : undefined
        }).toPromise();
      } catch (dbErr) {
        console.error('Candidature non enregistrée en base (mail envoyé quand même) :', dbErr);
      }

      const formData = new FormData();
      formData.append('access_key', '5ca3d34c-8b1b-444c-8148-b34bd0015f81');
      formData.append('name', this.form.value.nom);
      formData.append('email', this.form.value.email);
      formData.append('subject', 'Nouvelle candidature spontanée');
      formData.append('from_name', 'Site Sen-CSU');
      formData.append('botcheck', '');
      formData.append('message',
`Nouvelle candidature reçue :
Nom : ${this.form.value.nom}
Email : ${this.form.value.email}
Téléphone : ${this.form.value.telephone || 'Non renseigné'}
Poste souhaité : ${this.form.value.poste || 'Non précisé'}
CV du candidat :
${cvLink}
`);
      await this.http.post('https://api.web3forms.com/submit', formData).toPromise();
      this.messageSucces = 'Candidature envoyée avec succès';
      this.form.reset();
    } catch (err: any) {
      console.error(err);
      this.messageErreur = "Erreur lors de l'envoi";
    }
    this.envoiEnCours = false;
  }
}