// Variables globales
let tempsDeJeu = 0;
let intervalleCompteur = null;
let ongletActif = null;

// Fonction pour démarrer le compteur
function demarrerCompteur() {
  if (!intervalleCompteur) {
    intervalleCompteur = setInterval(() => {
      tempsDeJeu++;
      // Sauvegarde du temps dans le stockage local
      browser.storage.local.set({ tempsDeJeu: tempsDeJeu });
    }, 1000);
  }
}

// Fonction pour arrêter le compteur
function arreterCompteur() {
  if (intervalleCompteur) {
    clearInterval(intervalleCompteur);
    intervalleCompteur = null;
  }
}

// Fonction pour vérifier si l'URL est exactement repuls.io
function estRacineRepulsIo(url) {
  return url === "https://repuls.io/" || url === "http://repuls.io/";
}

// Fonction pour gérer le changement d'URL
function gererChangementURL(onglet) {
  if (estRacineRepulsIo(onglet.url)) {
    if (ongletActif !== onglet.id) {
      ongletActif = onglet.id;
      demarrerCompteur();
    }
  } else {
    if (ongletActif === onglet.id) {
      arreterCompteur();
      ongletActif = null;
    }
  }
}

// Écouteur pour les changements d'onglets
browser.tabs.onActivated.addListener((infoOnglet) => {
  browser.tabs.get(infoOnglet.tabId).then(gererChangementURL);
});

// Écouteur pour les mises à jour d'onglets
browser.tabs.onUpdated.addListener((tabId, changeInfo, onglet) => {
  if (changeInfo.status === 'complete') {
    gererChangementURL(onglet);
  }
});

// Initialisation : récupération du temps de jeu sauvegardé
browser.storage.local.get('tempsDeJeu').then((result) => {
  tempsDeJeu = result.tempsDeJeu || 0;
});