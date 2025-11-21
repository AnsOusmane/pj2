import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-zero-cinq-ans',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './zero-cinq-ans.html',
  styleUrls: ['./zero-cinq-ans.css']
})
export class ZeroCinqAnsComponent {

  mouseX = 0;
  mouseY = 0;

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
  }
}
