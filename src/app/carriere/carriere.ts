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
      titre: "Directeur des systemes d'information",
      type: "CDI",
      lieu: "Dakar",
      description: `APPEL À CANDIDATURE POUR LE POSTE DE DIRECTEUR DES SYSTÈMES D’INFORMATION

I. CONTEXTE ET JUSTIFICATION

L’Agence Sénégalaise de la Couverture Sanitaire Universelle (SEN-CSU), personne morale de droit public, en charge de la mise en œuvre de la politique nationale de couverture sanitaire universelle, s’inscrit dans une dynamique de modernisation et de transformation digitale de ses services. Dans ce cadre, elle lance un appel à candidatures pour recruter un Directeur des Systèmes d’Information (DSI), un poste de haute responsabilité stratégique placé sous l’autorité directe de la Direction Générale.

Le Directeur des Systèmes d’Information est le pilote de la transformation numérique de l’Agence. Il conçoit, met en œuvre et supervise la stratégie informatique en cohérence avec les orientations stratégiques de l’Agence de la SEN-CSU. Il a pour vocation de piloter la stratégie numérique de l’Agence. Il joue un rôle central dans l’intégration des technologies de l’information au service de la performance, de l’efficience opérationnelle et de la transparence des interventions de l’Agence.

II. MISSIONS PRINCIPALES :

Élaborer et mettre en œuvre la stratégie et la politique informatique de l’agence, en cohérence avec les orientations générales définies par la Direction Générale ;

Définir et mettre en place une politique de sécurité informatique et de protection des données personnelles ;

Concevoir et déployer un système informatisé de planification, de gestion et de suivi des activités de l’agence ;

Mettre en œuvre une plateforme de gestion intégrée dédiée à la Couverture Sanitaire Universelle (CSU) ;

Accompagner la mise en place d’un système d’identification basé sur les TIC (Technologies de l’Information et de la Communication) ;

Appuyer l’organisation des flux d’information internes en vue d’une meilleure efficacité opérationnelle ;
Évaluer les besoins métiers en matière de solutions informatiques et recommander les investissements adéquats ;

Assurer l’alignement stratégique entre les besoins des parties prenantes de la CSU, la vision de l’agence et les outils numériques ;

Conduire une veille technologique et réglementaire pour anticiper les évolutions pertinentes dans le domaine des systèmes d’information ;

Conseiller la Direction Générale sur les choix technologiques et les évolutions à intégrer pour maintenir la performance du système d’information.

Responsabilités et Activités :

Recueillir et analyser les besoins des directions métiers et proposer des solutions adaptées ;

Garantir la cohérence et la performance du système d’information dans toutes ses composantes ;

Piloter les projets informatiques majeurs de l’agence, de la conception à la mise en production ;

Assurer la maintenance, la sécurité et l’évolution des infrastructures informatiques ;

Veiller au respect des normes, des bonnes pratiques et de la conformité réglementaire en matière de traitement des données ;

Gérer les relations avec les prestataires, partenaires technologiques et institutions en lien avec le système d’information ;

Produire des rapports réguliers d’analyse, d’évaluation et de recommandation à destination de la Direction Générale.

III. LIEU ET DURÉE DE LA MISSION :

Type de contrat : CDI

Lieu d’affectation :
Le contrat du DSI sera conclu pour être exécuté à Dakar. Cependant, une clause de mobilité incluse dans ledit contrat peut emmener le DSI à travailler en tout lieu où l’Agence aura des activités, aussi bien à l’intérieur qu’à l’extérieur du Sénégal.

IV. PROFIL DU DSI

Qualifications requises :

Diplôme supérieur (Bac+5 minimum) en Informatique, Systèmes d’Information, Génie logiciel, Télécommunications, ingénierie ou domaine connexe.

Expérience professionnelle d’au moins 07 ans dans les systèmes d’information, dont au moins 5 ans à un poste de direction ou de pilotage stratégique dans une organisation publique ou privée de taille significative.

Maîtrise démontrée de la gouvernance des systèmes d’information, des normes de sécurité (ISO 27001, RGPD, etc.) et de la gestion de projets complexes.

Bonne connaissance du secteur de la santé publique, des politiques sociales ou de la protection sociale est un atout majeur.
Compétences Managériales et Humaines :

Excellente capacité de leadership, de gestion d’équipes pluridisciplinaires et de conduite du changement.

Forte aptitude à travailler dans un environnement multi-acteurs, à enjeux sociaux élevés.

Esprit d’analyse, leadership, sens de l’anticipation et capacité à travailler en transversalité avec les autres directions.

Leadership et gestion d’équipe : le DSI doit être un meneur capable de motiver, d’encadrer ses équipes et de favoriser l’intelligence collective.

Communication et écoute : des compétences interpersonnelles élevées sont essentielles pour dialoguer efficacement avec les différentes entités métiers, comprendre leurs besoins et faire adhérer à la stratégie SI.

Gestion du changement (Change Maker) : le DSI est au cœur de la transformation numérique de l’entreprise. Il doit accompagner les collaborateurs dans l’évolution de leurs méthodes de travail et encourager l’innovation.

Capacité d’analyse et de prise de décision : il doit pouvoir synthétiser des informations complexes et prendre des décisions éclairées, parfois rapidement.

Organisation et gestion de projet : la gestion simultanée de multiples projets et la planification de l’évolution des infrastructures nécessitent une organisation rigoureuse.

V. DOSSIERS DE CANDIDATURE :

Le dossier de candidature doit comporter :

Une lettre de motivation adressée au Directeur Général de la SEN-CSU ;

Un curriculum vitae détaillé ;

Les copies des diplômes et attestations de travail pertinents ;

Toute autre pièce justifiant l’expérience ou les compétences techniques ;

Une copie de la carte nationale d’identité et un extrait du casier judiciaire datant de moins de trois (03) mois.

VI. DÉPÔT DES CANDIDATURES :

Les candidatures doivent être envoyées au plus tard le 13 janvier 2026 à l’adresse suivante :
recrutement@agencecmu.sn

Seuls les candidats présélectionnés seront contactés pour un entretien.`
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
