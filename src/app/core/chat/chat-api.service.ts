import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

/** Un tour d'historique envoyé au backend (format Anthropic). */
export interface ChatHistoryItem {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatApiRequest {
  message: string;
  lang: 'fr' | 'wo' | 'en';
  history?: ChatHistoryItem[];
}

export interface ChatApiResponse {
  /** Faux si la clé API n'est pas configurée côté serveur. */
  configured: boolean;
  /** Réponse de l'assistant, ou null si indisponible / non configuré. */
  reply: string | null;
  error?: string;
}

/** Trace d'une interaction, envoyée au journal d'utilisation (analytics). */
export interface ChatLogPayload {
  sessionId: string;
  langMode: 'auto' | 'fr' | 'wo' | 'en';
  detectedLang: 'fr' | 'wo' | 'en';
  message: string;
  /** Issue : entrée FAQ trouvée, repli sans réponse, ou (à terme) Claude. */
  outcome: 'faq' | 'fallback' | 'claude';
  /** Id de l'entrée FAQ si outcome = 'faq'. */
  matchedId?: string;
}

/**
 * Appel du repli conversationnel (backend → API Claude).
 *
 * Sollicité uniquement quand la FAQ locale ne trouve pas de réponse.
 * Si le backend renvoie `configured: false` (pas de clé), le composant
 * conserve le message de repli local.
 */
@Injectable({ providedIn: 'root' })
export class ChatApiService {
  private apiUrl = `${environment.apiBaseUrl}/chat`;

  constructor(private http: HttpClient) {}

  ask(payload: ChatApiRequest): Observable<ChatApiResponse> {
    return this.http.post<ChatApiResponse>(this.apiUrl, payload);
  }

  /**
   * Journalise une interaction (best-effort, « tire et oublie »).
   * On souscrit sans rien attendre : un échec ne doit jamais perturber le chat.
   */
  log(payload: ChatLogPayload): void {
    this.http.post(`${this.apiUrl}/log`, payload).subscribe({ error: () => {} });
  }
}
