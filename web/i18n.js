/* =========================================================
   Nova · Languages (English, Spanish, French)
   - Static text:   data-i18n="key"        (plain text)
                    data-i18n-html="key"   (text with tags/placeholders)
                    data-i18n-aria="key"   (aria-label)
                    data-i18n-content="key" (meta content)
   - Placeholders:  {symbol} {network} {name}, the live numbers
                    {daily} {supply} {max} {miners} {mines} {pct} {today}
                    {share} {day} {halving} {nextdaily}, and {resettime}
   - The choice is remembered, and ?lang=es / ?lang=fr in the URL works too.
   To add a language, copy the "en" block and translate it.
   ========================================================= */
(() => {
  const NB = " "; // non-breaking space (French punctuation and numbers)

  const DICT = {
    en: {
      "meta.title": "Nova · The coin you mine in one click",
      "meta.titleMiner": "Nova Miner",
      "meta.desc": "Nova is a coin on the Base network you mine for free from the web, once a day. 50,000 NOVA are shared among each day’s miners, halving every 210 days.",
      "meta.descMiner": "Mine once a day and share today’s NOVA on the Base network.",
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
      "hero.lead": "Hit Mine once a day and share the {daily} {symbol} released that day with everyone who mined. No race and no presale, and the more NOVA you’ve mined and kept, the bigger your slice.",
      "hero.start": "Start mining",
      "hero.see": "See how it works",
      "hero.liveData": "Live data",
      "hero.mined": "<strong>{supply}</strong> {symbol} mined",
      "hero.today": "<strong>{today}</strong> mining today",
      "hero.daily": "<strong>{daily}</strong> {symbol} to share today",
      "hint.drag": "Drag the coin to spin it",
      "hint.tap": "Tap the coin to flip it",

      "manifesto": "No server farms. No graphics cards. No presale and no coins set aside for the creator. Just a public contract that releases 50,000 NOVA every day and shares them among everyone who shows up, halving every 210 days, until 21 million.",

      "rules.title": "Rules nobody can change",
      "rules.sub": "They are written into the contract. Not even its creator can touch them, and anyone can read the code on the block explorer.",
      "r1.h": "21 million. Not one more.",
      "r1.p": "The contract can never create more than 21,000,000 NOVA. The daily reward keeps halving, so the total gets closer and closer to that limit without ever passing it.",
      "r2.h": "{daily} NOVA a day, shared",
      "r2.p": "Every day the contract releases a fixed amount, split among every wallet that mined that day according to its mining power. No race: mining at 9:00 or at 23:00 gives the same share.",
      "rp.h": "Holders mine more",
      "rp.p": "Your mining power goes from 1x with no NOVA up to 5x, growing with the NOVA you mined and still hold. Newcomers start small; coins sent to you by others don’t count.",
      "r3.h": "Halving every 210 days",
      "r3.p": "The daily reward halves every 210 days, just like Bitcoin’s reward halves every 210,000 blocks. Early miners get more, and NOVA gets scarcer over time.",
      "r4.h": "Nobody can take it all",
      "r4.p": "At most one daily reward can be created per day, whatever happens. Not even someone with a thousand wallets can empty the supply.",
      "r5.h": "The creator starts at zero",
      "r5.p": "No reserved coins. Whoever launched Nova has to mine just like everyone else.",

      "how.title": "Three steps, zero hardware",
      "s1.h": "Connect your wallet",
      "s1.p": "Click “Connect wallet” and approve in MetaMask. The site switches you to the Base network automatically.",
      "s2.h": "Mine once a day",
      "s2.p": "Confirm the transaction. You pay a few cents in gas and join today’s miners.",
      "s3.h": "Collect your share",
      "s3.p": "When the day closes (00:00 UTC), the day’s NOVA are split among everyone who mined. Your share is paid the next time you mine, or claim it whenever you want.",

      "mine.title": "Mine today’s NOVA",
      "mine.sub": "Read live from the blockchain. Refreshes on its own every few seconds.",
      "mine.full": "Open the full miner, with live activity",
      "supply.title": "Supply mined",
      "supply.of": "{supply} of {max} {symbol}",
      "stat.daily": "Today’s reward",
      "stat.today": "Miners today",
      "stat.closes": "Day closes in",
      "stat.mines": "Mines",
      "stat.miners": "Miners",
      "stat.day": "Day",
      "balance": "Your balance",
      "addToken": "Add {symbol} to MetaMask",
      "viewContract": "View contract",

      "faq.q1": "Does mining cost money?",
      "faq.a1": "The coin is free, but every transaction on Base pays a small network fee (gas) in ETH. It is usually a few cents.",
      "faq.q2": "Is this mining like Bitcoin?",
      "faq.a2": "Closer than you’d think. Like Bitcoin, a fixed reward is released on a schedule, it halves over time (every 210 days here, every 210,000 blocks there) and the total stops at 21 million. The difference: in Bitcoin, computers compete to solve calculations; here, the day’s reward is split among everyone who pressed Mine, weighted by how much NOVA they hold.",
      "faq.q3": "Why do I get my coins the next day?",
      "faq.a3": "Your share depends on how many people mine that day, and that is only known when the day closes at 00:00 UTC. It is paid automatically the next time you mine, or you can claim it any time with the “Claim” button.",
      "faq.q4": "Can someone take all the coins?",
      "faq.a4": "No. At most {daily} NOVA can be created per day, whatever happens. New wallets start at 1x mining power, so creating many empty wallets gets little, and each one pays gas every day. Nobody can empty the supply or stop others from getting their share.",
      "faq.q8": "What is mining power?",
      "faq.a8": "It decides how big your slice of the day is. A wallet with no NOVA mines at 1x. Power grows with the NOVA you mined yourself and still hold, up to 5x when you hold two days’ worth of the daily reward (100,000 NOVA in the first 210 days). It grows fastest at the start: 1,000 NOVA gives 1.4x, 10,000 gives 2.3x and 25,000 gives 3.0x. NOVA sent to you by someone else doesn’t count, and if you send yours away, your power goes down.",
      "faq.q5": "Why Base?",
      "faq.a5": "Base is a layer-2 network built on Ethereum. It inherits Ethereum’s security, but fees are much lower, so one transaction a day makes sense.",
      "faq.q6": "Is it worth anything? Can I buy it?",
      "faq.a6": "No. It is an educational project: it is not sold and is not listed on any exchange. It exists to learn how tokens and smart contracts work.",
      "faq.q7": "I can’t see my coins in MetaMask",
      "faq.a7": "Click “Add NOVA to MetaMask” in the mining panel. The coin will show up in your wallet with its logo.",

      "outro.text": "One click a day. Shared by everyone.",
      "outro.cta": "Open the miner",
      "footer.note": "Educational project on the {network} network. No monetary value.",
      "footer.contract": "Contract on the explorer",
      "footer.back": "← Back to home",
      "footer.testnet": "Test version (Base Sepolia)",
      "footer.mainnet": "Leave the test version",

      "miner.tag": "Miner",
      "miner.stage": "Mine",
      "today.title": "Today · day {day}",
      "today.resets": "New day at 00:00 UTC ({resettime} your time)",
      "today.toShare": "To share",
      "today.miners": "Miners",
      "today.each": "Average share",
      "today.halving": "Halves to {nextdaily} NOVA in {halving} days",
      "wallet.title": "Your wallet",
      "wallet.power": "Mining power",
      "wallet.next": "Next mine",
      "wallet.last": "Last mined",
      "wallet.ready": "Ready to collect",
      "wallet.share": "Your share today",
      "feed.title": "Recent activity",
      "feed.loading": "Loading…",
      "feed.notLive": "Recent activity will appear here once the contract is live.",
      "feed.none": "No activity in the last few hours. Be the first!",
      "feed.error": "Couldn’t load recent activity right now.",
      "feed.you": "You",
      "feed.mined": "mined at {power}",

      "ago.now": "just now",
      "ago.min": "{n} min ago",
      "ago.h": "{n} h ago",
      "ago.d": "{n} d ago",
      "never": "Never",
      "day.today": "Today",
      "day.yesterday": "Yesterday",
      "day.n": "Day {n}",

      "btn.connect": "Connect your wallet",
      "btn.ended": "Mining has ended",
      "btn.next": "Next mine in {time}",
      "btn.mine": "Mine",
      "btn.confirm": "Confirm in MetaMask…",
      "btn.mining": "Mining…",
      "btn.claiming": "Claiming…",
      "btn.claim": "Claim {amount} NOVA",
      "next.ready": "Ready now",

      "st.need": "You need MetaMask and a few cents of ETH on {network} for gas.",
      "st.needTest": "Test version: you need MetaMask and free test ETH on Base Sepolia (search “Base Sepolia faucet”).",
      "st.ethers": "Couldn’t load the ethers.js library. Check your internet connection.",
      "st.notConfigured": "The contract isn’t configured yet.",
      "st.soon": "Mining hasn’t opened yet. Come back soon!",
      "st.noMetamask": "MetaMask not detected. Install it from metamask.io and reload the page.",
      "st.ready": "Ready. Your mining power is {power}. Mine once a day to get a share of today’s {daily} NOVA.",
      "st.joined": "You’re in today’s mining at {power}! Your share (about {share} NOVA so far) arrives after 00:00 UTC, {time} your time.",
      "st.claimHint": "Your {amount} NOVA from day {day} will be paid when you mine today, or claim them now.",
      "st.ended": "Mining has ended: all the halvings are done.",
      "st.confirm": "Check the MetaMask window and confirm the transaction.",
      "st.sent": "Transaction sent. Waiting for confirmation…{view}",
      "st.view": "view",

      "toast.setAddress": "Set the contract address in app.js first",
      "toast.mined": "⛏️ You’re in today’s mining!",
      "toast.minedPaid": "⛏️ Mined! +{amount} NOVA from day {day}",
      "toast.claimed": "+{amount} NOVA collected",
      "toast.needMM": "You need MetaMask",
      "toast.notConfigured": "Contract not configured",
      "toast.added": "🦊 {symbol} added to your wallet",

      "err.cancel": "You cancelled the transaction.",
      "err.funds": "You don’t have enough ETH on {network} to pay for gas. A few cents is enough.",
      "err.wait": "You’ve already mined today. Come back after 00:00 UTC.",
      "err.ended": "Mining has ended.",
      "err.nothing": "There’s nothing to claim yet.",
      "err.generic": "Something went wrong: {msg}",
      "err.unknown": "unknown error",
    },

    es: {
      "meta.title": "Nova · La moneda que minas con un clic",
      "meta.titleMiner": "Nova · Minero",
      "meta.desc": "Nova es una moneda en la red Base que minas gratis desde la web, una vez al día. Cada día se reparten 50.000 NOVA entre quienes minan, y la cantidad se reduce a la mitad cada 210 días.",
      "meta.descMiner": "Mina una vez al día y repártete los NOVA de hoy en la red Base.",
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
      "hero.lead": "Pulsa Minar una vez al día y repártete los {daily} {symbol} que se liberan ese día con todos los que minaron. Sin carreras ni preventa, y cuantos más NOVA hayas minado y guardado, mayor es tu parte.",
      "hero.start": "Empezar a minar",
      "hero.see": "Ver cómo funciona",
      "hero.liveData": "Datos en directo",
      "hero.mined": "<strong>{supply}</strong> {symbol} minados",
      "hero.today": "<strong>{today}</strong> minando hoy",
      "hero.daily": "<strong>{daily}</strong> {symbol} para repartir hoy",
      "hint.drag": "Arrastra la moneda para girarla",
      "hint.tap": "Toca la moneda para girarla",

      "manifesto": "Sin granjas de servidores. Sin tarjetas gráficas. Sin preventa y sin monedas reservadas para el creador. Solo un contrato público que libera 50.000 NOVA cada día y los reparte entre quienes se presentan, reduciéndose a la mitad cada 210 días, hasta 21 millones.",

      "rules.title": "Reglas que nadie puede cambiar",
      "rules.sub": "Están escritas en el contrato. Ni siquiera su creador puede tocarlas, y cualquiera puede leer el código en el explorador de bloques.",
      "r1.h": "21 millones. Ni una más.",
      "r1.p": "El contrato nunca podrá crear más de 21.000.000 NOVA. La recompensa diaria se sigue reduciendo a la mitad, así que el total se acerca cada vez más a ese límite sin superarlo nunca.",
      "r2.h": "{daily} NOVA al día, repartidos",
      "r2.p": "Cada día el contrato libera una cantidad fija que se reparte entre todas las wallets que minaron ese día según su potencia de minado. Sin carreras: minar a las 9:00 o a las 23:00 da la misma parte.",
      "rp.h": "Quien guarda, mina más",
      "rp.p": "Tu potencia de minado va de 1x sin NOVA hasta 5x, y crece con los NOVA que minaste y aún conservas. Los nuevos empiezan con poco; las monedas que te envían otros no cuentan.",
      "r3.h": "Halving cada 210 días",
      "r3.p": "La recompensa diaria se reduce a la mitad cada 210 días, igual que la de Bitcoin cada 210.000 bloques. Los primeros mineros reciben más, y NOVA se vuelve más escaso con el tiempo.",
      "r4.h": "Nadie puede quedárselo todo",
      "r4.p": "Como mucho se puede crear una recompensa diaria por día, pase lo que pase. Ni siquiera alguien con mil wallets puede vaciar el suministro.",
      "r5.h": "El creador empieza de cero",
      "r5.p": "Ninguna moneda reservada. Quien lanzó Nova tiene que minar como todos los demás.",

      "how.title": "Tres pasos, cero hardware",
      "s1.h": "Conecta tu wallet",
      "s1.p": "Pulsa «Conectar wallet» y aprueba en MetaMask. La web te cambia a la red Base automáticamente.",
      "s2.h": "Mina una vez al día",
      "s2.p": "Confirma la transacción. Pagas unos céntimos de gas y entras en el minado de hoy.",
      "s3.h": "Recibe tu parte",
      "s3.p": "Cuando el día cierra (00:00 UTC), los NOVA del día se reparten entre todos los que minaron. Tu parte se paga la próxima vez que mines, o reclámala cuando quieras.",

      "mine.title": "Mina los NOVA de hoy",
      "mine.sub": "Leído en directo de la blockchain. Se actualiza solo cada pocos segundos.",
      "mine.full": "Abre el minero completo, con actividad en directo",
      "supply.title": "Suministro minado",
      "supply.of": "{supply} de {max} {symbol}",
      "stat.daily": "Recompensa de hoy",
      "stat.today": "Mineros hoy",
      "stat.closes": "El día cierra en",
      "stat.mines": "Minados",
      "stat.miners": "Mineros",
      "stat.day": "Día",
      "balance": "Tu saldo",
      "addToken": "Añadir {symbol} a MetaMask",
      "viewContract": "Ver contrato",

      "faq.q1": "¿Minar cuesta dinero?",
      "faq.a1": "La moneda es gratis, pero cada transacción en Base paga una pequeña comisión de red (gas) en ETH. Suele ser de unos céntimos.",
      "faq.q2": "¿Es como minar Bitcoin?",
      "faq.a2": "Más de lo que parece. Como en Bitcoin, se libera una recompensa fija según un calendario, se reduce a la mitad con el tiempo (cada 210 días aquí, cada 210.000 bloques allí) y el total se detiene en 21 millones. La diferencia: en Bitcoin los ordenadores compiten resolviendo cálculos; aquí, la recompensa del día se reparte entre todos los que pulsaron Minar, según cuántos NOVA tienen.",
      "faq.q3": "¿Por qué recibo mis monedas al día siguiente?",
      "faq.a3": "Tu parte depende de cuántas personas minen ese día, y eso solo se sabe cuando el día cierra a las 00:00 UTC. Se paga automáticamente la próxima vez que mines, o puedes reclamarla cuando quieras con el botón «Reclamar».",
      "faq.q4": "¿Alguien puede quedarse todas las monedas?",
      "faq.a4": "No. Como mucho se pueden crear {daily} NOVA al día, pase lo que pase. Las wallets nuevas empiezan con potencia 1x, así que crear muchas wallets vacías da poco, y cada una paga gas todos los días. Nadie puede vaciar el suministro ni impedir que los demás reciban su parte.",
      "faq.q8": "¿Qué es la potencia de minado?",
      "faq.a8": "Decide el tamaño de tu parte del día. Una wallet sin NOVA mina a 1x. La potencia crece con los NOVA que minaste tú y aún conservas, hasta 5x cuando tienes dos días de recompensa (100.000 NOVA durante los primeros 210 días). Crece más rápido al principio: con 1.000 NOVA tienes 1,4x, con 10.000, 2,3x y con 25.000, 3,0x. Los NOVA que te envía otra persona no cuentan, y si envías los tuyos, tu potencia baja.",
      "faq.q5": "¿Por qué Base?",
      "faq.a5": "Base es una red de capa 2 construida sobre Ethereum. Hereda la seguridad de Ethereum, pero las comisiones son mucho más bajas, así que una transacción al día tiene sentido.",
      "faq.q6": "¿Vale algo? ¿Se puede comprar?",
      "faq.a6": "No. Es un proyecto educativo: no se vende ni cotiza en ningún exchange. Existe para aprender cómo funcionan los tokens y los contratos inteligentes.",
      "faq.q7": "No veo mis monedas en MetaMask",
      "faq.a7": "Pulsa «Añadir NOVA a MetaMask» en el panel de minado. La moneda aparecerá en tu wallet con su logo.",

      "outro.text": "Un clic al día. Repartido entre todos.",
      "outro.cta": "Ir a minar",
      "footer.note": "Proyecto educativo en la red {network}. Sin valor monetario.",
      "footer.contract": "Contrato en el explorador",
      "footer.back": "← Volver al inicio",
      "footer.testnet": "Versión de prueba (Base Sepolia)",
      "footer.mainnet": "Salir de la versión de prueba",

      "miner.tag": "Minero",
      "miner.stage": "Minar",
      "today.title": "Hoy · día {day}",
      "today.resets": "Nuevo día a las 00:00 UTC ({resettime} en tu hora)",
      "today.toShare": "Para repartir",
      "today.miners": "Mineros",
      "today.each": "Parte media",
      "today.halving": "Baja a {nextdaily} NOVA en {halving} días",
      "wallet.title": "Tu wallet",
      "wallet.power": "Potencia de minado",
      "wallet.next": "Próximo minado",
      "wallet.last": "Último minado",
      "wallet.ready": "Listo para cobrar",
      "wallet.share": "Tu parte de hoy",
      "feed.title": "Actividad reciente",
      "feed.loading": "Cargando…",
      "feed.notLive": "La actividad reciente aparecerá aquí cuando el contrato esté activo.",
      "feed.none": "Sin actividad en las últimas horas. ¡Sé el primero!",
      "feed.error": "No se pudo cargar la actividad reciente.",
      "feed.you": "Tú",
      "feed.mined": "minó con {power}",

      "ago.now": "ahora mismo",
      "ago.min": "hace {n} min",
      "ago.h": "hace {n} h",
      "ago.d": "hace {n} d",
      "never": "Nunca",
      "day.today": "Hoy",
      "day.yesterday": "Ayer",
      "day.n": "Día {n}",

      "btn.connect": "Conecta tu wallet",
      "btn.ended": "Minado terminado",
      "btn.next": "Próximo minado en {time}",
      "btn.mine": "Minar",
      "btn.confirm": "Confirma en MetaMask…",
      "btn.mining": "Minando…",
      "btn.claiming": "Reclamando…",
      "btn.claim": "Reclamar {amount} NOVA",
      "next.ready": "Ya disponible",

      "st.need": "Necesitas MetaMask y unos céntimos de ETH en {network} para el gas.",
      "st.needTest": "Versión de prueba: necesitas MetaMask y ETH de prueba gratis en Base Sepolia (busca «Base Sepolia faucet»).",
      "st.ethers": "No se pudo cargar la librería ethers.js. Revisa tu conexión a internet.",
      "st.notConfigured": "El contrato aún no está configurado.",
      "st.soon": "El minado aún no ha abierto. ¡Vuelve pronto!",
      "st.noMetamask": "No se detecta MetaMask. Instálalo desde metamask.io y recarga la página.",
      "st.ready": "Listo. Tu potencia de minado es {power}. Mina una vez al día para llevarte parte de los {daily} NOVA de hoy.",
      "st.joined": "¡Ya estás en el minado de hoy con {power}! Tu parte (unos {share} NOVA por ahora) llega después de las 00:00 UTC, las {time} en tu hora.",
      "st.claimHint": "Tus {amount} NOVA del día {day} se pagarán cuando mines hoy, o reclámalos ahora.",
      "st.ended": "El minado ha terminado: ya se hicieron todos los halvings.",
      "st.confirm": "Revisa la ventana de MetaMask y confirma la transacción.",
      "st.sent": "Transacción enviada. Esperando confirmación…{view}",
      "st.view": "ver",

      "toast.setAddress": "Primero configura la dirección del contrato en app.js",
      "toast.mined": "⛏️ ¡Ya estás en el minado de hoy!",
      "toast.minedPaid": "⛏️ ¡Minado! +{amount} NOVA del día {day}",
      "toast.claimed": "+{amount} NOVA cobrados",
      "toast.needMM": "Necesitas MetaMask",
      "toast.notConfigured": "Contrato no configurado",
      "toast.added": "🦊 {symbol} añadido a tu wallet",

      "err.cancel": "Has cancelado la transacción.",
      "err.funds": "No tienes suficiente ETH en {network} para pagar el gas. Con unos céntimos basta.",
      "err.wait": "Ya has minado hoy. Vuelve después de las 00:00 UTC.",
      "err.ended": "El minado ha terminado.",
      "err.nothing": "Todavía no hay nada que reclamar.",
      "err.generic": "Algo salió mal: {msg}",
      "err.unknown": "error desconocido",
    },

    fr: {
      "meta.title": "Nova · La pièce qu’on mine en un clic",
      "meta.titleMiner": "Nova · Mineur",
      "meta.desc": `Nova est une pièce sur le réseau Base que l’on mine gratuitement depuis le web, une fois par jour. 50${NB}000 NOVA sont partagés chaque jour entre les mineurs, et ce montant est divisé par deux tous les 210 jours.`,
      "meta.descMiner": "Minez une fois par jour et partagez les NOVA du jour sur le réseau Base.",
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
      "hero.lead": `Appuyez sur Miner une fois par jour et partagez les {daily} {symbol} libérés ce jour-là avec tous ceux qui ont miné. Ni course ni prévente, et plus vous avez miné et gardé de NOVA, plus votre part est grande.`,
      "hero.start": "Commencer à miner",
      "hero.see": "Voir comment ça marche",
      "hero.liveData": "Données en direct",
      "hero.mined": "<strong>{supply}</strong> {symbol} minés",
      "hero.today": "<strong>{today}</strong> mineurs aujourd’hui",
      "hero.daily": "<strong>{daily}</strong> {symbol} à partager aujourd’hui",
      "hint.drag": "Faites glisser la pièce pour la faire tourner",
      "hint.tap": "Touchez la pièce pour la retourner",

      "manifesto": `Pas de fermes de serveurs. Pas de cartes graphiques. Pas de prévente ni de pièces réservées au créateur. Juste un contrat public qui libère 50${NB}000 NOVA chaque jour et les partage entre tous ceux qui se présentent, divisés par deux tous les 210 jours, jusqu’à 21 millions.`,

      "rules.title": "Des règles que personne ne peut changer",
      "rules.sub": "Elles sont inscrites dans le contrat. Même son créateur ne peut pas y toucher, et tout le monde peut lire le code sur l’explorateur de blocs.",
      "r1.h": "21 millions. Pas une de plus.",
      "r1.p": `Le contrat ne pourra jamais créer plus de 21${NB}000${NB}000 NOVA. La récompense quotidienne continue d’être divisée par deux${NB}: le total s’approche de cette limite sans jamais la dépasser.`,
      "r2.h": "{daily} NOVA par jour, partagés",
      "rp.h": "Qui garde mine plus",
      "rp.p": `Votre puissance de minage va de 1x sans NOVA jusqu’à 5x, et augmente avec les NOVA que vous avez minés et gardés. Les nouveaux commencent petit${NB}; les pièces envoyées par d’autres ne comptent pas.`,
      "r2.p": `Chaque jour, le contrat libère un montant fixe, partagé entre tous les wallets qui ont miné ce jour-là selon leur puissance de minage. Pas de course${NB}: miner à 9${NB}h ou à 23${NB}h donne la même part.`,
      "r3.h": "Halving tous les 210 jours",
      "r3.p": `La récompense quotidienne est divisée par deux tous les 210 jours, comme celle de Bitcoin tous les 210${NB}000 blocs. Les premiers mineurs reçoivent plus, et NOVA se raréfie avec le temps.`,
      "r4.h": "Personne ne peut tout prendre",
      "r4.p": "Au maximum une récompense quotidienne peut être créée par jour, quoi qu’il arrive. Même quelqu’un avec mille wallets ne peut pas vider l’offre.",
      "r5.h": "Le créateur part de zéro",
      "r5.p": "Aucune pièce réservée. Celui qui a lancé Nova doit miner comme tout le monde.",

      "how.title": "Trois étapes, zéro matériel",
      "s1.h": "Connectez votre wallet",
      "s1.p": `Cliquez sur «${NB}Connecter le wallet${NB}» et validez dans MetaMask. Le site vous fait passer automatiquement sur le réseau Base.`,
      "s2.h": "Minez une fois par jour",
      "s2.p": "Confirmez la transaction. Vous payez quelques centimes de gas et rejoignez les mineurs du jour.",
      "s3.h": "Recevez votre part",
      "s3.p": "À la fin de la journée (00:00 UTC), les NOVA du jour sont partagés entre tous ceux qui ont miné. Votre part est versée la prochaine fois que vous minez, ou réclamez-la quand vous voulez.",

      "mine.title": "Minez les NOVA du jour",
      "mine.sub": "Lu en direct sur la blockchain. Mis à jour automatiquement toutes les quelques secondes.",
      "mine.full": "Ouvrir le mineur complet, avec l’activité en direct",
      "supply.title": "Offre minée",
      "supply.of": "{supply} sur {max} {symbol}",
      "stat.daily": "Récompense du jour",
      "stat.today": "Mineurs aujourd’hui",
      "stat.closes": "Fin du jour dans",
      "stat.mines": "Minages",
      "stat.miners": "Mineurs",
      "stat.day": "Jour",
      "balance": "Votre solde",
      "addToken": "Ajouter {symbol} à MetaMask",
      "viewContract": "Voir le contrat",

      "faq.q1": `Miner coûte-t-il de l’argent${NB}?`,
      "faq.a1": "La pièce est gratuite, mais chaque transaction sur Base paie de petits frais de réseau (gas) en ETH. En général, quelques centimes.",
      "faq.q2": `Est-ce comme miner du Bitcoin${NB}?`,
      "faq.a2": `Plus qu’on ne le croit. Comme pour Bitcoin, une récompense fixe est libérée selon un calendrier, elle est divisée par deux avec le temps (tous les 210 jours ici, tous les 210${NB}000 blocs là-bas) et le total s’arrête à 21 millions. La différence${NB}: avec Bitcoin, des ordinateurs rivalisent pour résoudre des calculs${NB}; ici, la récompense du jour est partagée entre tous ceux qui ont appuyé sur Miner, selon les NOVA qu’ils détiennent.`,
      "faq.q3": `Pourquoi je reçois mes pièces le lendemain${NB}?`,
      "faq.a3": `Votre part dépend du nombre de personnes qui minent ce jour-là, et on ne le connaît qu’à la fin de la journée, à 00:00 UTC. Elle est versée automatiquement la prochaine fois que vous minez, ou vous pouvez la réclamer à tout moment avec le bouton «${NB}Réclamer${NB}».`,
      "faq.q4": `Quelqu’un peut-il prendre toutes les pièces${NB}?`,
      "faq.a4": "Non. Au maximum {daily} NOVA peuvent être créés par jour, quoi qu’il arrive. Les nouveaux wallets commencent à une puissance de 1x, donc en créer beaucoup de vides rapporte peu, et chacun paie du gas tous les jours. Personne ne peut vider l’offre ni empêcher les autres de recevoir leur part.",
      "faq.q8": `Qu’est-ce que la puissance de minage${NB}?`,
      "faq.a8": `Elle décide de la taille de votre part du jour. Un wallet sans NOVA mine à 1x. La puissance augmente avec les NOVA que vous avez minés vous-même et que vous gardez, jusqu’à 5x quand vous détenez deux jours de récompense (100${NB}000 NOVA pendant les 210 premiers jours). Elle augmente plus vite au début${NB}: 1${NB}000 NOVA donnent 1,4x, 10${NB}000 donnent 2,3x et 25${NB}000 donnent 3,0x. Les NOVA envoyés par quelqu’un d’autre ne comptent pas, et si vous envoyez les vôtres, votre puissance baisse.`,
      "faq.q5": `Pourquoi Base${NB}?`,
      "faq.a5": `Base est un réseau de couche 2 construit sur Ethereum. Il hérite de la sécurité d’Ethereum, mais les frais sont bien plus bas${NB}: une transaction par jour a donc du sens.`,
      "faq.q6": `Ça vaut quelque chose${NB}? Puis-je en acheter${NB}?`,
      "faq.a6": `Non. C’est un projet éducatif${NB}: il n’est pas vendu et n’est coté sur aucune plateforme d’échange. Il sert à apprendre comment fonctionnent les tokens et les smart contracts.`,
      "faq.q7": "Je ne vois pas mes pièces dans MetaMask",
      "faq.a7": `Cliquez sur «${NB}Ajouter NOVA à MetaMask${NB}» dans le panneau de minage. La pièce apparaîtra dans votre wallet avec son logo.`,

      "outro.text": "Un clic par jour. Partagé entre tous.",
      "outro.cta": "Aller miner",
      "footer.note": "Projet éducatif sur le réseau {network}. Sans valeur monétaire.",
      "footer.contract": "Contrat sur l’explorateur",
      "footer.back": "← Retour à l’accueil",
      "footer.testnet": "Version de test (Base Sepolia)",
      "footer.mainnet": "Quitter la version de test",

      "miner.tag": "Mineur",
      "miner.stage": "Miner",
      "today.title": "Aujourd’hui · jour {day}",
      "today.resets": "Nouveau jour à 00:00 UTC ({resettime} chez vous)",
      "today.toShare": "À partager",
      "today.miners": "Mineurs",
      "today.each": "Part moyenne",
      "today.halving": "Passe à {nextdaily} NOVA dans {halving} jours",
      "wallet.title": "Votre wallet",
      "wallet.power": "Puissance de minage",
      "wallet.next": "Prochain minage",
      "wallet.last": "Dernier minage",
      "wallet.ready": "Prêt à réclamer",
      "wallet.share": "Votre part du jour",
      "feed.title": "Activité récente",
      "feed.loading": "Chargement…",
      "feed.notLive": "L’activité récente apparaîtra ici dès que le contrat sera en ligne.",
      "feed.none": `Aucune activité ces dernières heures. Soyez le premier${NB}!`,
      "feed.error": "Impossible de charger l’activité récente pour l’instant.",
      "feed.you": "Vous",
      "feed.mined": "a miné à {power}",

      "ago.now": "à l’instant",
      "ago.min": "il y a {n} min",
      "ago.h": "il y a {n} h",
      "ago.d": "il y a {n} j",
      "never": "Jamais",
      "day.today": "Aujourd’hui",
      "day.yesterday": "Hier",
      "day.n": "Jour {n}",

      "btn.connect": "Connectez votre wallet",
      "btn.ended": "Minage terminé",
      "btn.next": "Prochain minage dans {time}",
      "btn.mine": "Miner",
      "btn.confirm": "Confirmez dans MetaMask…",
      "btn.mining": "Minage…",
      "btn.claiming": "Réclamation…",
      "btn.claim": "Réclamer {amount} NOVA",
      "next.ready": "Disponible",

      "st.need": "Il vous faut MetaMask et quelques centimes d’ETH sur {network} pour le gas.",
      "st.needTest": `Version de test$${NB}: il vous faut MetaMask et de l’ETH de test gratuit sur Base Sepolia (cherchez «$${NB}Base Sepolia faucet$${NB}»).`,
      "st.ethers": "Impossible de charger la bibliothèque ethers.js. Vérifiez votre connexion internet.",
      "st.notConfigured": "Le contrat n’est pas encore configuré.",
      "st.soon": `Le minage n’est pas encore ouvert. Revenez bientôt${NB}!`,
      "st.noMetamask": "MetaMask introuvable. Installez-le depuis metamask.io et rechargez la page.",
      "st.ready": "Prêt. Votre puissance de minage est de {power}. Minez une fois par jour pour recevoir une part des {daily} NOVA du jour.",
      "st.joined": `Vous participez au minage du jour à {power}${NB}! Votre part (environ {share} NOVA pour l’instant) arrive après 00:00 UTC, soit {time} chez vous.`,
      "st.claimHint": "Vos {amount} NOVA du jour {day} seront versés quand vous minerez aujourd’hui, ou réclamez-les maintenant.",
      "st.ended": `Le minage est terminé${NB}: tous les halvings ont eu lieu.`,
      "st.confirm": "Vérifiez la fenêtre MetaMask et confirmez la transaction.",
      "st.sent": "Transaction envoyée. En attente de confirmation…{view}",
      "st.view": "voir",

      "toast.setAddress": "Configurez d’abord l’adresse du contrat dans app.js",
      "toast.mined": `⛏️ Vous participez au minage du jour${NB}!`,
      "toast.minedPaid": `⛏️ Miné${NB}! +{amount} NOVA du jour {day}`,
      "toast.claimed": "+{amount} NOVA récupérés",
      "toast.needMM": "Il vous faut MetaMask",
      "toast.notConfigured": "Contrat non configuré",
      "toast.added": "🦊 {symbol} ajouté à votre wallet",

      "err.cancel": "Vous avez annulé la transaction.",
      "err.funds": "Vous n’avez pas assez d’ETH sur {network} pour payer le gas. Quelques centimes suffisent.",
      "err.wait": "Vous avez déjà miné aujourd’hui. Revenez après 00:00 UTC.",
      "err.ended": "Le minage est terminé.",
      "err.nothing": "Il n’y a encore rien à réclamer.",
      "err.generic": `Une erreur s’est produite${NB}: {msg}`,
      "err.unknown": "erreur inconnue",
    },
  };

  const LOCALES = { en: "en-US", es: "es-ES", fr: "fr-FR" };
  const NAMES = { en: "English", es: "Español", fr: "Français" };
  const STATS = ["supply", "max", "miners", "mines", "pct", "today", "share", "day", "halving", "nextdaily"];
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
    // Values used for {daily} {symbol} {network} {name} {resettime}; app.js keeps them up to date
    vars: { name: "Nova", symbol: "NOVA", network: "Base", daily: "50,000", resettime: "" },

    // Translate a key. Explicit vars win; the shared placeholders become
    // <span data-…> elements that app.js keeps updated.
    t(key, vars) {
      const s = DICT[this.lang][key] ?? DICT.en[key] ?? key;
      return s.replace(/\{(\w+)\}/g, (m, k) => {
        if (vars && k in vars) return typeof vars[k] === "function" ? vars[k]() : vars[k];
        if (k === "daily") return `<span data-stat="daily">${this.vars.daily}</span>`;
        if (k === "symbol") return `<span data-symbol>${this.vars.symbol}</span>`;
        if (k === "network") return `<span data-network>${this.vars.network}</span>`;
        if (k === "name") return `<span data-name>${this.vars.name}</span>`;
        if (k === "resettime") return `<span data-reset-time>${this.vars.resettime}</span>`;
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
