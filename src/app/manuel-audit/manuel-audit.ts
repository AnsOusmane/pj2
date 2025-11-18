import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-manuel-audit',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './manuel-audit.html',
  styleUrl: './manuel-audit.css'
})
export class ManuelAuditComponent {

  audits = [
    {
      titre: "Manuel d'audit interne – Version 2024",
      description: "Document officiel présentant les procédures, méthodologies et normes d’audit interne.",
      fichier: "manuels-audit/manuel-audit-2024.pdf"
    },
    {
      titre: "Guide méthodologique d’audit des risques",
      description: "Guide pratique pour réaliser des audits orientés risques selon les bonnes pratiques internationales.",
      fichier: "manuels-audit/guide-audit-risques.pdf"
    }
  ];

}
