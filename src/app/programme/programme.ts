import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-programme',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './programme.html',
})
export class ProgrammeComponent {
  id = '';

  constructor(private route: ActivatedRoute, private cdr: ChangeDetectorRef) {
    this.route.params.subscribe(params => {
      this.id = params['id'];
      this.cdr.markForCheck();
    });
  }
}
