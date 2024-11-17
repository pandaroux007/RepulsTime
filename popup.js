/* browser.runtime.onMessage.addListener((message) => {
    if (message.action === "showError") {
      const errorDiv = document.createElement('div');
      errorDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 24px;
        z-index: 9999;
      `;
      errorDiv.textContent = "Temps limite atteint pour aujourd'hui !";
      document.body.appendChild(errorDiv);
    }
});
*/

// Fonction pour formater le temps en heures:minutes:secondes
function formaterTemps(secondes) {
  const heures = Math.floor(secondes / 3600);
  const minutes = Math.floor((secondes % 3600) / 60);
  const secondesRestantes = secondes % 60;
  return `${heures.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secondesRestantes.toString().padStart(2, '0')}`;
}

// Fonction pour mettre à jour l'affichage du temps
function mettreAJourAffichage() {
  browser.storage.local.get('tempsDeJeu').then((result) => {
    const tempsDeJeu = result.tempsDeJeu || 0;
    document.getElementById('tempsAffiche').textContent = formaterTemps(tempsDeJeu);
  });
}

// Mise à jour de l'affichage toutes les secondes
setInterval(mettreAJourAffichage, 1000);

// Affichage initial
mettreAJourAffichage();