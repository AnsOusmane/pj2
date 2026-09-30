import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { DecretsService } from 'app/services/decrets.service';
import { PdfCoverFormBase } from '../shared/pdf-cover-form.base';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-decrets-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './decrets-form.html',
  styleUrls: ['./decrets-form.css']
})
export class DecretsForm extends PdfCoverFormBase {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private decretsService: DecretsService
  ) {
    super();
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      file: [null, Validators.required],
      cover: [null]
    });
  }

  onSubmit(): void {
    this.submitUpload(
      this.decretsService.addDecret(this.buildFormData()),
      'Décret ajouté avec succès !'
    );
  }
}
