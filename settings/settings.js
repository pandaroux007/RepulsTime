document.addEventListener('DOMContentLoaded', function() {
    console.info("SETTINGS >> settings have been opened!");

    const passwordSetup = document.getElementById('password_setup');
    // ------------------
    const mainSettings = document.getElementById('main_settings');
    const changeTimeLimitsInfo = document.getElementById('change_time_limits_info');
    // ------------------
    const changePasswordInfo = document.getElementById('change_password_info')
    const currentPasswordInput = document.getElementById('current_password');
    const newPasswordInput = document.getElementById('new_password');
    
    // ***************************************************************
    //                          utils functions
    // ***************************************************************
    async function hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    async function verifyPassword(inputPassword) {
        const inputHash = await hashPassword(inputPassword);
        const result = await browser.storage.local.get('passwordHash');
        return result.passwordHash === inputHash;
    }

    function showMainSettings(requirePasswordVerification = true) {
        if (requirePasswordVerification) {
            console.log("SETTINGS >> password verification is required (displaying modal...)");
            const passwordModal = document.createElement('div');
            passwordModal.innerHTML = `
                <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;">
                    <div style="background: white; padding: 20px; border-radius: 8px; text-align: center;">
                        <h2 class="title">Password check</h2>
                        <input type="password" id="verify_password" required>
                        <button class="classic_button" id="confirm_password">Confirm</button>
                    </div>
                </div>
            `;
            document.body.appendChild(passwordModal);

            const verifyPasswordInput = passwordModal.querySelector('#verify_password');
            const confirmPasswordBtn = passwordModal.querySelector('#confirm_password');

            confirmPasswordBtn.addEventListener('click', async () => {
                console.log("SETTINGS >> comfirm password button has been pressed on modal!");
                const passwordVerified = await verifyPassword(verifyPasswordInput.value);
                if (passwordVerified) {
                    passwordModal.remove();
                    passwordSetup.style.display = 'none';
                    mainSettings.style.display = 'block';
                    console.log("SETTINGS >> password is correct! displaying main settings...");
                    loadTimeLimits();
                } else console.log("SETTINGS >> password isn't correct! user maybe retry ?");
            });
        } else {
            console.log("SETTINGS >> displaying main settings...");
            passwordSetup.style.display = 'none';
            mainSettings.style.display = 'block';
            loadTimeLimits();
        }
    }

    function loadTimeLimits() {
        console.log("SETTINGS >> loading time limits (loadTimeLimits has been called!)");
        browser.storage.local.get('timeLimits').then(result => {
            displayLimitsTable(result.timeLimits);
        });
    }

    function displayLimitsTable(limits) {
        const tableBody = document.querySelector('#time_limits_table tbody');
        tableBody.innerHTML = '';
        for (const [jour, limite] of Object.entries(limits)) {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td>${jour.charAt(0).toUpperCase() + jour.slice(1)}</td>
                <td><input type="number" id="${jour}_limit" min="0" max="1440" value="${limite}"></td>
            `;
        }
        console.log("SETTINGS >> time limits have been displayed on table!");
    }

    async function saveLimits() {
        const newLimits = {};
        const inputs = document.querySelectorAll('#time_limits_table input');
        inputs.forEach(input => {
            const jour = input.id.split('_')[0];
            newLimits[jour] = parseInt(input.value);
        });

        browser.storage.local.set({timeLimits: newLimits}).then(() => {
            const txtInfo = "Time limits have been successfully saved!"
            console.log(`SETTINGS >> ${txtInfo}`);
            changeTimeLimitsInfo.style = 'display: block; color: #008000'
            changeTimeLimitsInfo.innerHTML = `<i>${txtInfo}</i>`;
        });
    }

    // ***************************************************************
    //                          code section
    // ***************************************************************
    browser.storage.local.get('passwordHash').then(result => {
        if (result.passwordHash) showMainSettings(true);
        else passwordSetup.style.display = 'block';
    });

    const saveLimitsBtn = document.getElementById('save_limits');
    saveLimitsBtn.addEventListener('click', saveLimits);
    
    const changePasswordBtn = document.getElementById('change_password');
    changePasswordBtn.addEventListener('click', async () => {
        console.log("SETTINGS >> change password button has been pressed!");
        const currentPassword = currentPasswordInput.value;
        const newPassword = newPasswordInput.value;

        if (currentPassword && newPassword) {
            try {
                const passwordVerified = await verifyPassword(currentPassword);
                if (passwordVerified) {
                    const newHash = await hashPassword(newPassword);
                    await browser.storage.local.set({passwordHash: newHash});
                    currentPasswordInput.value = '';
                    newPasswordInput.value = '';
                    changePasswordInfo.style = 'display: block; color: #008000';
                    changePasswordInfo.innerHTML = '<i>Password successfully changed. This tab will close in 3 seconds.</i>';
                    console.log("SETTINGS >> password changed!");
                    
                    setTimeout(() => {
                        browser.tabs.getCurrent().then(tab => {
                            browser.tabs.remove(tab.id);
                        });
                    }, 3000);
                } else {
                    changePasswordInfo.style = 'display: block; color: #E74C3C';
                    changePasswordInfo.innerHTML = '<i>Current password is incorrect, please retry</i>';
                    console.log("SETTINGS >> password isn't correct, user maybe retry!");
                }
            } catch (error) {
                console.info("SETTINGS >> error changing password: " + error);
                changePasswordInfo.style = 'display: block; color: #E74C3C';
                changePasswordInfo.innerHTML = '<i>An error occurred. Please try again.</i>';
            }
        } else {
            changePasswordInfo.style = 'display: block; color: #E74C3C';
            changePasswordInfo.innerHTML = '<i>Please complete all entries to change password</i>';
            console.log("SETTINGS >> change password button pressed but not all entries have been completed!");
        }
    });

    const setInitialPasswordBtn = document.getElementById('set_initial_password');
    setInitialPasswordBtn.addEventListener('click', async () => {
        const initialPasswordInput = document.getElementById('initial_password');
        const password = initialPasswordInput.value;
        if (password) {
            const hash = await hashPassword(password);
            browser.storage.local.set({passwordHash: hash}).then(() => {
                showMainSettings(false);
            });
        }
    });
});