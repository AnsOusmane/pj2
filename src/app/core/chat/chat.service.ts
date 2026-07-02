import { Injectable, signal } from '@angular/core';

export type ChatLang = 'fr' | 'wo' | 'en';
/** Mode de langue : détection automatique ou langue forcée. */
export type ChatLangMode = 'auto' | ChatLang;

/** Navigation que le composant doit exécuter (route interne + query params). */
export interface ChatNavAction {
  route: string;
  queryParams?: Record<string, string>;
}

export interface ChatMessage {
  from: 'user' | 'bot';
  text: string;
  /** Suggestions cliquables proposées par le bot (facultatif). */
  suggestions?: string[];
  /** Navigation à exécuter par le composant (facultatif). */
  navigate?: ChatNavAction;
  /** Vrai si aucune entrée FAQ n'a matché → le composant peut tenter Claude. */
  isFallback?: boolean;
  /** Id de l'entrée FAQ qui a répondu (pour le journal d'utilisation). */
  matchedId?: string;
  /** Indicateur « en train d'écrire… » (placeholder pendant l'appel Claude). */
  typing?: boolean;
  /** Message d'accueil : retraduit automatiquement au changement de langue. */
  greeting?: boolean;
}

/** Une entrée de la base de connaissances trilingue. */
interface FaqEntry {
  id: string;
  /** Mots-clés (toutes langues confondues) servant à la correspondance. */
  keywords: string[];
  /** Réponses par langue. */
  answers: Record<ChatLang, string>;
  /** Si vrai, la réponse propose aussi les sujets connus (boutons). */
  suggest?: boolean;
  /** Action de navigation proposée : déclenchée si l'utilisateur acquiesce ensuite. */
  action?: ChatNavAction;
  /** Réponse détaillée donnée si l'utilisateur acquiesce ensuite (« oui »). */
  followUp?: Record<ChatLang, string>;
}

/**
 * Chatbot local (sans IA, sans réseau).
 *
 * Base de connaissances trilingue français / wolof (orthographe francisée) /
 * anglais. Détection automatique de la langue du message + sélecteur manuel.
 * Conçu pour un futur repli sur Claude quand aucune entrée ne correspond.
 */
@Injectable({ providedIn: 'root' })
export class ChatService {
  readonly isOpen = signal(false);
  /** Mode de langue courant ('auto' par défaut). */
  readonly langMode = signal<ChatLangMode>('auto');

  /** Navigation proposée par la dernière réponse, en attente d'un « oui ». */
  private pendingAction: ChatNavAction | null = null;

  /** Réponse détaillée en attente d'un « oui » (question informative). */
  private pendingFollowUp: Record<ChatLang, string> | null = null;

  /** Message de confirmation avant une navigation. */
  private readonly confirmNav: Record<ChatLang, string> = {
    fr: "Je vous y conduis ➡️",
    wo: "Maa ngi la fa yóbbu ➡️",
    en: "Taking you there ➡️",
  };

  open() { this.isOpen.set(true); }
  close() { this.isOpen.set(false); }
  toggle() { this.isOpen.update(v => !v); }

  // ── Messages d'accueil / repli, par langue ─────────────────────────────
  private readonly greeting: Record<ChatLang, string> = {
    fr: "Bonjour 🤝 Je suis l'assistant de la SEN-CSU. Posez-moi une question sur la couverture santé, la césarienne, la dialyse, le Plan Sésame, les agences… en français, en wolof ou en anglais.",
    wo: "Salaamaalekum 🤝 Man may jokkukaayu SEN-CSU. Laaj ma ci sa wergu yaram, césarienne, dialyse, Plan Sésame, mbaa fan la agence yi nekk… ci wolof, français walla anglais ma tontu la.",
    en: "Hello 🤝 I'm the SEN-CSU assistant. Ask me about health coverage, C-section, dialysis, the Sésame Plan, our offices… in French, Wolof or English.",
  };

  private readonly fallback: Record<ChatLang, string> = {
    fr: "Pour cette question, veuillez nous contacter pour plus d'informations :\n☎️ +221 33 859 15 15\n📧 contact@sencsu.sn\n🗺️ Dakar, Sénégal\nSouhaitez-vous que je vous conduise à la page Contact ? Vous pouvez aussi choisir un sujet ci-dessous :",
    wo: "Ci laaj bii, jokkool ak nun ngir am xibaar bu gën a bare :\n☎️ +221 33 859 15 15\n📧 contact@sencsu.sn\n🗺️ Dakar, Senegaal\nBëgg nga ma yóbbu la ci xët Contact bi ? Mën nga it tànn benn mbir ci suuf :",
    en: "For this question, please contact us for more information:\n☎️ +221 33 859 15 15\n📧 contact@sencsu.sn\n🗺️ Dakar, Senegal\nWould you like me to take you to the Contact page? You can also pick a topic below:",
  };

  private readonly topics: Record<ChatLang, string[]> = {
    fr: ['La CSU', 'Césarienne', 'Dialyse', 'Plan Sésame', 'Localiser une agence', 'Nous contacter'],
    wo: ['CSU bi', 'Césarienne', 'Dialyse', 'Plan Sésame', 'Fan la agence yi nekk', 'Jokkoo ak nun'],
    en: ['About CSU', 'C-section', 'Dialysis', 'Sésame Plan', 'Find an office', 'Contact us'],
  };

  // ── Base de connaissances ──────────────────────────────────────────────
  private readonly faq: FaqEntry[] = [
    {
      id: 'greeting',
      keywords: ['bonjour', 'salut', 'coucou', 'hello', 'hi', 'salam', 'salaam', 'asalaa', 'naka nga def', 'nanga def', 'nagadef', 'jaam nga am', 'bonsoir'],
      answers: {
        fr: "Bonjour et bienvenue 🤝 Comment puis-je vous aider aujourd'hui ?",
        wo: "Salaamaalekum, dalal ak jamm 🤝 Naka laa la mën a dimbali tey ?",
        en: "Hello and welcome 🤝 How can I help you today?",
      },
    },
    {
      id: 'languages',
      keywords: ['wolof', 'deg nga wolof', 'degg nga wolof', 'parle wolof', 'parles wolof', 'tu parles', 'vous parlez', 'quelle langue', 'langue', 'langues', 'do you speak', 'speak wolof', 'what language', 'francais', 'anglais', 'english'],
      answers: {
        fr: "Oui, je comprends le wolof, le français et l'anglais 🗣️ Posez-moi votre question dans la langue de votre choix, ou changez la langue avec les boutons en haut. Sur quoi puis-je vous renseigner ?",
        wo: "Waaw, dégg naa wolof, français ak anglais 🗣️ Laajal ma ci làkk wi la neex, walla soppil làkk wi ak butoŋ yi ci kaw. Ci lan laa la mën a xamal ?",
        en: "Yes, I understand Wolof, French and English 🗣️ Ask me in the language you prefer, or switch language with the buttons above. What can I help you with?",
      },
      suggest: true,
    },
    {
      id: 'affirm',
      keywords: ['oui', 'waw', 'waaw','wa','waa', 'yes', 'yeah', 'ok', 'daccord', "d'accord", 'bien sur', 'volontiers', 'stp', 'svp', 'please'],
      answers: {
        fr: "Très bien ! Sur quel sujet souhaitez-vous plus de détails ?",
        wo: "Baax na ! Ci ban mbir nga bëggat xam lu gëna ler ?",
        en: "Great! Which topic would you like more details on?",
      },
      suggest: true,
    },
    {
      id: 'thanks',
      keywords: ['merci', 'thanks', 'thank you', 'jërëjëf', 'jerejef', 'jaraama', 'nice'],
      answers: {
        fr: "Avec plaisir ! 💚 Autre chose ?",
        wo: "Amul solo ! 💚 Am nga beneen ladj ?",
        en: "You're welcome! 💚 Anything else?",
      },
    },
    {
      id: 'bye',
      keywords: ['au revoir', 'bye', 'goodbye', 'ba beneen', 'ba benen', 'mangi dem', 'a bientot'],
      answers: {
        fr: "À bientôt et prenez soin de vous ! 🍃",
        wo: "Ba beneen yoon, té samal sa wergu yaram ! 🍃",
        en: "See you soon, take care! 🍃",
      },
    },
    {
      id: 'what-is-csu',
      keywords: ['csu', 'couverture', 'couverture sanitaire', 'assurance maladie', 'assurance', 'wergu yaram', 'wergou yaram', 'health coverage', 'universal', 'universelle', 'mutuelle', 'cmu'],
      answers: {
        fr: "La CSU (Couverture Sanitaire Universelle) permet à chaque Sénégalais d'accéder aux soins à moindre coût. En adhérant à une mutuelle de santé, vous êtes pris en charge à hauteur d'une grande partie de vos frais médicaux. Souhaitez-vous savoir comment adhérer ?",
        wo: "CSU (Wergu yaram ci ëpp) day tax képp ku nekk Senegaal am fajj bu yomb. Bu nga bokkee ci mutuelle santé, ñoo lay feyal genn wàll bu réy ci sa xaalis u fajj. Bëgg nga xam naka ngay bokk ?",
        en: "Universal Health Coverage (CSU) lets every Senegalese access care at a lower cost. By joining a health mutual, most of your medical costs are covered. Would you like to know how to join?",
      },
      followUp: {
        fr: "Pour adhérer : rendez-vous dans la mutuelle de santé de votre commune avec votre pièce d'identité. La cotisation est modique et couvre toute la famille inscrite. Utilisez « Localiser une agence » pour trouver le point le plus proche.",
        wo: "Ngir bokk : demal ci mutuelle santé bi nekk ci sa kominu, indil sa kayit u yoon. Cotisation bi barewul te day faj njaboot gi yépp. Jëfëndikool « Fan la agence yi nekk » ngir gis bi la gëna jege.",
        en: "To join: go to your municipality's health mutual with your ID card. The contribution is low and covers the whole registered family. Use \"Find an office\" to locate the nearest point.",
      },
    },
    {
      id: 'how-to-join',
      keywords: ['adherer', 'adhesion', 'inscrire', 'inscription', 'bokk', 'comment adherer', 'comment sinscrire', 'how to join', 'register', 'enroll', 'cotisation', 'cotiser'],
      answers: {
        fr: "Pour adhérer à la CSU : rendez-vous dans la mutuelle de santé de votre commune avec votre pièce d'identité. La cotisation est modique et couvre toute la famille inscrite. Utilisez « Localiser une agence » pour trouver le point le plus proche.",
        wo: "Ngir bokk ci CSU : demal ci mutuelle santé bi nekk ci sa kominu, indil sa kayit u yoon (carte d'identité). Cotisation bi barewul te day faj njaboot gi yépp. Jëfëndikool « Fan la agence yi nekk » ngir gis bi la gëna jege.",
        en: "To join the CSU: go to your municipality's health mutual with your ID card. The contribution is low and covers the whole registered family. Use \"Find an office\" to locate the nearest point.",
      },
    },
    {
      id: 'cesarienne',
      keywords: ['cesarienne', 'cesar', 'accouchement', 'accoucher', 'maternite', 'femme enceinte', 'grossesse', 'césarienne', 'c-section', 'delivery', 'wasin', 'jur'],
      answers: {
        fr: "La césarienne est GRATUITE dans les structures publiques de santé au Sénégal, prise en charge par l'État. Aucun frais d'intervention n'est demandé à la patiente. Voulez-vous localiser une structure ?",
        wo: "Césarienne dafa FEEX ci béréb yu wérgu-yaram yu réew mi (public), Ndëmm mi mooy feyal. Amul xaalis bu ñuy laaj jigéen ji. Bëgg nga xam fan la béréb yi nekk ?",
        en: "C-sections are FREE in Senegal's public health facilities, covered by the State. No procedure fee is charged to the patient. Would you like to find a facility?",
      },
      action: { route: '/nos-services-regionaux' },
    },
    {
      id: 'dialyse',
      keywords: ['dialyse', 'rein', 'reins', 'insuffisance renale', 'hemodialyse', 'dialysis', 'kidney', 'nefru'],
      answers: {
        fr: "La dialyse est prise en charge par l'État pour les patients atteints d'insuffisance rénale, dans les centres agréés. Cela réduit fortement le coût des séances. Souhaitez-vous plus d'informations ou une adresse ?",
        wo: "Dialyse bi, Ndëmm mi mooy ko feyal ci ñi am jàngoro u nefru (reins), ci béréb yu agréé yi. Loolu day wàññi lu bare ci njëg u séance yi. Bëgg nga leneen walla adres ?",
        en: "Dialysis is covered by the State for patients with kidney failure, in approved centers. This greatly reduces the cost of sessions. Would you like more info or an address?",
      },
      action: { route: '/nos-services-regionaux' },
    },
    {
      id: 'plan-sesame',
      keywords: ['plan sesame', 'sesame', 'personnes agees', 'age', 'vieux', 'troisieme age', 'mag', 'mag ni', 'elderly', 'senior', 'sésame'],
      answers: {
        fr: "Le Plan Sésame assure la prise en charge sanitaire des personnes âgées de 60 ans et plus au Sénégal, dans les structures publiques. Voulez-vous savoir comment en bénéficier ?",
        wo: "Plan Sésame day faj wergu yaram u mag ñi am 60 at ba kaw ci Senegaal, ci béréb yu réew mi. Bëgg nga xam naka ngay ci jariñoo ?",
        en: "The Sésame Plan provides health coverage for people aged 60 and over in Senegal, in public facilities. Would you like to know how to benefit from it?",
      },
      followUp: {
        fr: "Pour en bénéficier, présentez-vous dans une structure sanitaire publique avec une pièce d'identité prouvant que vous avez 60 ans ou plus : la prise en charge y est appliquée directement. Nos agences peuvent aussi vous orienter.",
        wo: "Ngir ci jariñoo, demal ci béréb bu wérgu-yaram bu réew mi, indil sa kayit u yoon bu wone ne am nga 60 at walla lu ëpp : foofu lañuy sàmm sa wér. Séni agence it mën nañu la jubbanti.",
        en: "To benefit, go to a public health facility with an ID proving you are 60 or older: coverage is applied directly there. Our offices can also guide you.",
      },
    },
    {
      id: 'zero-cinq',
      keywords: ['0 a 5 ans', 'enfant', 'enfants', 'bebe', 'bébé', 'nourrisson', 'gratuite enfant', 'xale', 'gune', 'child', 'children', 'baby', 'under five'],
      answers: {
        fr: "Les soins sont GRATUITS pour les enfants de 0 à 5 ans dans les structures publiques de santé : consultations, médicaments essentiels et hospitalisation. Voulez-vous une adresse près de chez vous ?",
        wo: "Fajj gi dafa FEEX ci xale yu am 0 ba 5 at ci béréb yu réew mi : consultation, garab yu am solo ak hospitalisation. Bëgg nga adres bu la jege ?",
        en: "Care is FREE for children aged 0 to 5 in public health facilities: consultations, essential medicines and hospitalization. Would you like an address near you?",
      },
      action: { route: '/nos-services-regionaux' },
    },
    {
      id: 'pnbsf',
      keywords: ['pnbsf', 'bourse', 'bourses', 'securite familiale', 'bourse de securite', 'famille', 'njaboot', 'family security', 'grant'],
      answers: {
        fr: "Les bénéficiaires du PNBSF (Programme National de Bourses de Sécurité Familiale) sont automatiquement enrôlés dans la CSU et bénéficient d'une prise en charge santé. Voulez-vous en savoir plus ?",
        wo: "Ñi am bourse u PNBSF (Programme National de Bourses de Sécurité Familiale), dañu leen di dugal ci CSU ci saa si, te ñu am faj wergu yaram. Bëgg nga xam lu ëpp ?",
        en: "PNBSF beneficiaries (National Family Security Grant Program) are automatically enrolled in the CSU and receive health coverage. Would you like to know more?",
      },
      followUp: {
        fr: "Si vous êtes bénéficiaire du PNBSF, votre inscription à la CSU est automatique : aucune démarche de cotisation n'est requise de votre part. En cas de doute sur votre statut, rapprochez-vous de votre mutuelle de santé communale ou de nos agences.",
        wo: "Boo nekkee ci ñi am bourse u PNBSF, dañu lay dugal ci CSU ci saa si : soo fayul benn cotisation. Boo amee werante ci sa mbir, jege sa mutuelle santé bu kominu walla séni agence.",
        en: "If you're a PNBSF beneficiary, your CSU enrolment is automatic: no contribution step is required from you. If unsure about your status, contact your municipal health mutual or our offices.",
      },
    },
    {
      id: 'cec',
      keywords: ['cec', 'carte egalite', 'egalite des chances', 'handicap', 'handicape', 'laj', 'disability', 'equal opportunity card'],
      answers: {
        fr: "La Carte d'Égalité des Chances (CEC) donne aux personnes en situation de handicap l'accès à des services de santé et à une prise en charge. Souhaitez-vous savoir comment l'obtenir ?",
        wo: "Kartu Égalité des Chances (CEC) day jox ñi am lâj (handicap) yoon u am fajj ak faj. Bëgg nga xam naka ngay ko am ?",
        en: "The Equal Opportunity Card (CEC) gives people with disabilities access to health services and coverage. Would you like to know how to get one?",
      },
      followUp: {
        fr: "La Carte d'Égalité des Chances s'obtient auprès des services sociaux compétents, sur présentation d'un certificat médical attestant du handicap et d'une pièce d'identité. Nos agences peuvent vous orienter dans les démarches.",
        wo: "Kartu Égalité des Chances, ci béréb yu social yi ngay ko am, boo indee kayit u fajkat (certificat médical) bu wone lâj bi ak sa kayit u yoon. Séni agence mën nañu la jubbanti ci démarche yi.",
        en: "The Equal Opportunity Card is obtained from the relevant social services, upon presenting a medical certificate attesting the disability and an ID. Our offices can guide you through the process.",
      },
    },
    {
      id: 'agence',
      keywords: ['agence', 'agences', 'antenne', 'region', 'regional', 'localiser', 'adresse', 'ou', 'barab', 'fan', 'office', 'location', 'where', 'near'],
      answers: {
        fr: "Vous pouvez localiser nos services régionaux et antennes sur la page « Localiser une agence », avec une carte interactive. Voulez-vous que je vous y conduise ?",
        wo: "Mën nga gis ñu ci séni béréb yu diiwaan yi ci xët « Fan la agence yi nekk », ak kart bu ñuy mën a jëfëndikoo. Bëgg nga ma yóbbu la fa ?",
        en: "You can locate our regional services and offices on the \"Find an office\" page, with an interactive map. Shall I take you there?",
      },
      action: { route: '/nos-services-regionaux' },
    },
    {
      id: 'contact',
      keywords: ['contact', 'contacter', 'telephone', 'numero', 'email', 'ecrire', 'joindre', 'jokkoo', 'appeler', 'call', 'phone', 'reach', 'message'],
      answers: {
        fr: "Vous pouvez nous joindre via le formulaire de la page Contact, ou en visitant l'une de nos agences. Souhaitez-vous ouvrir la page Contact ?",
        wo: "Mën ngeen nu jokkoo ci formulaire bi nekk ci xët Contact, walla nga ñëw ci benn ci séni agence. Bëgg nga ubbi xët Contact bi ?",
        en: "You can reach us via the form on the Contact page, or by visiting one of our offices. Would you like to open the Contact page?",
      },
      action: { route: '/contact' },
    },
    {
      id: 'reclamation',
      keywords: ['reclamation', 'plainte', 'signaler', 'probleme', 'naxtu', 'complaint', 'report an issue'],
      answers: {
        fr: "Pour signaler un problème ou déposer une réclamation, utilisez le formulaire dédié de la page « Faire une réclamation ». Votre demande sera traitée par nos services.",
        wo: "Ngir yëgle jafe-jafe walla teg réclamation, jëfëndikool formulaire bi nekk ci xët « Faire une réclamation ». Séni liggéeykat ñooy topptoo sa laaj.",
        en: "To report a problem or file a complaint, use the dedicated form on the \"File a complaint\" page. Your request will be handled by our services.",
      },
      action: { route: '/reclamation-form' },
    },
    {
      id: 'emploi',
      keywords: ['emploi', 'travail', 'recrutement', 'offre', 'offres', 'carriere', 'candidature', 'cv', 'stage', 'liggeey', 'job', 'career', 'work', 'hiring', 'vacancy'],
      answers: {
        fr: "Retrouvez toutes nos offres d'emploi et déposez votre candidature (CV) sur la page Carrière. Voulez-vous que je l'ouvre ?",
        wo: "Gis séni liggéey yépp te teg sa candidature (CV) ci xët Carrière. Bëgg nga ma ubbi ko ?",
        en: "Find all our job offers and submit your application (CV) on the Careers page. Would you like me to open it?",
      },
      action: { route: '/carriere' },
    },
    {
      id: 'cost',
      keywords: ['prix', 'cout', 'combien', 'tarif', 'gratuit', 'payer', 'njeg', 'nate', 'xaalis', 'cost', 'price', 'how much', 'free', 'fee'],
      answers: {
        fr: "Plusieurs dispositifs sont GRATUITS (césarienne, soins des 0-5 ans, dialyse selon les centres). Pour la CSU, la cotisation à la mutuelle est modique. Sur quel dispositif voulez-vous le détail des coûts ?",
        wo: "Ay dispositif yu bare dañu FEEX (césarienne, fajj u xale yu 0-5 at, dialyse ci béréb yu agréé). Ci CSU, cotisation u mutuelle bi barewul. Ci ban dispositif nga bëgg xam njëg gi ?",
        en: "Several programs are FREE (C-section, care for 0-5 year-olds, dialysis in some centers). For the CSU, the mutual contribution is low. Which program would you like cost details on?",
      },
    },
  ];

  /** Construit le message d'accueil dans la langue courante (sans effet de bord). */
  private buildGreeting(): ChatMessage {
    const lang = this.resolveLang('');
    return { from: 'bot', text: this.greeting[lang], suggestions: this.topics[lang], greeting: true };
  }

  /** Message d'accueil à l'ouverture (réinitialise le contexte). */
  greetingMessage(): ChatMessage {
    this.pendingAction = null;
    this.pendingFollowUp = null;
    return this.buildGreeting();
  }

  /** Message d'accueil retraduit dans la langue courante (au changement de langue). */
  refreshGreeting(): ChatMessage {
    return this.buildGreeting();
  }

  /** Construit la réponse du bot à un message utilisateur. */
  reply(userText: string): ChatMessage {
    const lang = this.resolveLang(userText);
    const entry = this.match(userText);

    // Acquiescement (« oui / waw / yes ») consécutif à une proposition :
    if (entry?.id === 'affirm') {
      // 1) navigation en attente → on l'exécute.
      if (this.pendingAction) {
        const nav = this.pendingAction;
        this.pendingAction = null;
        this.pendingFollowUp = null;
        return { from: 'bot', text: this.confirmNav[lang], navigate: nav, matchedId: 'affirm' };
      }
      // 2) réponse détaillée en attente → on la donne.
      if (this.pendingFollowUp) {
        const detail = this.pendingFollowUp[lang];
        this.pendingFollowUp = null;
        return { from: 'bot', text: detail, suggestions: this.topics[lang], matchedId: 'affirm' };
      }
    }

    if (entry) {
      // Mémorise l'éventuelle suite proposée par cette réponse (pour un « oui » ultérieur).
      this.pendingAction = entry.action ?? null;
      this.pendingFollowUp = entry.followUp ?? null;
      return {
        from: 'bot',
        text: entry.answers[lang],
        suggestions: entry.suggest ? this.topics[lang] : undefined,
        matchedId: entry.id,
      };
    }

    // Pas de réponse : on propose la page Contact (un « oui » ensuite y conduit).
    this.pendingAction = { route: '/contact' };
    this.pendingFollowUp = null;
    return { from: 'bot', text: this.fallback[lang], suggestions: this.topics[lang], isFallback: true };
  }

  /** Langue effective pour un message (mode forcé ou détection) — usage public. */
  languageFor(text: string): ChatLang {
    return this.resolveLang(text);
  }

  // ── Interne ────────────────────────────────────────────────────────────

  /** Détermine la langue effective : mode forcé, sinon détection. */
  private resolveLang(text: string): ChatLang {
    const mode = this.langMode();
    if (mode !== 'auto') return mode;
    return this.detectLang(text);
  }

  /** Détection heuristique simple de la langue d'un message. */
  private detectLang(text: string): ChatLang {
    const t = this.normalize(text);
    if (!t) return 'fr';

    const woMarkers = ['naka', 'nanga', 'nga ', 'nagadef', 'wergu', 'wergou', 'yaram', 'jerejef', 'jërëjëf', 'jaraama', 'salaam', 'ndax', 'lan moy', 'lan mooy', 'fan la', 'bëgg', 'begg', 'naa', 'deg nga', 'degg', 'dégg', 'waw', 'waaw', 'yaw', 'man ', 'ñu', 'yépp', 'jokkoo', 'njaboot', 'xale', 'mag ñi', 'mag ni', 'dama', 'damay', 'ana ', 'fii ', 'foofu', 'fajj', 'faj ', 'baax', 'noo '];
    const enMarkers = ['the ', 'what', 'how', 'where', 'is ', 'are ', 'can ', 'i want', 'i need', 'please', 'hello', 'help', 'you ', 'my ', 'child', 'health', 'cost', 'free', 'find'];

    const woHits = woMarkers.filter(m => t.includes(m)).length;
    const enHits = enMarkers.filter(m => t.includes(m)).length;

    if (woHits > 0 && woHits >= enHits) return 'wo';
    if (enHits > woHits && enHits > 0) return 'en';
    return 'fr';
  }

  /** Trouve la meilleure entrée FAQ correspondant au message. */
  private match(text: string): FaqEntry | null {
    const t = this.normalize(text);
    if (!t) return null;

    let best: FaqEntry | null = null;
    let bestScore = 0;

    for (const entry of this.faq) {
      let score = 0;
      for (const kw of entry.keywords) {
        const k = this.normalize(kw);
        if (!k) continue;
        if (t.includes(k)) {
          // Un mot-clé long/multi-mots pèse plus qu'un token court.
          score += k.includes(' ') ? 3 : k.length >= 5 ? 2 : 1;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        best = entry;
      }
    }
    return bestScore > 0 ? best : null;
  }

  private normalize(s: string): string {
    return ' ' + s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9ñ\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim() + ' ';
  }
}
