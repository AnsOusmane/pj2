import {
  Component,
  signal,
  effect,
  ElementRef,
  ViewChild,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { ChatService, ChatMessage, ChatLangMode } from './chat.service';
import { ChatApiService, ChatHistoryItem } from './chat-api.service';

/**
 * Widget de chatbot flottant (bulle en bas à gauche).
 *
 * Assistant local trilingue (FR / Wolof / EN) : aucune requête réseau.
 * Détection auto de la langue + sélecteur manuel. Prêt pour un futur
 * repli sur Claude côté backend.
 */
@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat.html',
  styleUrls: ['./chat.css'],
})
export class ChatComponent {
  @ViewChild('scrollZone') scrollZone?: ElementRef<HTMLDivElement>;
  @ViewChild('chatInput') chatInput?: ElementRef<HTMLInputElement>;

  messages = signal<ChatMessage[]>([]);
  draft = signal('');
  private isBrowser: boolean;

  /** Options du sélecteur de langue. */
  readonly langs: { value: ChatLangMode; label: string }[] = [
    { value: 'auto', label: 'Auto' },
    { value: 'fr', label: 'FR' },
    { value: 'wo', label: 'Wolof' },
    { value: 'en', label: 'EN' },
  ];

  constructor(
    public chat: ChatService,
    private chatApi: ChatApiService,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

    // À la première ouverture, afficher le message d'accueil.
    effect(() => {
      if (this.chat.isOpen() && this.messages().length === 0) {
        this.messages.set([this.chat.greetingMessage()]);
        this.focusInput();
      }
    });
  }

  setLang(mode: ChatLangMode): void {
    this.chat.langMode.set(mode);
  }

  onSubmit(event?: Event): void {
    // Empêche la soumission native du formulaire (qui rechargerait la page
    // et fermerait le chat), car ce composant n'utilise pas FormsModule.
    event?.preventDefault();

    const text = this.draft().trim();
    if (!text) return;

    this.messages.update(m => [...m, { from: 'user', text }]);
    this.draft.set('');

    const botReply = this.chat.reply(text);

    // FAQ locale a répondu : on affiche et on gère la navigation éventuelle.
    if (!botReply.isFallback) {
      this.messages.update(m => [...m, botReply]);
      this.scrollToBottom();
      if (botReply.navigate) {
        this.router.navigate(
          [botReply.navigate.route],
          botReply.navigate.queryParams ? { queryParams: botReply.navigate.queryParams } : {},
        );
      }
      return;
    }

    // Aucune entrée FAQ → repli conversationnel Claude (avec « en train d'écrire… »).
    this.askClaude(text, botReply);
  }

  /**
   * Interroge le backend (API Claude) quand la FAQ n'a rien trouvé.
   * En cas d'échec ou de service non configuré, on retombe sur le
   * message de repli local `localFallback`.
   */
  private askClaude(text: string, localFallback: ChatMessage): void {
    const lang = this.chat.languageFor(text);
    const history = this.buildHistory();

    // Placeholder animé pendant l'attente.
    const typing: ChatMessage = { from: 'bot', text: '', typing: true };
    this.messages.update(m => [...m, typing]);
    this.scrollToBottom();

    this.chatApi.ask({ message: text, lang, history }).subscribe({
      next: (res) => {
        this.replaceTyping(
          res.configured && res.reply ? { from: 'bot', text: res.reply } : localFallback,
        );
      },
      error: () => this.replaceTyping(localFallback),
    });
  }

  /** Remplace le placeholder « en train d'écrire… » par le message final. */
  private replaceTyping(final: ChatMessage): void {
    this.messages.update(m => {
      const without = m.filter(x => !x.typing);
      return [...without, final];
    });
    this.scrollToBottom();
  }

  /** Construit l'historique (tours précédents) envoyé au backend. */
  private buildHistory(): ChatHistoryItem[] {
    const msgs = this.messages().filter(m => !m.typing && m.text);
    // Le dernier élément est le message courant de l'utilisateur : il est
    // transmis séparément (champ `message`), donc on l'exclut de l'historique.
    return msgs
      .slice(0, -1)
      .map(m => ({ role: m.from === 'user' ? ('user' as const) : ('assistant' as const), content: m.text }))
      .slice(-6);
  }

  /** Clic sur une suggestion : on l'envoie comme un message utilisateur. */
  onSuggestion(text: string): void {
    this.draft.set(text);
    this.onSubmit();
  }

  private focusInput(): void {
    if (!this.isBrowser) return;
    setTimeout(() => this.chatInput?.nativeElement.focus(), 50);
  }

  private scrollToBottom(): void {
    if (!this.isBrowser) return;
    setTimeout(() => {
      const el = this.scrollZone?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }, 0);
  }
}
