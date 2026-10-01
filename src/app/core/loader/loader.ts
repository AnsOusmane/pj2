import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-loader',
  standalone: true,
  templateUrl: './loader.html',
  styleUrls: ['./loader.css'],
})
export class LoaderComponent {}
