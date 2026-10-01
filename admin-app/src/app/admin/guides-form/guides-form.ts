import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { GuidesService } from 'app/services/guides.service';
import { PdfCoverFormBase } from '../shared/pdf-cover-form.base';
import { IconComponent } from 'app/shared/icon/icon';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-guides-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconComponent],
  templateUrl: './guides-form.html',
  styleUrls: ['./guides-form.css']
})
export class GuidesForm extends PdfCoverFormBase {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private guidesService: GuidesService
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
      this.guidesService.addGuide(this.buildFormData()),
      'Guide ajouté avec succès !'
    );
  }
}
