// ***************************************************************
//                          displaying management of useless elements
//                          (youtube video suggestions window and links group at the right bottom)
// ***************************************************************
let contentVisible = true;
const featuredContent = document.querySelector("#featuredContent");
const linkAtRightBottom = document.querySelector("#idLinks");

function updateContentVisibility() {
    if(featuredContent) featuredContent.style.display = contentVisible ? "block" : "none";
    if(linkAtRightBottom) {
        if(contentVisible) {
            linkAtRightBottom.style.display = "flex";
            linkAtRightBottom.style.flexDirection = "column";
            linkAtRightBottom.style.transform = "scale(0.85)";
        }
        else linkAtRightBottom.style.display = "none";
    }
}

browser.runtime.onMessage.addListener((message) => {
    if(message.action === "toggleUselessContent") {
        contentVisible = message.visible;
        updateContentVisibility();
    }
});

browser.storage.local.get("contentVisible").then((result) => { // init
    contentVisible = result.contentVisible !== false;
    updateContentVisibility();
});

const observer = new MutationObserver(updateContentVisibility);
observer.observe(document.body, { childList: true, subtree: true });

// ***************************************************************
//                          timer displaying management
// ***************************************************************
const style = document.createElement("style");
style.textContent = `
@keyframes blink {
    0% {background-color: rgba(0, 0, 0, 0.7)}
    50% {background-color: rgba(255, 0, 0, 0.7)}
    100% {background-color: rgba(0, 0, 0, 0.7)}
}

.blink {animation: blink 1s infinite}
`;
document.head.appendChild(style);

const timerDiv = document.createElement("div");
timerDiv.style.cssText = `
position: fixed;
top: 10px;
left: 300px;
background-color: rgba(0, 0, 0, 0.7);
color: #fff;
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
    browser.storage.local.get("timeRemaining").then((result) => {
        const minutes = Math.floor(result.timeRemaining / 60);
        const seconds = result.timeRemaining % 60;
        timerDiv.textContent = `Remaining time ➜ ${minutes}:${seconds.toString().padStart(2, "0")}`;
        
        result.timeRemaining <= 30 ? timerDiv.classList.add("blink") : timerDiv.classList.remove("blink");

        requestAnimationFrame(updateTimerDisplay);
    });
}

requestAnimationFrame(updateTimerDisplay);