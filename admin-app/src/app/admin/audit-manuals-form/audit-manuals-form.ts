import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { AuditManualsService } from 'app/services/audit-manuals.service';
import { PdfCoverFormBase } from '../shared/pdf-cover-form.base';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-audit-manuals-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './audit-manuals-form.html',
  styleUrls: ['./audit-manuals-form.css']
})
export class AuditManualsForm extends PdfCoverFormBase {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auditService: AuditManualsService
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
      this.auditService.addManual(this.buildFormData()),
      'Manuel d\'audit ajouté avec succès !'
    );
  }
}
