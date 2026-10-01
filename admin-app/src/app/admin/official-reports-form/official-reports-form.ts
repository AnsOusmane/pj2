import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OfficialReportsService } from '../../services/official-reports.service';
import { PdfCoverFormBase } from '../shared/pdf-cover-form.base';
import { IconComponent } from 'app/shared/icon/icon';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-official-reports-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconComponent],
  templateUrl: './official-reports-form.html'
})
export class OfficialReportsForm extends PdfCoverFormBase {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private reportsService: OfficialReportsService
  ) {
    super();
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      report_type: [''],
      file: [null, Validators.required],
      cover: [null]
    });
  }

  onSubmit(): void {
    this.submitUpload(
      this.reportsService.addReport(this.buildFormData({ report_type: this.form.value.report_type })),
      'Rapport ajouté avec succès !'
    );
  }
}
