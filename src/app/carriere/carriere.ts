import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-carriere',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './carriere.html',
})
export class CarriereComponent {

  private fb = inject(FormBuilder);

  // Formulaire de candidature spontanée
  form: FormGroup = this.fb.group({
    nom: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telephone: [''],
    poste: [''],
    cv: [null]
  });

  // Liste des offres
  offres = [
    {
      id: 1,
      titre: "Développeur Angular",
      type: "CDI",
      lieu: "Dakar",
      description: `Vous travaillerez sur des projets front-end modernes...`
    },
    {
      id: 2,
      titre: "UI/UX Designer",
      type: "Stage",
      lieu: "Thiès",
      description: `Stage de 6 mois pour renforcer notre équipe design...`
    },
{
  id: 3,
  titre: "Responsable Marketing",
  type: "CDI",
  lieu: "Thiès",
  description: `Définition et exécution de la stratégie marketing, gestion des campagnes, analyse du marché...`
},
{
  id: 4,
  titre: "Assistant RH",
  type: "Stage",
  lieu: "Dakar",
  description: `Participation au recrutement, gestion administrative du personnel, organisation des formations...`
},
{
  id: 5,
  titre: "Commercial Terrain",
  type: "CDD",
  lieu: "Saint-Louis",
  description: `Prospection, vente directe, gestion d’un portefeuille clients, suivi des performances...`
},
{
  id: 6,
  titre: "Chargé de Logistique",
  type: "CDI",
  lieu: "Kaolack",
  description: `Gestion des stocks, coordination des livraisons, optimisation des flux logistiques...`
},
{
  id: 7,
  titre: "Graphiste",
  type: "Stage",
  lieu: "Dakar",
  description: `Création de visuels, supports publicitaires, retouches photos, participation à la direction artistique...`
},
{
  id: 8,
  titre: "Assistant Comptable",
  type: "CDD",
  lieu: "Mbour",
  description: `Saisie comptable, rapprochements bancaires, préparation des états financiers...`
},
{
  id: 9,
  titre: "Agent de Centre d’Appels",
  type: "CDI",
  lieu: "Dakar",
  description: `Réception et émission d’appels, assistance clients, traitement des demandes et réclamations...`
},
{
  id: 10,
  titre: "Chargé de Qualité",
  type: "CDI",
  lieu: "Thiès",
  description: `Contrôle qualité, amélioration continue, mise en place de procédures et audits internes...`
},
{
  id: 11,
  titre: "Assistant Administratif",
  type: "Stage",
  lieu: "Dakar",
  description: `Gestion des dossiers, rédaction de courriers, planification de réunions, archivage...`
}

  ];

  filtre = '';
  offreSelectionnee: any = null;

  get offresFiltrees() {
    return this.offres.filter(o =>
      o.titre.toLowerCase().includes(this.filtre.toLowerCase())
    );
  }

  // Afficher détails + scroll automatique
  afficherDetails(offre: any) {
    this.offreSelectionnee = offre;

    setTimeout(() => {
      document.getElementById('details-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    this.form.patchValue({ cv: file });
  }

  envoyer() {
    if (this.form.invalid) return this.form.markAllAsTouched();

    alert('Candidature envoyée avec succès !');
    this.form.reset();
  }
}
