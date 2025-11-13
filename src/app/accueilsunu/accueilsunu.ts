import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-accueilsunu',
  templateUrl: './accueilsunu.html',
  styleUrls: ['./accueilsunu.css']
})
export class AccueilsunuComponent implements OnInit, AfterViewInit {
  @ViewChild('counter') counter!: ElementRef<HTMLSpanElement>;

  private targetCount = 1_450_000; // Exemple : 1.45 million de bénéficiaires
  private duration = 2500;
  private startTime!: number;

  ngOnInit() {}

  ngAfterViewInit() {
    setTimeout(() => this.animateCounter(), 300);
  }

  private animateCounter() {
    const start = 0;
    const end = this.targetCount;

    const step = (timestamp: number) => {
      if (!this.startTime) this.startTime = timestamp;
      const progress = timestamp - this.startTime;
      const percentage = Math.min(progress / this.duration, 1);
      const current = Math.floor(percentage * end);

      this.counter.nativeElement.textContent = current.toLocaleString('fr-FR');

      if (progress < this.duration) {
        requestAnimationFrame(step);
      } else {
        this.counter.nativeElement.textContent = end.toLocaleString('fr-FR');
      }
    };

    requestAnimationFrame(step);
  }
}