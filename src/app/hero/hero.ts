import { Component, AfterViewInit, Inject, PLATFORM_ID, OnInit, OnDestroy } from '@angular/core';
import { isPlatformBrowser, NgIf } from '@angular/common';
import { ContactFormComponent } from "../contact-form/contact-form";

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [NgIf, ContactFormComponent],
  templateUrl: './hero.html',
  styleUrls: ['./hero.css'],
})
export class HeroComponent implements AfterViewInit, OnInit, OnDestroy {
  currentHero: number = 0; // 0 = hero1, 1 = hero2
  accordionOpen = 1; // étape ouverte par défaut
 // Variables pour les popups
showPopup = false;
popupTitle = '';
popupText = '';

// Données des popups avec HTML stylé
popupData = {
 acces: {
  title: "Accès aux soins",
  text: `
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-full max-h-[70vh] overflow-y-auto text-left">
      
      <div class="space-y-4">
        <h3 class="text-lg font-bold text-green-700">🩺 Accès immédiat</h3>
        <p class="text-base leading-relaxed">
          En vous inscrivant à la CSU, vous bénéficiez d’un <span class="font-semibold">accès immédiat et prioritaire</span> aux postes de santé, centres de santé et hôpitaux sur tout le territoire national.
        </p>
      </div>

      <div class="space-y-4">
        <h3 class="text-lg font-bold text-green-700">🏥 Prise en charge des maladies</h3>
        <p class="text-base leading-relaxed">
          Toute personne atteinte d’une maladie incluse dans le programme bénéficie d’une <span class="font-semibold">prise en charge complète</span> dans n’importe quel établissement du réseau sanitaire.
        </p>
      </div>

      <div class="space-y-4">
      <button 
  (click)="goToComuPresse()" 
  class="text-left w-full text-lg font-bold text-green-700 hover:underline hover:text-green-800 transition-colors duration-300">
  Césariennes gratuites
</button>


        <p class="text-base leading-relaxed">
          Gratuité totale pour toutes les femmes nécessitant une intervention, garantissant la protection de la mère et du nouveau-né.
        </p>
      </div>

      <div class="space-y-4">
        <h3 class="text-lg font-bold text-green-700"> Soins enfants & nourrissons</h3>
        <p class="text-base leading-relaxed">
          Accès gratuit aux soins essentiels pour tous les enfants sénégalais de moins de 5 ans.
        </p>
      </div>

      <div class="space-y-4">
        <h3 class="text-lg font-bold text-green-700"> Insuffisance rénale</h3>
        <p class="text-base leading-relaxed">
          Prise en charge gratuite sur prescription d’un néphrologue pour tout patient souffrant d’insuffisance rénale chronique.
        </p>
      </div>

      <div class="space-y-4">
        <h3 class="text-lg font-bold text-green-700"> Personnes âgées</h3>
        <p class="text-base leading-relaxed">
          Prise en charge totale ou partielle des soins destinés aux personnes âgées, selon la pyramide sanitaire.
        </p>
      </div>

    </div>
  `
},


  prix: {
    title: "Prix accessibles",
    text: `
      <div class="space-y-6">
        <p class="text-lg">
          Grâce aux subventions de l’État, les tarifs médicaux sont 
          <span class="font-semibold text-green-700">fortement réduits</span> 
          pour permettre à chaque citoyen d’accéder aux services essentiels.
        </p>

        <section>
          <h3 class="text-xl font-bold text-green-700 flex items-center gap-2">
            <span>💳</span> Abordabilité garantie
          </h3>
          <p>
            Les coûts des prestations sont ajustés pour rester accessibles à tous, y compris 
            aux familles à revenu limité.
          </p>
        </section>

        <section>
          <h3 class="text-xl font-bold text-green-700 flex items-center gap-2">
            <span>🏥</span> Subventions nationales
          </h3>
          <p>
            Les soins sont largement subventionnés afin de réduire la charge médicale 
            des ménages et de favoriser un accès équitable au système de santé.
          </p>
        </section>
      </div>
    `
  },

  demarches: {
    title: "Démarches simples",
    text: `
      <div class="space-y-6">
        <p class="text-lg">
          L’inscription a été pensée pour être 
          <span class="font-semibold text-green-700">simple, fluide et rapide</span>, 
          afin de faciliter votre accès à la CSU.
        </p>

        <section>
          <h3 class="text-xl font-bold text-green-700 flex items-center gap-2">
            <span>📝</span> Procédure intuitive
          </h3>
          <p>
            Les étapes d’enregistrement sont clairement guidées et accessibles à tous, 
            même sans connaissances techniques.
          </p>
        </section>

        <section>
          <h3 class="text-xl font-bold text-green-700 flex items-center gap-2">
            <span>⚡</span> Validation rapide
          </h3>
          <p>
            Votre dossier est traité rapidement afin que vous puissiez bénéficier des 
            services sanitaires sans délai.
          </p>
        </section>
      </div>
    `
  },

  protection: {
    title: "Protection prioritaire",
    text: `
      <div class="space-y-6">
        <p class="text-lg">
          La CSU accorde une attention renforcée aux citoyens les plus vulnérables, 
          en offrant une <span class="font-semibold text-green-700">protection sanitaire prioritaire</span>.
        </p>

        <section>
          <h3 class="text-xl font-bold text-green-700 flex items-center gap-2">
            <span></span> Enfants & nourrissons
          </h3>
          <p>
            Les jeunes enfants bénéficient d’un accès prioritaire aux soins essentiels 
            pour garantir une croissance saine et protégée.
          </p>
        </section>

        <section>
          <h3 class="text-xl font-bold text-green-700 flex items-center gap-2">
            <span></span> Personnes âgées
          </h3>
          <p>
            Les seniors reçoivent une prise en charge adaptée à leurs besoins et à leur 
            niveau de vulnérabilité.
          </p>
        </section>

        <section>
          <h3 class="text-xl font-bold text-green-700 flex items-center gap-2">
            <span>🤝</span> Familles vulnérables
          </h3>
          <p>
            Les ménages les plus fragiles bénéficient d’un soutien prioritaire pour leur 
            garantir un accès digne et équitable aux soins.
          </p>
        </section>
      </div>
    `
  }
};

  private intervalId: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    
    // Initialiser les écouteurs d'événements
    this.initializePopupListeners();
  }

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.intervalId = setInterval(() => {
      this.currentHero = this.currentHero === 0 ? 1 : 0;
    }, 5500);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  toggleAccordion(n: number) {
    this.accordionOpen = this.accordionOpen === n ? 0 : n;
  }

  scrollTo(target: string) {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const el = document.getElementById(target);
    if (!el) return;

    el.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  // Méthodes pour gérer les popups
  openPopup(key: keyof typeof this.popupData) {
    this.popupTitle = this.popupData[key].title;
    this.popupText = this.popupData[key].text;
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
  }

  onPopupClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.closePopup();
    }
  }

  private initializePopupListeners() {
    // Cette méthode n'est plus nécessaire car nous utilisons le binding Angular
    // Mais nous la gardons pour compatibilité si nécessaire
  }

  // Méthode pour gérer le clic sur les cartes
  onCardClick(key: string) {
    const popupKey = key as keyof typeof this.popupData;
    this.openPopup(popupKey);
  }
}