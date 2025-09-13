// bot.js
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const Fuse = require('fuse.js');

// --------- Config ---------
const DATA_PATH = path.join(__dirname, 'data', 'responses.json');
const client = new Client({
  authStrategy: new LocalAuth({ clientId: 'bot' }),
  puppeteer: { headless: true } // headless true = Chrome invisible
});

// --------- Abréviations FR courantes ---------
const ABBR_MAP = {
  // Salutations & formules
  'slt': 'salut', 'bjr': 'bonjour', 'bsr': 'bonsoir', 'cc': 'coucou',
  'a+': 'a plus', 'a++': 'a plus', 'dsl': 'desole', 'stp': 's il te plait',
  'svp': 's il vous plait', 'svp?': 's il vous plait', 'merciii': 'merci',
  'mdr': 'rire', 'lol': 'rire', 'ptdr': 'rire', 'xptdr': 'rire',
  // Questions
  'pk': 'pourquoi', 'pq': 'pourquoi', 'pcq': 'parce que',
  'cmt': 'comment', 'cmnt': 'comment', 'cb': 'combien', 'qtt': 'quantite',
  // Temps
  'ajd': 'aujourd hui', 'aprem': 'apres midi', 'rdv': 'rendez vous',
  'tt': 'tout', 'tt le monde': 'tout le monde', 'tjr': 'toujours', 'jam': 'jamais',
  // Commerce / support
  'cmd': 'commande', 'liv': 'livraison', 'sav': 'service apres vente',
  'pblm': 'probleme', 'pb': 'probleme', 'rslt': 'resultat',
  'retour?': 'retour', 'remb?': 'remboursement', 'remb': 'remboursement',
  'delai': 'delai', 'delais': 'delais',
  // Divers SMS
  'jtm': 'je t aime', 'tkt': 't inquiète', 'nrv': 'enerve', 'c': 'c est'
};

// --------- Normalisation ---------
function expandAbbr(input) {
  // Remplace les tokens abrégés par leur forme étendue
  return input
    .split(/\s+/)
    .map(tok => ABBR_MAP[tok.toLowerCase()] || tok)
    .join(' ');
}

function normalize(s) {
  if (!s) return '';
  return s
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // supprime accents
    .replace(/[^a-z0-9\s]/g, ' ') // supprime ponctuation
    .replace(/\s+/g, ' ')
    .trim();
}

function preprocessQuery(raw) {
  return normalize(expandAbbr(raw));
}

// --------- Dataset + Fuzzy ---------
let DATA = [];
let fuse = null;

function buildFuseIndex() {
  DATA.forEach(item => {
    item._normTriggers = (item.triggers || []).map(t => preprocessQuery(t));
  });

  fuse = new Fuse(DATA, {
    keys: ['_normTriggers', 'id'], // on indexe les déclencheurs normalisés et l'id
    includeScore: true,
    threshold: 0.36,      // plus petit = plus strict ; 0.3-0.4 est un bon range
    ignoreLocation: true,
    distance: 150,
    minMatchCharLength: 2,
    shouldSort: true
  });
}

function loadData() {
  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf8');
    DATA = JSON.parse(raw);
    buildFuseIndex();
    console.log(`Dataset chargé: ${DATA.length} entrées ✅`);
  } catch (e) {
    console.error('Erreur de chargement du dataset:', e.message);
    DATA = [];
  }
}

// Reload à chaud sur modifications
function watchDataFile() {
  try {
    fs.watch(DATA_PATH, { persistent: true }, (eventType) => {
      if (eventType === 'change' || eventType === 'rename') {
        console.log('Changement détecté dans responses.json → rechargement...');
        setTimeout(loadData, 300); // petit délai pour éviter lecture partielle
      }
    });
  } catch (_) {}
}

// --------- Actions dynamiques ---------
const jokes = [
  "Pourquoi les développeurs aiment la nature ? Parce qu'elle a plein de bugs 😅",
  "Un SQL entre dans un bar, il voit deux tables et demande: « Je peux vous joindre ? »",
  "J’ai un problème de cache... mais ça va s’arranger avec le temps 😉"
];

const actions = {
  time: () => {
    const d = new Date();
    return `Il est ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
  },
  date: () => {
    return `Nous sommes le ${new Date().toLocaleDateString('fr-FR')}`;
  },
  joke: () => jokes[Math.floor(Math.random() * jokes.length)],
  help: () => "Je peux t’aider sur: commandes, livraison, retours, horaires, prix, contact, etc. Dis-moi ce que tu veux 😄"
};

function buildResponse(item) {
  if (item.action && actions[item.action]) return actions[item.action]();
  if (Array.isArray(item.reply)) {
    return item.reply[Math.floor(Math.random() * item.reply.length)];
  }
  return item.reply;
}

function bestAnswer(raw) {
  const query = preprocessQuery(raw);
  if (!query) return null;

  // 1) Essai match exact sur déclencheurs normalisés
  for (const it of DATA) {
    if (it._normTriggers && it._normTriggers.includes(query)) {
      return buildResponse(it);
    }
  }

  // 2) Fuzzy search
// 2) Fuzzy search
if (!fuse) {
  console.warn("⚠️ Fuse index non construit !");
  return "Désolé, je n’ai pas encore de réponses disponibles. Vérifie ton fichier responses.json.";
}
const results = fuse.search(query);

  // Filtrer par score max pour éviter des réponses hors-sujet
  const good = results.filter(r => r.score <= 0.5).slice(0, 3);

  if (good.length > 0) {
    return buildResponse(good[0].item);
  }

  // 3) Fallback: suggestions
  const suggestions = results.slice(0, 3).map(r => r.item?.suggest || r.item?.id).filter(Boolean);
  if (suggestions.length) {
    return `Désolé, je n'ai pas bien compris 🤔\nTu pensais à:\n• ${suggestions.join('\n• ')}\nTu peux reformuler ?`;
  }
  return "Hmm, je ne suis pas sûr de comprendre. Tu peux préciser ta demande ? 🙂";
}

// --------- WhatsApp wiring ---------
client.on('qr', qr => {
  console.log('QR Code reçu, scanne-le avec ton téléphone :');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('Client prêt ! Connecté à WhatsApp ✅');
});

client.on('message', async (message) => {
  try {
    console.log(`Message reçu de ${message.from}: ${message.body}`);
    const reply = bestAnswer(message.body);
    if (reply) await message.reply(reply);
  } catch (e) {
    console.error('Erreur traitement message:', e);
  }
});

client.on('message_create', msg => {
  if (msg.from === 'status@broadcast') {
    console.log(`Status reçu: ${msg.body}`);
  }
});

// Démarrage
loadData();
watchDataFile();
client.initialize();