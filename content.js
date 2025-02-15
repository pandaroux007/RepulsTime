const timerDiv = document.createElement('div');
timerDiv.style.cssText = `
  position: fixed;
  top: 10px;
  left: 300px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px;
  border-radius: 15px;
  font-family: Arial, sans-serif;
  font-size: 14px;
  font-weight: bold;
  z-index: 9999;
  pointer-events: none;
`;
document.body.appendChild(timerDiv);

function updateTimerDisplay() {
    browser.storage.local.get('timeRemaining').then((result) => {
        const minutes = Math.floor(result.timeRemaining / 60);
        const secondes = result.timeRemaining % 60;
        timerDiv.textContent = `Remaining time ➜ ${minutes}:${secondes.toString().padStart(2, '0')}`;
        requestAnimationFrame(updateTimerDisplay);
    });
}

requestAnimationFrame(updateTimerDisplay);

// youtube video suggestions window and links group at the right bottom
let contentVisible = true;
function updateContentVisibility() {
    const featuredContent = document.querySelector('#featuredContent');
    if(featuredContent) {
        featuredContent.style.display = contentVisible ? 'block' : 'none';
    }

    const linkAtRightBottom = document.querySelector('#idLinks');
    if(linkAtRightBottom) {
        linkAtRightBottom.style.cssText = contentVisible ? 'display: flex; flex-direction: column; transform: scale(0.85);' : 'display: none;';
    }
}

browser.storage.local.get('contentVisible').then((result) => {
    contentVisible = result.contentVisible; //  !== false
    updateContentVisibility();
});

browser.runtime.onMessage.addListener((message) => {
    if(message.action === "toggleUselessContent") {
        contentVisible = message.visible;
        updateContentVisibility();
    }
});