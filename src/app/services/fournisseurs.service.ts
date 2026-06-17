import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'environments/environment';

export type AgrementStatut = 'recu' | 'en_cours' | 'valide' | 'rejete';

export interface DepotResponse {
  success: boolean;
  message: string;
  numero: string;
  created_at: string;
}

export interface Agrement {
  id: number;
  numero: string;
  raison_sociale: string;
  ninea: string | null;
  rccm: string | null;
  domaine: string | null;
  adresse: string | null;
  telephone: string | null;
  email: string | null;
  contact_nom: string | null;
  message: string | null;
  doc_demande_url: string | null;
  doc_ninea_url: string | null;
  doc_presentation_url: string | null;
  doc_registre_url: string | null;
  doc_fiscale_url: string | null;
  statut: AgrementStatut;
  note_traitement: string | null;
  updated_by_name?: string | null;
  created_at: string;
  updated_at: string;
}

@Injectable({ providedIn: 'root' })
export class FournisseursService {
  private apiUrl = `${environment.apiBaseUrl}/fournisseurs`;

  // Notification à l'agence via Web3Forms (même service que le formulaire de contact).
  // La clé d'accès Web3Forms est publique par conception (safe à exposer côté front).
  private readonly web3formsUrl = 'https://api.web3forms.com/submit';
  private readonly web3formsKey = '41427ced-4d84-4f59-abe5-86cdbe354d51';

  constructor(private http: HttpClient) {}

  /** Dépôt public d'une demande d'agrément (FormData + token anti-robot Turnstile). */
  deposer(data: FormData, captchaToken: string): Observable<DepotResponse> {
    const headers = new HttpHeaders({ 'CF-Turnstile-Token': captchaToken });
    return this.http.post<DepotResponse>(this.apiUrl, data, { headers }).pipe(catchError(this.handleError));
  }

  /**
   * Prévient l'agence d'un nouveau dépôt (best-effort, ne bloque pas la confirmation).
   * N'utilise PAS handleError : un échec de notif ne doit pas remonter comme une erreur de dépôt.
   */
  notifierAgence(p: {
    numero: string; raison_sociale: string;
    domaine?: string | null; ninea?: string | null; rccm?: string | null;
    contact_nom?: string | null; telephone?: string | null; email?: string | null;
    adresse?: string | null; message?: string | null;
  }): Observable<unknown> {
    const payload: Record<string, string> = {
      access_key: this.web3formsKey,
      subject: `🆕 Nouvelle demande d'agrément — ${p.raison_sociale} (${p.numero})`,
      from_name: 'Espace Fournisseurs SEN-CSU',
      'N° dossier': p.numero,
      'Raison sociale': p.raison_sociale,
      'Domaine': p.domaine || '-',
      'NINEA': p.ninea || '-',
      'RCCM': p.rccm || '-',
      'Personne à contacter': p.contact_nom || '-',
      'Téléphone': p.telephone || '-',
      'Email': p.email || '-',
      'Adresse': p.adresse || '-',
      'Message': p.message || '-',
    };
    if (p.email) payload['replyto'] = p.email;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': 'application/json' });
    return this.http.post(this.web3formsUrl, payload, { headers });
  }

  /** Liste de gestion (cellule/admin), filtre statut optionnel. */
  getAllForManage(statut?: AgrementStatut | ''): Observable<Agrement[]> {
    let params = new HttpParams();
    if (statut) params = params.set('statut', statut);
    return this.http.get<Agrement[]>(`${this.apiUrl}/manage`, { params }).pipe(catchError(this.handleError));
  }

  /** Mise à jour du statut / note de traitement. */
  update(id: number, payload: { statut?: AgrementStatut; note_traitement?: string | null }): Observable<Agrement> {
    return this.http.put<Agrement>(`${this.apiUrl}/${id}`, payload).pipe(catchError(this.handleError));
  }

  delete(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'Une erreur est survenue';
    if (error.error instanceof ErrorEvent) {
      message = error.error.message;
    } else {
      message = error.error?.message || `Erreur ${error.status}`;
    }
    console.error('Erreur API Fournisseurs :', error);
    return throwError(() => new Error(message));
  }
}
