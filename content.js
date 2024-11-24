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
        timerDiv.textContent = `Temps restant: ${minutes}:${secondes.toString().padStart(2, '0')}`;
    });
}

setInterval(updateTimerDisplay, 1000);

// yt video content
let featuredContentVisible = true;
browser.runtime.onMessage.addListener((message) => {
    if(message.action === "toggleFeaturedContent") {
        const featuredContent = document.querySelector('.featuredContent');
        if(featuredContent) {
            featuredContentVisible = message.visible;
            featuredContent.style.display = featuredContentVisible ? 'block' : 'none';
        }
    }
});