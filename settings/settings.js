// ***************************************************************
//                          debug section
// ***************************************************************
const DEBUG_PRINT = true; // set to false for disable debug print
function logData(msg) {
    if(DEBUG_PRINT) console.log("SETTINGS >>", msg);
}

document.addEventListener("DOMContentLoaded", function() {
    if(DEBUG_PRINT) console.info("SETTINGS >> settings have been opened!");

    const passwordSetup = document.getElementById("password_setup");
    // ------------------
    const mainSettings = document.getElementById("main_settings");
    const changeTimeLimitsInfo = document.getElementById("change_time_limits_info");
    // ------------------
    const changePasswordInfo = document.getElementById("change_password_info")
    const currentPasswordInput = document.getElementById("current_password");
    const newPasswordInput = document.getElementById("new_password");
    
    // ***************************************************************
    //                          utils functions
    // ***************************************************************
    async function hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hash = await crypto.subtle.digest("SHA-256", data);
        return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
    }

    async function verifyPassword(inputPassword) {
        const inputHash = await hashPassword(inputPassword);
        const result = await browser.storage.local.get("passwordHash");
        return result.passwordHash === inputHash;
    }

    function showMainSettings(requirePasswordVerification = true) {
        if (requirePasswordVerification) {
            logData("SETTINGS >> password verification is required (displaying modal...)");
            const passwordModal = document.createElement("div");
            passwordModal.style.position = "fixed";
            passwordModal.style.top = "0";
            passwordModal.style.left = "0";
            passwordModal.style.width = "100%";
            passwordModal.style.height = "100%";
            passwordModal.style.background = "rgba(0,0,0,0.5)";
            passwordModal.style.display = "flex";
            passwordModal.style.justifyContent = "center";
            passwordModal.style.alignItems = "center";
            passwordModal.style.zIndex = "1000";

            const modalContent = document.createElement("div");
            modalContent.style.background = "white";
            modalContent.style.padding = "20px";
            modalContent.style.borderRadius = "8px";
            modalContent.style.textAlign = "center";

            const title = document.createElement("h2");
            title.className = "title";
            title.textContent = "Password check";

            const verifyPasswordInput = document.createElement("input");
            verifyPasswordInput.type = "password";
            verifyPasswordInput.id = "verify_password";
            verifyPasswordInput.required = true;

            const confirmPasswordBtn = document.createElement("button");
            confirmPasswordBtn.className = "classic_button";
            confirmPasswordBtn.id = "confirm_password";
            confirmPasswordBtn.textContent = "Confirm";

            modalContent.appendChild(title);
            modalContent.appendChild(verifyPasswordInput);
            modalContent.appendChild(confirmPasswordBtn);
            passwordModal.appendChild(modalContent);
            document.body.appendChild(passwordModal);
    
            confirmPasswordBtn.addEventListener("click", async () => {
                logData("SETTINGS >> comfirm password button has been pressed on modal!");
                const passwordVerified = await verifyPassword(verifyPasswordInput.value);
                if (passwordVerified) {
                    passwordModal.remove();
                    passwordSetup.style.display = "none";
                    mainSettings.style.display = "block";
                    logData("SETTINGS >> password is correct! displaying main settings...");
                    loadTimeLimits();
                } else logData("SETTINGS >> password isn't correct! user maybe retry ?");
            });
        } else {
            logData("SETTINGS >> displaying main settings...");
            passwordSetup.style.display = "none";
            mainSettings.style.display = "block";
            loadTimeLimits();
        }
    }

    // ***************************************************************
    //                          time limits management functions
    // ***************************************************************
    function loadTimeLimits() {
        logData("SETTINGS >> loading time limits (loadTimeLimits has been called!)");
        browser.storage.local.get("timeLimits").then(result => {
            displayLimitsTable(result.timeLimits);
        });
    }

    function displayLimitsTable(limits) {
        const tableBody = document.querySelector("#time_limits_table tbody");
        tableBody.innerHTML = "";
        for (const [day, limite] of Object.entries(limits)) {
            const row = document.createElement("tr");
            const dayCell = document.createElement("td");
            dayCell.textContent = day.charAt(0).toUpperCase() + day.slice(1);
    
            const limitCell = document.createElement("td");
            const inputLimit = document.createElement("input");
            inputLimit.type = "number";
            inputLimit.id = `${day}_limit`;
            inputLimit.min = 0;
            inputLimit.max = 1440;
            inputLimit.value = limite;
            limitCell.appendChild(inputLimit);
            row.appendChild(dayCell);
            row.appendChild(limitCell);
            tableBody.appendChild(row);
        }
        logData("SETTINGS >> time limits have been displayed on table!");
    }

    async function saveLimits() {
        const newLimits = {};
        const inputs = document.querySelectorAll("#time_limits_table input");
        inputs.forEach(input => {
            const day = input.id.split("_")[0];
            newLimits[day] = parseInt(input.value);
        });

        browser.storage.local.set({timeLimits: newLimits}).then(() => {
            const txtInfo = "Time limits have been successfully saved!"
            logData(`SETTINGS >> ${txtInfo}`);
            changeTimeLimitsInfo.style = "display: block; color: #008000"
            changeTimeLimitsInfo.innerHTML = `<i>${txtInfo}</i>`;
        });
    }

    // ***************************************************************
    //                          event section
    // ***************************************************************
    browser.storage.local.get("passwordHash").then(result => {
        if (result.passwordHash) showMainSettings(true);
        else passwordSetup.style.display = "block";
    });

    const saveLimitsBtn = document.getElementById("save_limits");
    saveLimitsBtn.addEventListener("click", saveLimits);
    
    const changePasswordBtn = document.getElementById("change_password");
    changePasswordBtn.addEventListener("click", async () => {
        logData("SETTINGS >> change password button has been pressed!");
        const currentPassword = currentPasswordInput.value;
        const newPassword = newPasswordInput.value;

        if (currentPassword && newPassword) {
            try {
                const passwordVerified = await verifyPassword(currentPassword);
                if (passwordVerified) {
                    const newHash = await hashPassword(newPassword);
                    await browser.storage.local.set({passwordHash: newHash});
                    currentPasswordInput.value = "";
                    newPasswordInput.value = "";
                    changePasswordInfo.style = "display: block; color: #008000";
                    changePasswordInfo.innerHTML = "<i>Password successfully changed. This tab will close in 3 seconds.</i>";
                    logData("SETTINGS >> password changed!");
                    
                    setTimeout(() => {
                        browser.tabs.getCurrent().then(tab => {
                            browser.tabs.remove(tab.id);
                        });
                    }, 3000);
                } else {
                    changePasswordInfo.style = "display: block; color: #E74C3C";
                    changePasswordInfo.innerHTML = "<i>Current password is incorrect, please retry</i>";
                    logData("SETTINGS >> password isn't correct, user maybe retry!");
                }
            } catch (error) {
                if(DEBUG_PRINT) console.info("SETTINGS >> error changing password: " + error);
                changePasswordInfo.style = "display: block; color: #E74C3C";
                changePasswordInfo.innerHTML = "<i>An error occurred. Please try again.</i>";
            }
        } else {
            changePasswordInfo.style = "display: block; color: #E74C3C";
            changePasswordInfo.innerHTML = "<i>Please complete all entries to change password</i>";
            logData("SETTINGS >> change password button pressed but not all entries have been completed!");
        }
    });

    const setInitialPasswordBtn = document.getElementById("set_initial_password");
    setInitialPasswordBtn.addEventListener("click", async () => {
        const initialPasswordInput = document.getElementById("initial_password");
        const password = initialPasswordInput.value;
        if (password) {
            const hash = await hashPassword(password);
            browser.storage.local.set({passwordHash: hash}).then(() => {
                showMainSettings(false);
            });
        }
    });
});