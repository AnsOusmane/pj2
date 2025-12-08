// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ActuService, Actu } from './actu.service';
// import { ActuCardComponent } from './actu-card/actu-card';

// @Component({
//   selector: 'app-actus-page',
//   standalone: true,
//   imports: [
//     CommonModule,
//     ActuCardComponent   // ✅ OBLIGATOIRE
//   ],
//   templateUrl: './actus-page.html'
// })
// export class ActusPageComponent implements OnInit {

//   actualites: Actu[] = [];

//   constructor(private actuService: ActuService) {}

//   ngOnInit() {
//     this.actuService.getActualites().subscribe(res => {
//       this.actualites = res;
//     });
//   }
// }
