document.addEventListener('DOMContentLoaded', function() {
    console.info("POPUP >> popup has been opened!");

    function formatTime(seconds) {
        const minutes = Math.floor((seconds % 3600) / 60);
        const secondsRemaining = seconds % 60;
        return(`${minutes.toString().padStart(2, '0')}:${secondsRemaining.toString().padStart(2, '0')}`);
    }

    function displayUpdate() {
        browser.storage.local.get(['timePlayedToday', 'timeRemaining']).then((result) => {
            // time since start of the game
            const timePlayedToday = result.timePlayedToday || 0;
            document.getElementById('time_since_start').textContent = formatTime(timePlayedToday);
            // remaining time
            const timeRemaining = result.timeRemaining || 0;
            document.getElementById('remaining_time').textContent = formatTime(timeRemaining);
        });
    }

    setInterval(displayUpdate, 1000);
    displayUpdate();

    document.getElementById('settings_button').addEventListener('click', () => {
        console.log("POPUP >> settings button has been clicked! opening settings...");
        browser.tabs.create({url: "../settings/settings.html"});
    });

    const toggleSwitchUselessContent = document.getElementById('toggleUselessContent');
    browser.storage.local.get('contentVisible').then((result) => {
        toggleSwitchUselessContent.checked = result.contentVisible !== false;
    });
    
    toggleSwitchUselessContent.addEventListener('change', (event) => {
        console.log("POPUP >> the state of useless elements button has been changed!");
        const isChecked = event.target.checked;
        console.log(`POPUP >> the visibility of useless elements is ${isChecked} now!`);
        browser.storage.local.set({ contentVisible: isChecked });
        browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
            browser.tabs.sendMessage(tabs[0].id, {
                action: "toggleUselessContent",
                visible: isChecked
            }).catch((error) => {
                console.info("POPUP >> error for hide useless element (content.js isn't active ?)");
                console.info("POPUP >> " + error);
            });
        });
    });
});