// src/app/newsletters/newsletters-form.ts
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';

import { NewslettersService } from '../../services/newsletters.service';
import { PdfCoverFormBase } from '../shared/pdf-cover-form.base';
import { IconComponent } from 'app/shared/icon/icon';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-newsletters-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconComponent],
  templateUrl: './newsletters-form.html',
  styleUrls: ['./newsletters-form.css']
})
export class NewslettersForm extends PdfCoverFormBase {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private newslettersService: NewslettersService
  ) {
    super();
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: [''],
      file: [null, Validators.required],
      cover: [null]
    });
  }

  onSubmit(): void {
    this.submitUpload(
      this.newslettersService.addNewsletter(this.buildFormData()),
      'Newsletter publiée avec succès !'
    );
  }
}
