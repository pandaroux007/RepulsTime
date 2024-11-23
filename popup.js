document.addEventListener('DOMContentLoaded', function() {
    function formatTime(seconds) {
        const minutes = Math.floor((seconds % 3600) / 60);
        const secondsRemaining = seconds % 60;
        return(`${minutes.toString().padStart(2, '0')}:${secondsRemaining.toString().padStart(2, '0')}`);
    }

    function displayUpdate() {
        browser.storage.local.get('timePlayedToday').then((result) => {
            // time since start of the game
            const timePlayedToday = result.timePlayedToday || 0;
            document.getElementById('time_since_start').textContent = formatTime(timePlayedToday);
            // remaining time
            const timeRemaining = browser.storage.local.get('timeRemaining')
            document.getElementById('remaining_time').textContent = timeRemaining;
        });
    }

    setInterval(displayUpdate, 1000);
    displayUpdate();

    const settingsLink = document.getElementById('settings_button');
    if(settingsLink) {
        settingsLink.addEventListener('click', () => {
            browser.tabs.create({url: "settings/settings.html"});
        });
    }
});