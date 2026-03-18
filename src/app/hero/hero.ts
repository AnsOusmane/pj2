import { Component, Inject, PLATFORM_ID, OnInit, ViewChild, ElementRef } from '@angular/core';
import { isPlatformBrowser, NgIf } from '@angular/common';
import { ContactFormComponent } from "../contact-form/contact-form";
import { Router } from '@angular/router';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [NgIf, ContactFormComponent],
  templateUrl: './hero.html',
  styleUrls: ['./hero.css'],
})
export class HeroComponent implements OnInit {

  accordionOpen = 0;

  // POPUP
  showPopup = false;
  popupTitle = '';
  popupText = '';

  popupData = {
    acces: {
      title: "Accès aux soins",
      text: `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-full max-h-[70vh] overflow-y-auto text-left">
          
          <div class="space-y-4">
            <h3 class="text-lg font-bold text-white">Accès immédiat</h3>
            <p class="text-base leading-relaxed">
              En vous inscrivant à la CSU, vous bénéficiez d’un <span class="font-semibold">accès immédiat et prioritaire</span> aux postes de santé, centres de santé et hôpitaux sur tout le territoire national.
            </p>
          </div>

          <div class="space-y-4">
            <h3 class="text-lg font-bold text-white">Prise en charge des maladies</h3>
            <p class="text-base leading-relaxed">
              Toute personne atteinte d’une maladie incluse dans le programme bénéficie d’une <span class="font-semibold">prise en charge complète</span> dans n’importe quel établissement du réseau sanitaire.
            </p>
          </div>

          <div class="space-y-4">
            <button 
              (click)="goToComuPresse()" 
              class="text-left w-full font-semibold text-lg font-bold text-white hover:underline hover:text-green-800 transition-colors duration-300">
              Césariennes gratuites
            </button>
            <p class="text-base leading-relaxed">
              Gratuité totale pour toutes les femmes nécessitant une intervention, garantissant la protection de la mère et du nouveau-né.
            </p>
          </div>

          <div class="space-y-4">
            <h3 class="text-lg font-bold text-white">Soins enfants & nourrissons</h3>
            <p class="text-base leading-relaxed">
              Accès gratuit aux soins essentiels pour tous les enfants sénégalais de moins de 5 ans.
            </p>
          </div>

          <div class="space-y-4">
            <h3 class="text-lg font-bold text-white">Insuffisance rénale</h3>
            <p class="text-base leading-relaxed">
              Prise en charge gratuite sur prescription d’un néphrologue pour tout patient souffrant d’insuffisance rénale chronique.
            </p>
          </div>

          <div class="space-y-4">
            <h3 class="text-lg font-bold text-white">Personnes âgées</h3>
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
            <span class="font-semibold text-white">fortement réduits</span> 
            pour permettre à chaque citoyen d’accéder aux services essentiels.
          </p>

          <section>
            <h3 class="text-xl font-bold text-white flex items-center gap-2">
              Abordabilité garantie
            </h3>
            <p>
              Les coûts des prestations sont ajustés pour rester accessibles à tous, y compris 
              aux familles à revenu limité.
            </p>
          </section>

          <section>
            <h3 class="text-xl font-bold text-white flex items-center gap-2">
              Subventions nationales
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
            <span class="font-semibold text-white">simple, fluide et rapide</span>, 
            afin de faciliter votre accès à la CSU.
          </p>

          <section>
            <h3 class="text-xl font-bold text-white flex items-center gap-2">
              Procédure intuitive
            </h3>
            <p>
              Les étapes d’enregistrement sont clairement guidées et accessibles à tous, 
              même sans connaissances techniques.
            </p>
          </section>

          <section>
            <h3 class="text-xl font-bold text-white flex items-center gap-2">
              Validation rapide
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
            en offrant une <span class="font-semibold text-white">protection sanitaire prioritaire</span>.
          </p>

          <section>
            <h3 class="text-xl font-bold text-white flex items-center gap-2">
              Enfants & nourrissons
            </h3>
            <p>
              Les jeunes enfants bénéficient d’un accès prioritaire aux soins essentiels 
              pour garantir une croissance saine et protégée.
            </p>
          </section>

          <section>
            <h3 class="text-xl font-bold text-white flex items-center gap-2">
              Personnes âgées
            </h3>
            <p>
              Les seniors reçoivent une prise en charge adaptée à leurs besoins et à leur 
              niveau de vulnérabilité.
            </p>
          </section>

          <section>
            <h3 class="text-xl font-bold text-white flex items-center gap-2">
              Familles vulnérables
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

  // VIDÉO
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;
  isPlaying = false;
  showPlayOverlay = false;   // on le montre seulement au clic
  private hideOverlayTimer: any = null;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {}

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
  }

  ngOnDestroy() {
    if (this.hideOverlayTimer) {
      clearTimeout(this.hideOverlayTimer);
    }
  }

  // ──────────────────────────────────────────────
  //                   ACCORDÉON
  // ──────────────────────────────────────────────
  toggleAccordion(n: number) {
    this.accordionOpen = this.accordionOpen === n ? 0 : n;
  }

  // ──────────────────────────────────────────────
  //                   SCROLL
  // ──────────────────────────────────────────────
  scrollTo(target: string) {
    if (!isPlatformBrowser(this.platformId)) return;

    const el = document.getElementById(target);
    if (!el) return;

    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ──────────────────────────────────────────────
  //                   POPUPS
  // ──────────────────────────────────────────────
  openPopup(key: keyof typeof this.popupData) {
    this.popupTitle = this.popupData[key].title;
    this.popupText = this.popupData[key].text;
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
  }

  onPopupClick(event: Event) {
    if (event.target === event.currentTarget) this.closePopup();
  }

  onCardClick(key: string) {
    const popupKey = key as keyof typeof this.popupData;
    this.openPopup(popupKey);
  }

  // ──────────────────────────────────────────────
  //                   REDIRECTIONS
  // ──────────────────────────────────────────────
  goToMaintenance() {
    this.router.navigate(['/maintenance']);
  }

  goToComuPresse() {
    console.log("Lien vers communiqué de presse");
    // → ici tu pourras mettre this.router.navigate(['/communique-presse']) ou window.open(...)
  }

  // ──────────────────────────────────────────────
  //                   VIDÉO PLAYER
  // ──────────────────────────────────────────────
  toggleVideo() {
    if (!this.videoPlayer?.nativeElement) return;

    const video = this.videoPlayer.nativeElement;

    if (video.paused || video.ended) {
      video.play().catch(err => console.log("Lecture auto bloquée:", err));
      this.isPlaying = true;
    } else {
      video.pause();
      this.isPlaying = false;
    }

    // Afficher temporairement l'icône play/pause
    this.showPlayOverlay = true;
    clearTimeout(this.hideOverlayTimer);
    this.hideOverlayTimer = setTimeout(() => {
      this.showPlayOverlay = false;
    }, 1400);
  }
}