import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-missionsvision',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
  <section class="min-h-screen w-full bg-gradient-to-b from-green-50 to-white flex flex-col items-center py-0 px-6">

    <!-- Photo de couverture + Titre -->
    <div class="w-full relative h-[400px] md:h-[500px] flex items-center justify-center overflow-hidden rounded-b-3xl">
      <img src="assets/illustrations/mission1.png" alt="Cover Image" class="absolute inset-0 w-full h-full object-cover brightness-75">
      <div class="relative text-center text-white animate-fade-in">
        <h1 class="text-5xl md:text-7xl font-extrabold drop-shadow-xl">SEN-CSU</h1>
        <p class="text-2xl md:text-3xl mt-4 font-semibold">Vision & Missions</p>
      </div>
    </div>

    <!-- Vision Card -->
    <div class="max-w-4xl w-full bg-white rounded-2xl shadow-2xl p-10 -mt-20 mb-16 transform hover:scale-[1.02] transition-all duration-500 animate-slide-up">
      <h2 class="text-3xl font-semibold text-green-700 mb-4">Vision de la SEN-CSU</h2>
      <p class="text-gray-700 leading-relaxed text-lg">
        Garantir à chaque citoyen, sans distinction de revenu ou de lieu de résidence, un accès équitable à des services
        de santé de qualité. La SEN-CSU ambitionne de faire du Sénégal un pays où l’assurance maladie universelle est une
        réalité, assurant une protection sociale renforcée et une prise en charge médicale accessible à tous, y compris
        pour les soins essentiels et coûteux comme la césarienne gratuite, la dialyse gratuite et d’autres formes
        d’assistance médicale.
      </p>
    </div>

    <!-- Missions Section -->
    <div class="max-w-5xl w-full mb-20">
      <h2 class="text-3xl font-semibold text-green-700 mb-12 text-center animate-fade-in">Missions de la SEN-CSU</h2>

      <div class="grid md:grid-cols-1 gap-8">

        <!-- Mission 1 -->
        <div class="bg-white p-6 rounded-2xl shadow-lg border border-green-100 flex flex-col md:flex-row items-start gap-4 animate-slide-up delay-100 hover:shadow-2xl transition-all duration-300">
          <img src="assets/illustrations/mission5.png" alt="Mission 1" class="h-48 md:h-64 w-full md:w-1/3 object-cover rounded-xl animate-bounce">
          <div class="flex-1">
            <h3 class="text-2xl font-semibold text-green-700 mb-2">Renforcer l'offre de soins</h3>
            <p class="text-gray-700 leading-relaxed">
              Garantir des services de santé disponibles, accessibles et de qualité sur l'ensemble du territoire national.
            </p>
          </div>
        </div>

        <!-- Mission 2 -->
        <div class="bg-white p-6 rounded-2xl shadow-lg border border-green-100 flex flex-col md:flex-row items-start gap-4 animate-slide-up delay-200 hover:shadow-2xl transition-all duration-300">
          <img src="assets/illustrations/mission2.png" alt="Mission 2" class="h-48 md:h-64 w-full md:w-1/3 object-cover rounded-xl animate-bounce">
          <div class="flex-1">
            <h3 class="text-2xl font-semibold text-green-700 mb-2">Rendre la demande de soins solvable</h3>
            <p class="text-gray-700 leading-relaxed">
              Faciliter l'accès aux prestations médicales grâce à des mécanismes de protection sociale adaptés.
            </p>
          </div>
        </div>

        <!-- Mission 3 -->
        <div class="bg-white p-6 rounded-2xl shadow-lg border border-green-100 flex flex-col md:flex-row items-start gap-4 animate-slide-up delay-300 hover:shadow-2xl transition-all duration-300">
          <img src="assets/illustrations/mission3.png" alt="Mission 3" class="h-48 md:h-64 w-full md:w-1/3 object-cover rounded-xl animate-bounce">
          <div class="flex-1">
            <h3 class="text-2xl font-semibold text-green-700 mb-2">Étendre l'affiliation</h3>
            <p class="text-gray-700 leading-relaxed">
              Étendre l’assurance maladie à l’ensemble de la population, en ciblant les ménages vulnérables,
              les communautés rurales et le secteur informel.
            </p>
          </div>
        </div>

        <!-- Mission 4 -->
        <div class="bg-white p-6 rounded-2xl shadow-lg border border-green-100 flex flex-col md:flex-row items-start gap-4 animate-slide-up delay-400 hover:shadow-2xl transition-all duration-300">
          <img src="assets/illustrations/mission4.png" alt="Mission 4" class="h-48 md:h-64 w-full md:w-1/3 object-cover rounded-xl animate-bounce">
          <div class="flex-1">
            <h3 class="text-2xl font-semibold text-green-700 mb-2">Assurer l'équité d'accès</h3>
            <p class="text-gray-700 leading-relaxed">
              Garantir des prestations identiques pour tous, notamment pour les populations vulnérables.
            </p>
          </div>
        </div>

        <!-- Mission 5 -->
        <div class="bg-white p-6 rounded-2xl shadow-lg border border-green-100 flex items-start gap-4 animate-slide-up delay-500 hover:shadow-2xl transition-all duration-300 md:col-span-2">
          <img src="assets/illustrations/mission5.png" alt="Mission 5" class="h-32 w-32 flex-shrink-0 animate-bounce">
          <div>
            <h3 class="text-2xl font-semibold text-green-700 mb-2">Développer l’assistance médicale gratuite</h3>
            <p class="text-gray-700 leading-relaxed">
              Mettre en œuvre des dispositifs de prise en charge intégrale pour les actes essentiels comme la césarienne,
              la dialyse et d’autres interventions prioritaires.
            </p>
          </div>
        </div>

        <!-- Mission 6 -->
        <div class="bg-white p-6 rounded-2xl shadow-lg border border-green-100 flex items-start gap-4 animate-slide-up delay-600 hover:shadow-2xl transition-all duration-300 md:col-span-2">
          <img src="assets/illustrations/mission6.png" alt="Mission 6" class="h-32 w-32 flex-shrink-0 animate-bounce">
          <div>
            <h3 class="text-2xl font-semibold text-green-700 mb-2">Promouvoir un financement durable</h3>
            <p class="text-gray-700 leading-relaxed">
              Mettre en place un système solidaire basé sur la mutualisation pour réduire les barrières financières.
            </p>
          </div>
        </div>

      </div>
    </div>

  </section>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 1s ease-out both; }
    .animate-slide-up { animation: slideUp 1s ease-out both; }
    .delay-100 { animation-delay: .1s; }
    .delay-200 { animation-delay: .2s; }
    .delay-300 { animation-delay: .3s; }
    .delay-400 { animation-delay: .4s; }
    .delay-500 { animation-delay: .5s; }
    .delay-600 { animation-delay: .6s; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
    .animate-bounce { animation: bounce 2s infinite; }
    @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
  `]
})
export class MissionsvisionComponent {}
