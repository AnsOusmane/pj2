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
  archived_at?: string | null;
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

  /** Dépôt public d'une demande d'agrément (FormData). Anti-robot Turnstile désactivé pour l'instant. */
  deposer(data: FormData): Observable<DepotResponse> {
    return this.http.post<DepotResponse>(this.apiUrl, data).pipe(catchError(this.handleError));
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
      subject: `Nouvelle demande d'agrément — ${p.raison_sociale} (${p.numero})`,
      from_name: "demande d'agrément SEN-CSU",
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

  /** Liste de gestion (cellule/admin), filtre statut optionnel. Actifs par défaut, ou archivés. */
  getAllForManage(statut?: AgrementStatut | '', archived = false): Observable<Agrement[]> {
    let params = new HttpParams();
    if (statut) params = params.set('statut', statut);
    if (archived) params = params.set('archived', 'true');
    return this.http.get<Agrement[]>(`${this.apiUrl}/manage`, { params }).pipe(catchError(this.handleError));
  }

  /** Mise à jour du statut / note de traitement. */
  update(id: number, payload: { statut?: AgrementStatut; note_traitement?: string | null }): Observable<Agrement> {
    return this.http.put<Agrement>(`${this.apiUrl}/${id}`, payload).pipe(catchError(this.handleError));
  }

  /** Archive une demande d'agrément (soft-archive). */
  archive(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.patch<{ success: boolean; message: string }>(`${this.apiUrl}/${id}/archive`, {})
      .pipe(catchError(this.handleError));
  }

  /** Restaure une demande d'agrément archivée. */
  unarchive(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.patch<{ success: boolean; message: string }>(`${this.apiUrl}/${id}/unarchive`, {})
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message: string;

    if (error.error instanceof ErrorEvent || error.status === 0) {
      // Erreur réseau / client : serveur injoignable, coupure internet, CORS…
      message = 'Impossible de contacter le serveur. Vérifiez votre connexion internet et réessayez.';
    } else if (error.status === 413) {
      // Charge trop lourde (un PDF dépasse la limite).
      message = 'Un des fichiers PDF dépasse la taille maximale autorisée (10 Mo).';
    } else if (error.status === 429) {
      // Limiteur anti-abus : on garde le message du serveur s'il existe.
      message = error.error?.message || 'Trop de tentatives. Veuillez réessayer dans un moment.';
    } else if (Array.isArray(error.error?.errors) && error.error.errors.length) {
      // Erreurs de validation Zod : on détaille les champs concernés.
      message = error.error.errors
        .map((e: { message?: string }) => e?.message)
        .filter(Boolean)
        .join(' • ') || (error.error?.message ?? 'Données invalides.');
    } else if (error.status >= 500) {
      message = 'Le serveur a rencontré une erreur. Réessayez dans quelques instants.';
    } else {
      message = error.error?.message || `Une erreur est survenue (code ${error.status}).`;
    }

    console.error('Erreur API Fournisseurs :', error);
    return throwError(() => new Error(message));
  }
}
