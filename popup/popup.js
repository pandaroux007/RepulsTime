document.addEventListener("DOMContentLoaded", function() {
    // update time on the window
    function formatTime(paramSeconds) {
        const minutes = Math.floor(paramSeconds / 60);
        const secondes = paramSeconds % 60;
        return(`${minutes}:${secondes.toString().padStart(2, "0")}`);
    }

    function displayUpdate() {
        browser.storage.local.get("timeRemaining").then((result) => {
            const timeRemaining = result.timeRemaining || 0;
            document.getElementById("remaining_time").textContent = formatTime(timeRemaining);

            requestAnimationFrame(displayUpdate);
        });
    }

    requestAnimationFrame(displayUpdate);

    browser.storage.local.get("timeLimits").then((result) => {
        const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
        const currentDay = daysOfWeek[new Date().getDay()]; // get the time limit for the current day
        document.getElementById("time_to_play_today").textContent = result.timeLimits[currentDay] + " mn";
    });

    // settings button click event management
    document.getElementById("settings_button").addEventListener("click", () => {
        browser.tabs.create({url: "../settings/settings.html"});
    });

    // toggle switch useless elements on the root page of repuls.io
    const toggleSwitchUselessContent = document.getElementById("toggleUselessContent");
    browser.storage.local.get("contentVisible").then((result) => {
        toggleSwitchUselessContent.checked = result.contentVisible !== false;
    });
    
    toggleSwitchUselessContent.addEventListener("change", (event) => {
        const isChecked = event.target.checked;
        browser.storage.local.set({ contentVisible: isChecked });

        browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
            browser.tabs.sendMessage(tabs[0].id, {
                action: "toggleUselessContent",
                visible: isChecked
            })
        });
    });
});