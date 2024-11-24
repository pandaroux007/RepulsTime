document.addEventListener('DOMContentLoaded', function() {
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

    /* document.getElementById('settings_button').addEventListener('click', () => {
        browser.tabs.create({url: "../settings/settings.html"});
    }); */

    document.getElementById('toggleFeaturedContent').addEventListener('change', (event) => {
        const isChecked = event.target.checked;
        browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
            browser.tabs.sendMessage(tabs[0].id, { action: "toggleFeaturedContent", visible: isChecked });
        });
    });
});