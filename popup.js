document.addEventListener('DOMContentLoaded', function() {
    function formatTime(seconds) {
        const minutes = Math.floor((seconds % 3600) / 60);
        const secondsRemaining = seconds % 60;
        return(`${minutes.toString().padStart(2, '0')}:${secondsRemaining.toString().padStart(2, '0')}`);
    }

    function displayUpdate() {
        browser.storage.local.get('timePlayedToday').then((result) => {
            const timePlayedToday = result.timePlayedToday || 0;
            document.getElementById('time_since_start').textContent = formatTime(timePlayedToday);
        });
    }

    setInterval(displayUpdate, 1000);
    displayUpdate();

    const settingsLink = document.getElementById('settings_button');
    if (settingsLink) {
        settingsLink.addEventListener('click', () => {
            browser.tabs.create({url: "settings/settings.html"});
        });
    }
});