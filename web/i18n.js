/* =========================================================
   Nova · Languages (English, Spanish, French)
   - Static text:   data-i18n="key"        (plain text)
                    data-i18n-html="key"   (text with tags/placeholders)
                    data-i18n-aria="key"   (aria-label)
                    data-i18n-content="key" (meta content)
   - Placeholders:  {reward} {symbol} {network} {name} and the live
                    stats {supply} {max} {miners} {mines} {remaining} {pct}
   - The choice is remembered, and ?lang=es / ?lang=fr in the URL works too.
   To add a language, copy the "en" block and translate it.
   ========================================================= */
(() => {
  const NB = " "; // non-breaking space (French punctuation)

  const DICT = {
    en: {
      "meta.title": "Nova · The coin you mine in one click",
      "meta.titleMiner": "Nova Miner",
      "meta.desc": "Nova is a coin on the Base network that anyone can mine for free from the web, once every 24 hours.",
      "meta.descMiner": "Mine 100 NOVA every 24 hours on the Base network.",
      "lang.label": "Language",

      "nav.how": "How it works",
      "nav.rules": "Rules",
      "nav.mine": "Mine",
      "nav.faq": "FAQ",
      "nav.openMiner": "Open miner",
      "nav.sections": "Sections",
      "connect.long": "Connect wallet",
      "connect.short": "Connect",
      "connect.aria": "Wallet connected: {account}",
      "banner": "Contract address missing: paste it into <code>CONTRACT_ADDRESS</code> in <code>app.js</code>.",

      "hero.live": "Live on {network}",
      "hero.l1": "The coin",
      "hero.l2": "you mine",
      "hero.l3": "in one click.",
      "hero.lead": "Connect your wallet, hit Mine and get {reward} {symbol}. Every wallet can mine again every 24 hours, until the million coins run out.",
      "hero.start": "Start mining",
      "hero.see": "See how it works",
      "hero.liveData": "Live data",
      "hero.mined": "<strong>{supply}</strong> {symbol} mined",
      "hero.miners": "<strong>{miners}</strong> miners",
      "hero.left": "<strong>{remaining}</strong> left to mine",
      "hint.drag": "Drag the coin to spin it",
      "hint.tap": "Tap the coin to flip it",

      "manifesto": "No server farms. No graphics cards. No presale and no coins set aside for the creator. Just a public contract that gives 100 NOVA to anyone who asks, once a day, until it reaches one million.",

      "rules.title": "Rules nobody can change",
      "rules.sub": "They are written into the contract. Not even its creator can touch them, and anyone can read the code on the block explorer.",
      "r1.h": "One million. Not one more.",
      "r1.p": "The contract can never create more than 1,000,000 NOVA. Once they are all mined, mining closes forever.",
      "r2.h": "{reward} NOVA per mine",
      "r2.p": "Every time you mine, the coins go straight to your wallet. No middlemen.",
      "r3.h": "Once every 24 hours",
      "r3.p": "The contract remembers when you last mined and rejects any attempt before your time is up.",
      "r4.h": "The creator starts at zero",
      "r4.p": "No reserved coins. Whoever launched Nova has to mine just like everyone else.",

      "how.title": "Three steps, zero hardware",
      "s1.h": "Connect your wallet",
      "s1.p": "Click “Connect wallet” and approve in MetaMask. The site switches you to the Base network automatically.",
      "s2.h": "Hit Mine",
      "s2.p": "Confirm the transaction. You pay a few cents in gas and get {reward} NOVA right away.",
      "s3.h": "Come back tomorrow",
      "s3.p": "A countdown tells you when you can mine again.",

      "mine.title": "Mine your first NOVA",
      "mine.sub": "Read live from the blockchain. Refreshes on its own every few seconds.",
      "mine.full": "Open the full miner, with live activity",
      "supply.title": "Supply mined",
      "supply.of": "{supply} of {max} {symbol}",
      "stat.mines": "Mines",
      "stat.miners": "Miners",
      "stat.left": "Left to mine",
      "stat.leftShort": "Left",
      "balance": "Your balance",
      "addToken": "Add {symbol} to MetaMask",
      "viewContract": "View contract",

      "faq.q1": "Does mining cost money?",
      "faq.a1": "The coin is free, but every transaction on Base pays a small network fee (gas) in ETH. It is usually a few cents.",
      "faq.q2": "Is this mining like Bitcoin?",
      "faq.a2": "Not quite. In Bitcoin, computers compete to solve calculations. Here, mining is a contract rule that creates new coins for whoever asks, with a limit per wallet per day. What they share is a limited supply that is handed out little by little.",
      "faq.q3": "Why Base?",
      "faq.a3": "Base is a layer-2 network built on Ethereum. It inherits Ethereum’s security, but fees are much lower, so one transaction a day makes sense.",
      "faq.q4": "Is it worth anything? Can I buy it?",
      "faq.a4": "No. It is an educational project: it is not sold and is not listed on any exchange. It exists to learn how tokens and smart contracts work.",
      "faq.q5": "I can’t see my coins in MetaMask",
      "faq.a5": "Click “Add NOVA to MetaMask” in the mining panel. The coin will show up in your wallet with its logo.",

      "outro.text": "One click a day. All the way to a million.",
      "outro.cta": "Open the miner",
      "footer.note": "Educational project on the {network} network. No monetary value.",
      "footer.contract": "Contract on the explorer",
      "footer.back": "← Back to home",

      "miner.tag": "Miner",
      "miner.stage": "Mine",
      "wallet.title": "Your wallet",
      "wallet.next": "Next mine",
      "wallet.last": "Last mined",
      "wallet.reward": "Reward per mine",
      "feed.title": "Recent mines",
      "feed.loading": "Loading…",
      "feed.notLive": "Recent mines will appear here once the contract is live.",
      "feed.none": "No mines in the last few hours. Be the first!",
      "feed.error": "Couldn’t load recent mines right now.",
      "feed.you": "You",

      "ago.now": "just now",
      "ago.min": "{n} min ago",
      "ago.h": "{n} h ago",
      "ago.d": "{n} d ago",
      "never": "Never",

      "btn.connect": "Connect your wallet",
      "btn.exhausted": "Supply exhausted",
      "btn.next": "Next mine in {time}",
      "btn.mine": "Mine",
      "btn.confirm": "Confirm in MetaMask…",
      "btn.mining": "Mining…",
      "next.never": "Never: all mined",
      "next.ready": "Ready now",

      "st.need": "You need MetaMask and a few cents of ETH on {network} for gas.",
      "st.ethers": "Couldn’t load the ethers.js library. Check your internet connection.",
      "st.notConfigured": "The contract isn’t configured yet.",
      "st.noMetamask": "MetaMask not detected. Install it from metamask.io and reload the page.",
      "st.ready": "Ready. Each wallet can mine once every 24 hours.",
      "st.confirm": "Check the MetaMask window and confirm the transaction.",
      "st.sent": "Transaction sent. Waiting for confirmation…{view}",
      "st.view": "view",
      "st.mined": "You mined {amount} {symbol}! Come back in 24 h.",

      "toast.setAddress": "Set the contract address in app.js first",
      "toast.mined": "⛏️ Mined successfully!",
      "toast.needMM": "You need MetaMask",
      "toast.notConfigured": "Contract not configured",
      "toast.added": "🦊 {symbol} added to your wallet",

      "err.cancel": "You cancelled the transaction.",
      "err.funds": "You don’t have enough ETH on {network} to pay for gas. A few cents is enough.",
      "err.wait": "It hasn’t been 24 h since your last mine yet.",
      "err.max": "The whole supply has already been mined.",
      "err.generic": "Something went wrong: {msg}",
      "err.unknown": "unknown error",
    },

    es: {
      "meta.title": "Nova · La moneda que minas con un clic",
      "meta.titleMiner": "Nova · Minero",
      "meta.desc": "Nova es una moneda en la red Base que cualquiera puede minar gratis desde la web, una vez cada 24 horas.",
      "meta.descMiner": "Mina 100 NOVA cada 24 horas en la red Base.",
      "lang.label": "Idioma",

      "nav.how": "Cómo funciona",
      "nav.rules": "Reglas",
      "nav.mine": "Minar",
      "nav.faq": "Preguntas",
      "nav.openMiner": "Ir a minar",
      "nav.sections": "Secciones",
      "connect.long": "Conectar wallet",
      "connect.short": "Conectar",
      "connect.aria": "Wallet conectada: {account}",
      "banner": "Falta la dirección del contrato: pégala en <code>CONTRACT_ADDRESS</code> dentro de <code>app.js</code>.",

      "hero.live": "En vivo en {network}",
      "hero.l1": "La moneda",
      "hero.l2": "que minas",
      "hero.l3": "con un clic.",
      "hero.lead": "Conecta tu wallet, pulsa Minar y recibe {reward} {symbol}. Cada wallet puede volver a minar cada 24 horas, hasta que se acabe el millón de monedas.",
      "hero.start": "Empezar a minar",
      "hero.see": "Ver cómo funciona",
      "hero.liveData": "Datos en directo",
      "hero.mined": "<strong>{supply}</strong> {symbol} minados",
      "hero.miners": "<strong>{miners}</strong> mineros",
      "hero.left": "<strong>{remaining}</strong> por minar",
      "hint.drag": "Arrastra la moneda para girarla",
      "hint.tap": "Toca la moneda para girarla",

      "manifesto": "Sin granjas de servidores. Sin tarjetas gráficas. Sin preventa y sin monedas reservadas para el creador. Solo un contrato público que da 100 NOVA a quien lo pida, una vez al día, hasta llegar al millón.",

      "rules.title": "Reglas que nadie puede cambiar",
      "rules.sub": "Están escritas en el contrato. Ni siquiera su creador puede tocarlas, y cualquiera puede leer el código en el explorador de bloques.",
      "r1.h": "Un millón. Ni una más.",
      "r1.p": "El contrato nunca podrá crear más de 1.000.000 NOVA. Cuando se hayan minado todas, la minería se cierra para siempre.",
      "r2.h": "{reward} NOVA por minado",
      "r2.p": "Cada vez que minas, las monedas van directas a tu wallet. Sin intermediarios.",
      "r3.h": "Una vez cada 24 horas",
      "r3.p": "El contrato recuerda cuándo minaste por última vez y rechaza cualquier intento antes de tiempo.",
      "r4.h": "El creador empieza de cero",
      "r4.p": "Ninguna moneda reservada. Quien lanzó Nova tiene que minar como todos los demás.",

      "how.title": "Tres pasos, cero hardware",
      "s1.h": "Conecta tu wallet",
      "s1.p": "Pulsa «Conectar wallet» y aprueba en MetaMask. La web te cambia a la red Base automáticamente.",
      "s2.h": "Pulsa Minar",
      "s2.p": "Confirma la transacción. Pagas unos céntimos de gas y recibes {reward} NOVA al instante.",
      "s3.h": "Vuelve mañana",
      "s3.p": "Una cuenta atrás te dice cuándo puedes volver a minar.",

      "mine.title": "Mina tus primeros NOVA",
      "mine.sub": "Leído en directo de la blockchain. Se actualiza solo cada pocos segundos.",
      "mine.full": "Abre el minero completo, con actividad en directo",
      "supply.title": "Suministro minado",
      "supply.of": "{supply} de {max} {symbol}",
      "stat.mines": "Minados",
      "stat.miners": "Mineros",
      "stat.left": "Por minar",
      "stat.leftShort": "Quedan",
      "balance": "Tu saldo",
      "addToken": "Añadir {symbol} a MetaMask",
      "viewContract": "Ver contrato",

      "faq.q1": "¿Minar cuesta dinero?",
      "faq.a1": "La moneda es gratis, pero cada transacción en Base paga una pequeña comisión de red (gas) en ETH. Suele ser de unos céntimos.",
      "faq.q2": "¿Es como minar Bitcoin?",
      "faq.a2": "No exactamente. En Bitcoin, los ordenadores compiten resolviendo cálculos. Aquí, minar es una regla del contrato que crea monedas nuevas para quien las pide, con un límite por wallet y por día. Lo que comparten es un suministro limitado que se reparte poco a poco.",
      "faq.q3": "¿Por qué Base?",
      "faq.a3": "Base es una red de capa 2 construida sobre Ethereum. Hereda la seguridad de Ethereum, pero las comisiones son mucho más bajas, así que una transacción al día tiene sentido.",
      "faq.q4": "¿Vale algo? ¿Se puede comprar?",
      "faq.a4": "No. Es un proyecto educativo: no se vende ni cotiza en ningún exchange. Existe para aprender cómo funcionan los tokens y los contratos inteligentes.",
      "faq.q5": "No veo mis monedas en MetaMask",
      "faq.a5": "Pulsa «Añadir NOVA a MetaMask» en el panel de minado. La moneda aparecerá en tu wallet con su logo.",

      "outro.text": "Un clic al día. Hasta el millón.",
      "outro.cta": "Ir a minar",
      "footer.note": "Proyecto educativo en la red {network}. Sin valor monetario.",
      "footer.contract": "Contrato en el explorador",
      "footer.back": "← Volver al inicio",

      "miner.tag": "Minero",
      "miner.stage": "Minar",
      "wallet.title": "Tu wallet",
      "wallet.next": "Próximo minado",
      "wallet.last": "Último minado",
      "wallet.reward": "Recompensa por minado",
      "feed.title": "Minados recientes",
      "feed.loading": "Cargando…",
      "feed.notLive": "Los minados recientes aparecerán aquí cuando el contrato esté activo.",
      "feed.none": "No hay minados en las últimas horas. ¡Sé el primero!",
      "feed.error": "No se pudieron cargar los minados recientes.",
      "feed.you": "Tú",

      "ago.now": "ahora mismo",
      "ago.min": "hace {n} min",
      "ago.h": "hace {n} h",
      "ago.d": "hace {n} d",
      "never": "Nunca",

      "btn.connect": "Conecta tu wallet",
      "btn.exhausted": "Suministro agotado",
      "btn.next": "Próximo minado en {time}",
      "btn.mine": "Minar",
      "btn.confirm": "Confirma en MetaMask…",
      "btn.mining": "Minando…",
      "next.never": "Nunca: todo minado",
      "next.ready": "Ya disponible",

      "st.need": "Necesitas MetaMask y unos céntimos de ETH en {network} para el gas.",
      "st.ethers": "No se pudo cargar la librería ethers.js. Revisa tu conexión a internet.",
      "st.notConfigured": "El contrato aún no está configurado.",
      "st.noMetamask": "No se detecta MetaMask. Instálalo desde metamask.io y recarga la página.",
      "st.ready": "Listo. Cada wallet puede minar una vez cada 24 horas.",
      "st.confirm": "Revisa la ventana de MetaMask y confirma la transacción.",
      "st.sent": "Transacción enviada. Esperando confirmación…{view}",
      "st.view": "ver",
      "st.mined": "¡Has minado {amount} {symbol}! Vuelve en 24 h.",

      "toast.setAddress": "Primero configura la dirección del contrato en app.js",
      "toast.mined": "⛏️ ¡Minado con éxito!",
      "toast.needMM": "Necesitas MetaMask",
      "toast.notConfigured": "Contrato no configurado",
      "toast.added": "🦊 {symbol} añadido a tu wallet",

      "err.cancel": "Has cancelado la transacción.",
      "err.funds": "No tienes suficiente ETH en {network} para pagar el gas. Con unos céntimos basta.",
      "err.wait": "Aún no han pasado 24 h desde tu último minado.",
      "err.max": "Ya se ha minado todo el suministro.",
      "err.generic": "Algo salió mal: {msg}",
      "err.unknown": "error desconocido",
    },

    fr: {
      "meta.title": "Nova · La pièce qu’on mine en un clic",
      "meta.titleMiner": "Nova · Mineur",
      "meta.desc": "Nova est une pièce sur le réseau Base que tout le monde peut miner gratuitement depuis le web, une fois toutes les 24 heures.",
      "meta.descMiner": "Minez 100 NOVA toutes les 24 heures sur le réseau Base.",
      "lang.label": "Langue",

      "nav.how": "Comment ça marche",
      "nav.rules": "Règles",
      "nav.mine": "Miner",
      "nav.faq": "FAQ",
      "nav.openMiner": "Aller miner",
      "nav.sections": "Sections",
      "connect.long": "Connecter le wallet",
      "connect.short": "Connecter",
      "connect.aria": `Wallet connecté${NB}: {account}`,
      "banner": `Adresse du contrat manquante${NB}: collez-la dans <code>CONTRACT_ADDRESS</code> dans <code>app.js</code>.`,

      "hero.live": "En ligne sur {network}",
      "hero.l1": "La pièce",
      "hero.l2": "qu’on mine",
      "hero.l3": "en un clic.",
      "hero.lead": "Connectez votre wallet, appuyez sur Miner et recevez {reward} {symbol}. Chaque wallet peut miner à nouveau toutes les 24 heures, jusqu’à épuisement du million de pièces.",
      "hero.start": "Commencer à miner",
      "hero.see": "Voir comment ça marche",
      "hero.liveData": "Données en direct",
      "hero.mined": "<strong>{supply}</strong> {symbol} minés",
      "hero.miners": "<strong>{miners}</strong> mineurs",
      "hero.left": "<strong>{remaining}</strong> restants à miner",
      "hint.drag": "Faites glisser la pièce pour la faire tourner",
      "hint.tap": "Touchez la pièce pour la retourner",

      "manifesto": "Pas de fermes de serveurs. Pas de cartes graphiques. Pas de prévente ni de pièces réservées au créateur. Juste un contrat public qui donne 100 NOVA à qui le demande, une fois par jour, jusqu’au million.",

      "rules.title": "Des règles que personne ne peut changer",
      "rules.sub": "Elles sont inscrites dans le contrat. Même son créateur ne peut pas y toucher, et tout le monde peut lire le code sur l’explorateur de blocs.",
      "r1.h": "Un million. Pas une de plus.",
      "r1.p": `Le contrat ne pourra jamais créer plus de 1${NB}000${NB}000 NOVA. Une fois toutes minées, le minage ferme pour toujours.`,
      "r2.h": "{reward} NOVA par minage",
      "r2.p": "À chaque minage, les pièces arrivent directement dans votre wallet. Sans intermédiaire.",
      "r3.h": "Une fois toutes les 24 heures",
      "r3.p": "Le contrat se souvient de votre dernier minage et refuse toute tentative avant l’heure.",
      "r4.h": "Le créateur part de zéro",
      "r4.p": "Aucune pièce réservée. Celui qui a lancé Nova doit miner comme tout le monde.",

      "how.title": "Trois étapes, zéro matériel",
      "s1.h": "Connectez votre wallet",
      "s1.p": `Cliquez sur «${NB}Connecter le wallet${NB}» et validez dans MetaMask. Le site vous fait passer automatiquement sur le réseau Base.`,
      "s2.h": "Appuyez sur Miner",
      "s2.p": "Confirmez la transaction. Vous payez quelques centimes de gas et recevez {reward} NOVA tout de suite.",
      "s3.h": "Revenez demain",
      "s3.p": "Un compte à rebours vous indique quand miner à nouveau.",

      "mine.title": "Minez vos premiers NOVA",
      "mine.sub": "Lu en direct sur la blockchain. Mis à jour automatiquement toutes les quelques secondes.",
      "mine.full": "Ouvrir le mineur complet, avec l’activité en direct",
      "supply.title": "Offre minée",
      "supply.of": "{supply} sur {max} {symbol}",
      "stat.mines": "Minages",
      "stat.miners": "Mineurs",
      "stat.left": "Restant",
      "stat.leftShort": "Restant",
      "balance": "Votre solde",
      "addToken": "Ajouter {symbol} à MetaMask",
      "viewContract": "Voir le contrat",

      "faq.q1": `Miner coûte-t-il de l’argent${NB}?`,
      "faq.a1": "La pièce est gratuite, mais chaque transaction sur Base paie de petits frais de réseau (gas) en ETH. En général, quelques centimes.",
      "faq.q2": `Est-ce comme miner du Bitcoin${NB}?`,
      "faq.a2": `Pas vraiment. Avec Bitcoin, des ordinateurs rivalisent pour résoudre des calculs. Ici, miner est une règle du contrat qui crée de nouvelles pièces pour qui les demande, avec une limite par wallet et par jour. Leur point commun${NB}: une offre limitée distribuée petit à petit.`,
      "faq.q3": `Pourquoi Base${NB}?`,
      "faq.a3": `Base est un réseau de couche 2 construit sur Ethereum. Il hérite de la sécurité d’Ethereum, mais les frais sont bien plus bas${NB}: une transaction par jour a donc du sens.`,
      "faq.q4": `Ça vaut quelque chose${NB}? Puis-je en acheter${NB}?`,
      "faq.a4": `Non. C’est un projet éducatif${NB}: il n’est pas vendu et n’est coté sur aucune plateforme d’échange. Il sert à apprendre comment fonctionnent les tokens et les smart contracts.`,
      "faq.q5": "Je ne vois pas mes pièces dans MetaMask",
      "faq.a5": `Cliquez sur «${NB}Ajouter NOVA à MetaMask${NB}» dans le panneau de minage. La pièce apparaîtra dans votre wallet avec son logo.`,

      "outro.text": "Un clic par jour. Jusqu’au million.",
      "outro.cta": "Aller miner",
      "footer.note": "Projet éducatif sur le réseau {network}. Sans valeur monétaire.",
      "footer.contract": "Contrat sur l’explorateur",
      "footer.back": "← Retour à l’accueil",

      "miner.tag": "Mineur",
      "miner.stage": "Miner",
      "wallet.title": "Votre wallet",
      "wallet.next": "Prochain minage",
      "wallet.last": "Dernier minage",
      "wallet.reward": "Récompense par minage",
      "feed.title": "Minages récents",
      "feed.loading": "Chargement…",
      "feed.notLive": "Les minages récents apparaîtront ici dès que le contrat sera en ligne.",
      "feed.none": `Aucun minage ces dernières heures. Soyez le premier${NB}!`,
      "feed.error": "Impossible de charger les minages récents pour l’instant.",
      "feed.you": "Vous",

      "ago.now": "à l’instant",
      "ago.min": "il y a {n} min",
      "ago.h": "il y a {n} h",
      "ago.d": "il y a {n} j",
      "never": "Jamais",

      "btn.connect": "Connectez votre wallet",
      "btn.exhausted": "Offre épuisée",
      "btn.next": "Prochain minage dans {time}",
      "btn.mine": "Miner",
      "btn.confirm": "Confirmez dans MetaMask…",
      "btn.mining": "Minage…",
      "next.never": `Jamais${NB}: tout est miné`,
      "next.ready": "Disponible",

      "st.need": "Il vous faut MetaMask et quelques centimes d’ETH sur {network} pour le gas.",
      "st.ethers": "Impossible de charger la bibliothèque ethers.js. Vérifiez votre connexion internet.",
      "st.notConfigured": "Le contrat n’est pas encore configuré.",
      "st.noMetamask": "MetaMask introuvable. Installez-le depuis metamask.io et rechargez la page.",
      "st.ready": "Prêt. Chaque wallet peut miner une fois toutes les 24 heures.",
      "st.confirm": "Vérifiez la fenêtre MetaMask et confirmez la transaction.",
      "st.sent": "Transaction envoyée. En attente de confirmation…{view}",
      "st.view": "voir",
      "st.mined": `Vous avez miné {amount} {symbol}${NB}! Revenez dans 24 h.`,

      "toast.setAddress": "Configurez d’abord l’adresse du contrat dans app.js",
      "toast.mined": `⛏️ Minage réussi${NB}!`,
      "toast.needMM": "Il vous faut MetaMask",
      "toast.notConfigured": "Contrat non configuré",
      "toast.added": "🦊 {symbol} ajouté à votre wallet",

      "err.cancel": "Vous avez annulé la transaction.",
      "err.funds": "Vous n’avez pas assez d’ETH sur {network} pour payer le gas. Quelques centimes suffisent.",
      "err.wait": "24 h ne se sont pas encore écoulées depuis votre dernier minage.",
      "err.max": "Toute l’offre a déjà été minée.",
      "err.generic": `Une erreur s’est produite${NB}: {msg}`,
      "err.unknown": "erreur inconnue",
    },
  };

  const LOCALES = { en: "en-US", es: "es-ES", fr: "fr-FR" };
  const NAMES = { en: "English", es: "Español", fr: "Français" };
  const STATS = ["supply", "max", "miners", "mines", "remaining", "pct"];
  const STORE_KEY = "nova-lang";

  function detect() {
    const ok = (l) => (l && DICT[l] ? l : null);
    let fromUrl = null, saved = null;
    try { fromUrl = new URLSearchParams(location.search).get("lang"); } catch (_) {}
    try { saved = localStorage.getItem(STORE_KEY); } catch (_) {}
    const fromBrowser = (navigator.languages || [navigator.language || ""])
      .map((l) => String(l).slice(0, 2).toLowerCase())
      .find((l) => DICT[l]);
    return ok(fromUrl) || ok(saved) || fromBrowser || "en";
  }

  const I18N = {
    lang: "en",
    locale: "en-US",
    languages: Object.keys(DICT),
    // Values used for {reward} {symbol} {network} {name}; app.js keeps them up to date
    vars: { name: "Nova", symbol: "NOVA", network: "Base", reward: "100" },

    // Translate a key. Explicit vars win; the shared placeholders become
    // <span data-…> elements that app.js keeps updated.
    t(key, vars) {
      const s = DICT[this.lang][key] ?? DICT.en[key] ?? key;
      return s.replace(/\{(\w+)\}/g, (m, k) => {
        if (vars && k in vars) return typeof vars[k] === "function" ? vars[k]() : vars[k];
        if (k === "reward") return `<span data-reward>${this.vars.reward}</span>`;
        if (k === "symbol") return `<span data-symbol>${this.vars.symbol}</span>`;
        if (k === "network") return `<span data-network>${this.vars.network}</span>`;
        if (k === "name") return `<span data-name>${this.vars.name}</span>`;
        if (STATS.includes(k)) return `<span data-stat="${k}">—</span>`;
        return m;
      });
    },

    apply() {
      const doc = document.documentElement;
      doc.lang = this.lang;
      const each = (sel, fn) => document.querySelectorAll(sel).forEach(fn);
      each("[data-i18n]", (el) => (el.textContent = this.t(el.dataset.i18n, {})));
      each("[data-i18n-html]", (el) => (el.innerHTML = this.t(el.dataset.i18nHtml)));
      each("[data-i18n-aria]", (el) => el.setAttribute("aria-label", this.t(el.dataset.i18nAria, {})));
      each("[data-i18n-content]", (el) => el.setAttribute("content", this.t(el.dataset.i18nContent, {})));
      if (doc.dataset.i18nTitle) document.title = this.t(doc.dataset.i18nTitle, {});

      each("[data-lang-current]", (el) => (el.textContent = this.lang.toUpperCase()));
      each("[data-lang]", (b) => b.setAttribute("aria-checked", String(b.dataset.lang === this.lang)));
    },

    set(lang) {
      if (!DICT[lang] || lang === this.lang) return;
      this.lang = lang;
      this.locale = LOCALES[lang];
      try { localStorage.setItem(STORE_KEY, lang); } catch (_) {}
      this.apply();
      document.dispatchEvent(new CustomEvent("nova:lang", { detail: { lang } }));
      // A quick, soft fade so the switch doesn't feel like a jump
      const main = document.querySelector("main");
      if (main?.animate && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
        main.animate([{ opacity: 0.35 }, { opacity: 1 }], { duration: 380, easing: "ease-out" });
      }
    },
  };

  I18N.lang = detect();
  I18N.locale = LOCALES[I18N.lang];
  window.I18N = I18N;
  if (I18N.lang !== "en") I18N.apply();
  else document.documentElement.lang = "en";

  /* ---------- Language menu ---------- */
  document.querySelectorAll("[data-lang-switch]").forEach((box) => {
    const btn = box.querySelector(".lang-btn");
    const menu = box.querySelector(".lang-menu");
    menu.innerHTML = I18N.languages
      .map((l) => `<li role="none"><button type="button" role="menuitemradio" lang="${l}" data-lang="${l}" aria-checked="${l === I18N.lang}">${NAMES[l]}<span class="lang-code">${l.toUpperCase()}</span></button></li>`)
      .join("");
    box.querySelector("[data-lang-current]").textContent = I18N.lang.toUpperCase();

    const open = (v) => {
      box.classList.toggle("open", v);
      btn.setAttribute("aria-expanded", String(v));
    };
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const willOpen = !box.classList.contains("open");
      open(willOpen);
      if (willOpen) menu.querySelector('[aria-checked="true"]')?.focus();
    });
    menu.addEventListener("click", (e) => {
      const b = e.target.closest("[data-lang]");
      if (!b) return;
      I18N.set(b.dataset.lang);
      open(false);
      btn.focus();
    });
    menu.addEventListener("keydown", (e) => {
      const items = [...menu.querySelectorAll("[data-lang]")];
      const i = items.indexOf(document.activeElement);
      if (e.key === "ArrowDown") { e.preventDefault(); items[(i + 1) % items.length].focus(); }
      if (e.key === "ArrowUp") { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
    });
    document.addEventListener("click", (e) => { if (!box.contains(e.target)) open(false); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && box.classList.contains("open")) { open(false); btn.focus(); }
    });
  });
})();
