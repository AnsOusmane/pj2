import { Injectable, signal } from '@angular/core';

/** Une entrée de l'index de recherche du site. */
export interface SearchEntry {
  /** Titre affiché dans les résultats. */
  title: string;
  /** Courte description affichée sous le titre. */
  description: string;
  /** Route Angular vers laquelle naviguer au clic. */
  route: string;
  /** Query params éventuels (ex. variantes CSU). */
  queryParams?: Record<string, string>;
  /** Catégorie (regroupement / libellé). */
  category: string;
  /** Mots-clés supplémentaires (synonymes, wolof, anglais) pour la correspondance. */
  keywords: string[];
}

/**
 * Recherche interne du site.
 *
 * Index statique côté client des pages réellement en ligne (celles accessibles
 * depuis la navigation). Pas d'appel réseau : le filtrage est instantané.
 * L'état d'ouverture de la palette est partagé via un signal pour que la navbar
 * (bouton loupe) et l'overlay global restent découplés.
 */
@Injectable({ providedIn: 'root' })
export class SearchService {
  /** Palette de recherche ouverte ? */
  readonly isOpen = signal(false);

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  toggle(): void {
    this.isOpen.update(v => !v);
  }

  /** Index des pages publiques indexées. */
  readonly index: SearchEntry[] = [
    {
      title: 'Accueil',
      description: "Page d'accueil de la SEN-CSU",
      route: '/',
      category: 'Général',
      keywords: ['accueil', 'home', 'sen-csu', 'sencsu', 'couverture sanitaire universelle', 'ndam'],
    },
    {
      title: 'Vision et Missions',
      description: "Vision, missions et objectifs de l'agence",
      route: '/missionsvision',
      category: 'La SEN-CSU',
      keywords: ['vision', 'mission', 'missions', 'objectifs', 'agence', 'yitte'],
    },
    {
      title: 'Assurance Maladie (CSU)',
      description: 'La couverture sanitaire universelle',
      route: '/assurance-maladie',
      queryParams: { type: 'poste' },
      category: 'Assurance Maladie',
      keywords: ['assurance', 'maladie', 'csu', 'couverture', 'santé', 'wergu yaram', 'mutuelle'],
    },
    {
      title: 'CSU Élève',
      description: 'Couverture santé pour les élèves',
      route: '/assurance-maladie',
      queryParams: { type: 'eleve' },
      category: 'Assurance Maladie',
      keywords: ['csu', 'élève', 'eleve', 'étudiant', 'école', 'jangalekat', 'ndongo'],
    },
    {
      title: 'CSU Daara',
      description: 'Couverture santé pour les daaras',
      route: '/assurance-maladie',
      queryParams: { type: 'daara' },
      category: 'Assurance Maladie',
      keywords: ['csu', 'daara', 'talibé', 'talibe', 'coranique'],
    },
    {
      title: 'Prise en charge 0 à 5 ans',
      description: 'Gratuité des soins pour les enfants de 0 à 5 ans',
      route: '/zero-cinq-ans',
      category: 'Assistance médicale',
      keywords: ['enfant', 'enfants', 'bébé', 'nourrisson', '0 à 5 ans', 'gratuité', 'gune', 'xale'],
    },
    {
      title: 'Césarienne',
      description: 'Gratuité de la césarienne',
      route: '/cesarienne',
      category: 'Assistance médicale',
      keywords: ['césarienne', 'cesarienne', 'accouchement', 'maternité', 'femme enceinte', 'jigéen'],
    },
    {
      title: 'Dialyse',
      description: 'Prise en charge de la dialyse',
      route: '/dialyse',
      category: 'Assistance médicale',
      keywords: ['dialyse', 'rein', 'reins', 'insuffisance rénale', 'hémodialyse'],
    },
    {
      title: 'Plan Sésame',
      description: 'Prise en charge des personnes âgées (Plan Sésame)',
      route: '/plan-sesame',
      category: 'Assistance médicale',
      keywords: ['plan sésame', 'sesame', 'personnes âgées', 'troisième âge', 'mag ñi', 'vieux'],
    },
    {
      title: 'Bénéficiaires PNBSF',
      description: 'Programme National de Bourses de Sécurité Familiale',
      route: '/pnbsf',
      category: 'Assistance médicale',
      keywords: ['pnbsf', 'bourse', 'bourses', 'sécurité familiale', 'famille', 'njaboot'],
    },
    {
      title: "Carte d'Égalité des Chances",
      description: 'Carte CEC pour les personnes en situation de handicap',
      route: '/cec',
      category: 'Assistance médicale',
      keywords: ['cec', 'carte', 'égalité des chances', 'handicap', 'handicapé', 'lâj'],
    },
    {
      title: 'Carrière',
      description: "Offres d'emploi et candidatures",
      route: '/carriere',
      category: 'Carrière',
      keywords: ['carrière', 'carriere', 'emploi', 'offre', 'offres', 'recrutement', 'travail', 'liggéey', 'cv', 'candidature'],
    },
    {
      title: 'Nous contacter',
      description: 'Formulaire de contact',
      route: '/contact',
      category: 'Assistance et Contact',
      keywords: ['contact', 'contacter', 'écrire', 'email', 'téléphone', 'message', 'jokkoo'],
    },
    {
      title: 'Localiser une agence',
      description: 'Nos services régionaux et antennes',
      route: '/nos-services-regionaux',
      category: 'Assistance et Contact',
      keywords: ['agence', 'agences', 'antenne', 'région', 'régional', 'carte', 'localiser', 'adresse', 'barab'],
    },
    {
      title: 'Faire une réclamation',
      description: 'Formulaire de réclamation',
      route: '/reclamation-form',
      category: 'Assistance et Contact',
      keywords: ['réclamation', 'reclamation', 'plainte', 'signaler', 'problème', 'ñaxtu'],
    },
  ];

  /** Filtre l'index en fonction de la requête (insensible casse / accents). */
  search(query: string): SearchEntry[] {
    const q = this.normalize(query.trim());
    if (!q) return this.index;

    const terms = q.split(/\s+/).filter(Boolean);

    return this.index
      .map(entry => ({ entry, score: this.score(entry, terms) }))
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(r => r.entry);
  }

  private score(entry: SearchEntry, terms: string[]): number {
    const title = this.normalize(entry.title);
    const desc = this.normalize(entry.description);
    const keys = entry.keywords.map(k => this.normalize(k));

    let total = 0;
    for (const term of terms) {
      let termScore = 0;
      if (title.startsWith(term)) termScore = 6;
      else if (title.includes(term)) termScore = 4;
      else if (keys.some(k => k === term)) termScore = 4;
      else if (keys.some(k => k.includes(term))) termScore = 2;
      else if (desc.includes(term)) termScore = 1;

      if (termScore === 0) return 0; // chaque terme doit correspondre
      total += termScore;
    }
    return total;
  }

  /** Minuscule + suppression des accents pour une correspondance tolérante. */
  private normalize(s: string): string {
    return s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '');
  }
}
