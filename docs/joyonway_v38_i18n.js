/* 2026-05-20 V3.8 addon | i18n FR/EN toggle | KnapTheBuilder
 * Depend: joyonway_frame_analyzer.html (V3.2 base) + V3.3..V3.7 addons charges avant
 * Fonction: switch EN/FR fixe en haut a droite, traduction live de toute l'UI,
 *           persistance via localStorage, observe les mutations DOM pour traduire
 *           les contenus dynamiques injectes par les autres addons.
 * Defaut: EN (pour la communaute internationale).
 * Aucune dependance externe.
 */
(function () {
  "use strict";

  const STORAGE_KEY = "joyonway_lang";
  const VERSION    = "V3.8";

  // ===========================================================================
  // Translation dictionary (EN -> FR)
  // Keys are the EXACT English strings as they appear in the DOM.
  // ===========================================================================
  const FR = {
    // Header
    "Multi-model RS485 capture parser - delimited frames mode (P23B32, P69B133, P20B29, others)":
      "Analyseur de captures RS485 multi-modèles - mode trames délimitées (P23B32, P69B133, P20B29, autres)",

    // Card 1: Controller Format
    "1. Controller Format": "1. Format du contrôleur",
    "Auto-detect": "Auto-détection",
    "Scan all delimiters": "Scanner tous les délimiteurs",
    "Custom...": "Personnalisé...",
    "Auto-detect tests known presets and picks the one yielding the most frames.":
      "L'auto-détection teste les presets connus et retient celui qui produit le plus de trames.",
    "Delimiter (hex)": "Délimiteur (hex)",
    "CMD offset": "Offset CMD",
    "Src offset": "Offset Src",
    "Apply": "Appliquer",

    // Card 2: Capture File
    "2. Capture File": "2. Fichier de capture",
    "Click to upload": "Cliquer pour uploader",
    "or drop a capture file here": "ou déposer un fichier de capture ici",
    "Supported formats: xxd output, raw hex, hex with spaces, hex with commas":
      "Formats supportés : sortie xxd, hex brut, hex avec espaces, hex avec virgules",
    "Clear": "Effacer",
    "Load P23B32 sample": "Charger l'échantillon P23B32",
    "No file loaded": "Aucun fichier chargé",
    "Delimiter Scan Results": "Résultats du scan de délimiteur",

    // Card 2bis: Paste frames (V3.3 addon)
    "2bis. Paste frames (V3.3)": "2bis. Coller des trames (V3.3)",
    "Parse as raw frames": "Parser comme trames brutes",
    "P69B133 test set": "Jeu de test P69B133",
    "P69B133 REAL set (valid CRCs)": "Jeu RÉEL P69B133 (CRC valides)",

    // Card 3: Frames
    "3. Frames (click to select)": "3. Trames (cliquer pour sélectionner)",
    "Clear ref": "Effacer réf.",
    "No frames loaded": "Aucune trame chargée",
    "B4 status": "B4 statut",
    "B5 filtration": "B5 filtration",
    "A5 module poll": "A5 polling module",
    "A1 setpoint": "A1 consigne",
    "A4 filtration": "A4 filtration",
    "AE light": "AE lumière",
    "AA broadcast": "AA broadcast",

    // Card 4: Selected Frame
    "4. Selected Frame": "4. Trame sélectionnée",
    "Select a frame from the left list": "Sélectionnez une trame dans la liste de gauche",
    "Mark as reference": "Marquer comme référence",
    "Copy hex": "Copier hex",

    // Card 5: Diff
    "5. Diff vs Reference": "5. Différence vs référence",

    // Card 6: Byte Position Statistics
    "6. Byte Position Statistics (variations per Src + CMD)":
      "6. Statistiques par position d'octet (variations par Src + CMD)",
    "Load a capture to see byte position stats":
      "Chargez une capture pour voir les statistiques par position",

    // Workflow card
    "Workflow": "Mode d'emploi",
    "Disable any active HA Joyonway integration (only one TCP client at a time on the W610)":
      "Désactivez toute intégration HA Joyonway active (un seul client TCP à la fois sur le W610)",
    "Upload the capture. The tool extracts frames between consecutive delimiter bytes.":
      "Uploadez la capture. L'outil extrait les trames entre deux octets délimiteurs consécutifs.",
    "Byte Position Statistics shows which positions vary across all frames of the same Src/CMD pair.":
      "Les statistiques par position montrent quelles positions varient entre les trames de même paire Src/CMD.",
    "the repo": "le dépôt",
    "red": "rouge",
    "reference": "référence",

    // Card 7: Community Contribution (V3.7 addon)
    "7. Contribute to community (V3.7)": "7. Contribuer à la communauté (V3.7)",
    "Help expand the analyzer. Fill in your hardware info, and we'll generate a pre-filled GitHub Issue + a downloadable contribution file. Nothing is sent without your action.":
      "Aidez à enrichir l'analyzer. Remplissez vos infos matériel et nous générons une issue GitHub pré-remplie + un fichier de contribution téléchargeable. Rien n'est envoyé sans votre action.",
    "Controller model": "Modèle de contrôleur",
    "Keypad model": "Modèle de clavier",
    "RS485 bridge": "Pont RS485",
    "Credit me as (optional)": "Me créditer comme (optionnel)",
    "What was happening during the capture (min 10 chars)":
      "Que se passait-il pendant la capture (min 10 caractères)",
    "Open GitHub Issue (pre-filled)": "Ouvrir l'issue GitHub (pré-remplie)",
    "Download contribution.md": "Télécharger contribution.md",
    "Copy issue body to clipboard": "Copier le corps d'issue",
    "Detected format:": "Format détecté :",
    "Loaded bytes:": "Octets chargés :",
    "Frames parsed:": "Trames parsées :",
    "Distinct (Src,CMD) pairs:": "Paires (Src,CMD) distinctes :",
    "none yet": "aucun pour l'instant",

    // Contribute statuses
    "Load a capture first (card 2 or 2bis), then fill in the form.":
      "Chargez d'abord une capture (carte 2 ou 2bis), puis remplissez le formulaire.",
    "No capture loaded yet. Load one via card 2 or 2bis.":
      "Aucune capture chargée. Chargez-en une via la carte 2 ou 2bis.",
    "Ready to contribute. Choose an action above.":
      "Prêt à contribuer. Choisissez une action ci-dessus.",
    "GitHub Issue opened in a new tab. Don't forget to attach your raw capture.txt there.":
      "Issue GitHub ouverte dans un nouvel onglet. N'oubliez pas d'y attacher votre capture.txt brute.",
    "Clipboard permission denied. Use Download instead.":
      "Permission presse-papier refusée. Utilisez Télécharger à la place.",

    // V3.6 CRC validation
    "CRC-8 valid": "CRC-8 valide",
    "CRC-8 INVALID": "CRC-8 INVALIDE",
    "This frame is REPLAYABLE on a real P69B133 controller":
      "Cette trame est REJOUABLE sur un vrai contrôleur P69B133",
    "A real P69B133 controller would REJECT this frame":
      "Un vrai contrôleur P69B133 REJETTERAIT cette trame",

    // Workflow ol items (translated fragments — see translateOL below)
    "If you know your controller, select it. Otherwise use":
      "Si vous connaissez votre contrôleur, sélectionnez-le. Sinon utilisez",
    "first.": "d'abord.",
    "Capture RS485 traffic:": "Capturez le trafic RS485 :",
    "Mark a frame as": "Marquez une trame comme",
    ", then click another frame in a different state. Bytes that differ are highlighted in":
      ", puis cliquez sur une autre trame dans un état différent. Les octets différents sont surlignés en",
    "Adding new presets: open an issue at": "Pour ajouter de nouveaux presets : ouvrez une issue sur",
    "with your model and frame structure.": "avec votre modèle et la structure de trame.",

    // Common consent paragraph
    "I confirm this capture contains only RS485 bus bytes (no personal data, no IP, no credentials). I agree to publish it under the MIT license of this project so the community can use it to extend protocol support.":
      "Je confirme que cette capture ne contient que des octets du bus RS485 (pas de données personnelles, pas d'IP, pas d'identifiants). J'accepte de la publier sous la licence MIT du projet pour que la communauté puisse l'utiliser afin d'étendre le support des protocoles.",
  };

  // Prefix-based fragments for dynamic statuses (e.g. "Missing: model, bridge")
  const FR_PREFIX = {
    "Missing: ": "Manquant : ",
    "Downloaded ": "Téléchargé ",
    "Issue body copied to clipboard": "Corps d'issue copié dans le presse-papier",
  };

  // Placeholder translations
  const FR_PLACEHOLDER = {
    "Filter by CMD (e.g. B4) or hex": "Filtrer par CMD (ex. B4) ou hex",
    "e.g. PB554, PB555": "ex. PB554, PB555",
    "GitHub @handle or forum nick": "@handle GitHub ou pseudo forum",
    "e.g. Changed setpoint 36 -> 38 -> 36. Toggled pump 2 ON then OFF. Capture lasted 60s. Spa idle, no app connected.":
      "ex. Consigne changée 36 -> 38 -> 36. Pompe 2 ON puis OFF. Capture 60s. Spa au repos, pas d'app connectée.",
    "-- select --": "-- sélectionner --",
  };

  // Select option translations (keyed by visible text)
  const FR_OPTION = {
    "-- select --": "-- sélectionner --",
    "Other (specify in notes)": "Autre (préciser dans les notes)",
    "USR-W610 (WiFi-RS485)": "USR-W610 (WiFi-RS485)",
    "Other": "Autre",
  };

  // ===========================================================================
  // Caches: original EN text indexed by node identity
  // ===========================================================================
  const originalText  = new WeakMap();   // TextNode -> EN string
  const originalAttr  = new WeakMap();   // Element  -> Map<attrName, EN string>

  function cacheOriginalText(node) {
    if (!originalText.has(node)) originalText.set(node, node.nodeValue);
  }
  function cacheOriginalAttr(el, attr) {
    let m = originalAttr.get(el);
    if (!m) { m = new Map(); originalAttr.set(el, m); }
    if (!m.has(attr)) m.set(attr, el.getAttribute(attr));
  }

  // ===========================================================================
  // Translation engine
  // ===========================================================================
  function lookupText(en) {
    if (!en) return en;
    const trimmed = en.trim();
    if (!trimmed) return en;
    // exact match
    if (FR[trimmed]) {
      // preserve leading/trailing whitespace
      const lead  = en.match(/^\s*/)[0];
      const trail = en.match(/\s*$/)[0];
      return lead + FR[trimmed] + trail;
    }
    // prefix match (for status messages like "Missing: ...")
    for (const pfx in FR_PREFIX) {
      if (trimmed.startsWith(pfx)) {
        return en.replace(pfx, FR_PREFIX[pfx]);
      }
    }
    return en;  // not translated, return as-is
  }

  function translateNode(node, targetLang) {
    if (node.nodeType !== Node.TEXT_NODE) return;
    cacheOriginalText(node);
    const en = originalText.get(node);
    node.nodeValue = (targetLang === "fr") ? lookupText(en) : en;
  }

  function translateAttributes(el, targetLang) {
    // placeholder
    if (el.hasAttribute("placeholder")) {
      cacheOriginalAttr(el, "placeholder");
      const en = originalAttr.get(el).get("placeholder");
      const tr = (targetLang === "fr" && FR_PLACEHOLDER[en]) ? FR_PLACEHOLDER[en] : en;
      el.setAttribute("placeholder", tr);
    }
    // title (tooltips)
    if (el.hasAttribute("title")) {
      cacheOriginalAttr(el, "title");
      const en = originalAttr.get(el).get("title");
      const tr = (targetLang === "fr" && FR[en]) ? FR[en] : en;
      el.setAttribute("title", tr);
    }
  }

  function translateOptionsAndButtons(el, targetLang) {
    // <option> elements with text content
    if (el.tagName === "OPTION") {
      const text = el.textContent.trim();
      if (targetLang === "fr" && FR_OPTION[text]) {
        if (!el.dataset._enText) el.dataset._enText = text;
        el.textContent = FR_OPTION[text];
      } else if (el.dataset._enText) {
        el.textContent = el.dataset._enText;
      }
    }
  }

  function walkAndTranslate(root, targetLang) {
    if (!root) return;
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
      null
    );
    let n;
    while ((n = walker.nextNode())) {
      if (n.nodeType === Node.TEXT_NODE) {
        translateNode(n, targetLang);
      } else if (n.nodeType === Node.ELEMENT_NODE) {
        translateAttributes(n, targetLang);
        translateOptionsAndButtons(n, targetLang);
      }
    }
  }

  function applyLanguage(lang) {
    walkAndTranslate(document.body, lang);
    updateSwitchUI(lang);
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* ignore */ }
  }

  // ===========================================================================
  // Language switch UI (fixed top-right)
  // ===========================================================================
  function injectSwitch() {
    if (document.getElementById("lang-switch")) return;

    const style = document.createElement("style");
    style.textContent = `
      #lang-switch {
        position: fixed; top: 14px; right: 14px; z-index: 9999;
        display: flex; gap: 0;
        background: rgba(20, 20, 40, 0.85);
        border: 1px solid var(--border-cyan, #00e5ff);
        border-radius: 14px; overflow: hidden;
        font-family: var(--mono, 'Courier New'), monospace;
        font-size: 11px; box-shadow: 0 0 12px rgba(0, 229, 255, 0.25);
        backdrop-filter: blur(6px);
      }
      #lang-switch button {
        background: transparent; border: none; padding: 6px 12px;
        color: var(--text-dim, #8090b0); cursor: pointer;
        font-family: inherit; font-size: inherit; font-weight: 600;
        letter-spacing: 1px; transition: all 0.15s;
      }
      #lang-switch button:hover { color: var(--text-primary, #e0e8ff); }
      #lang-switch button.active {
        background: var(--border-cyan, #00e5ff); color: #0a0a14;
      }
    `;
    document.head.appendChild(style);

    const sw = document.createElement("div");
    sw.id = "lang-switch";
    sw.innerHTML = `
      <button data-lang="en" title="English">EN</button>
      <button data-lang="fr" title="Français">FR</button>
    `;
    document.body.appendChild(sw);

    sw.querySelectorAll("button").forEach(btn => {
      btn.addEventListener("click", () => {
        const lang = btn.dataset.lang;
        applyLanguage(lang);
      });
    });
  }

  function updateSwitchUI(lang) {
    const sw = document.getElementById("lang-switch");
    if (!sw) return;
    sw.querySelectorAll("button").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.lang === lang);
    });
  }

  // ===========================================================================
  // MutationObserver: catch dynamic content from V3.3-V3.7 addons
  // ===========================================================================
  function startObserver() {
    let pending = null;
    const observer = new MutationObserver(() => {
      const lang = getCurrentLang();
      if (lang === "en") return;  // nothing to do
      if (pending) clearTimeout(pending);
      pending = setTimeout(() => {
        walkAndTranslate(document.body, lang);
        pending = null;
      }, 80);  // debounce: batch nearby mutations
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  function getCurrentLang() {
    try { return localStorage.getItem(STORAGE_KEY) || "en"; }
    catch (e) { return "en"; }
  }

  // ===========================================================================
  // Bootstrap
  // ===========================================================================
  function init() {
    injectSwitch();
    const lang = getCurrentLang();
    // First pass after a short delay to let other addons (V3.3-V3.7) inject their content
    setTimeout(() => {
      applyLanguage(lang);
      startObserver();
    }, 500);
    // Safety re-pass at 1500ms in case some addon was slow
    setTimeout(() => applyLanguage(getCurrentLang()), 1500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
