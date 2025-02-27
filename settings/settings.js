// ***************************************************************
//                          debug section
// ***************************************************************
const DEBUG_PRINT = true; // set to false for disable debug print
function logData(msg) {
    if(DEBUG_PRINT) console.log("SETTINGS >>", msg);
}

const GREEN = "#008000";
const RED = "#e74c3c"

document.addEventListener("DOMContentLoaded", function() {
    if(DEBUG_PRINT) console.info("SETTINGS >> settings have been opened!");

    const passwordSetup = document.getElementById("password_setup");
    const mainSettings = document.getElementById("main_settings");
    const changeTimeLimitsInfo = document.getElementById("change_time_limits_info");
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

    function displayChangePasswordInfo(text, color) {
        const changePasswordInfo = document.getElementById("change_password_info")
        changePasswordInfo.style.display = "block"
        changePasswordInfo.style.color = color;
        changePasswordInfo.style.fontStyle = "italic";
        changePasswordInfo.innerText = text;
    }

    function createModal() {
        const passwordModal = document.createElement("div");
        passwordModal.classList.add("password_modal");

        const modalContent = document.createElement("div");
        modalContent.classList.add("modal_content");

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

        return({passwordModal, verifyPasswordInput, confirmPasswordBtn});
    }

    function showMainSettings(requirePasswordVerification = true) {
        if (requirePasswordVerification) {
            logData("password verification is required (displaying modal...)");
            const { passwordModal, verifyPasswordInput, confirmPasswordBtn } = createModal();

            confirmPasswordBtn.addEventListener("click", async () => {
                logData("confirm password button has been pressed on modal!");
                const passwordVerified = await verifyPassword(verifyPasswordInput.value);
                if (passwordVerified) {
                    passwordModal.remove();
                    passwordSetup.style.display = "none";
                    mainSettings.style.display = "block";
                    logData("password is correct! displaying main settings...");
                    loadTimeLimits();
                }
                else {
                    logData("password isn't correct! user maybe retry?");
                }
            });
        }
        else {
            logData("displaying main settings...");
            passwordSetup.style.display = "none";
            mainSettings.style.display = "block";
            loadTimeLimits();
        }
    }

    // ***************************************************************
    //                          time limits management functions
    // ***************************************************************
    function loadTimeLimits() {
        logData("loading time limits (loadTimeLimits has been called!)");
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
        logData("time limits have been displayed on table!");
    }

    async function saveLimits() {
        const newLimits = {};
        const inputs = document.querySelectorAll("#time_limits_table input");
        inputs.forEach(input => {
            const day = input.id.split("_")[0];
            newLimits[day] = parseInt(input.value);
        });

        browser.storage.local.set({timeLimits: newLimits}).then(() => {
            changeTimeLimitsInfo.style.display = "block";
            changeTimeLimitsInfo.style.color = GREEN;
            changeTimeLimitsInfo.innerText = "Time limits have been successfully saved!";
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
        logData("change password button has been pressed!");
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
                    displayChangePasswordInfo("Password successfully changed. This tab will close in 3 seconds.", GREEN);
                    logData("password changed!");
                    
                    setTimeout(() => {
                        browser.tabs.getCurrent().then(tab => {
                            browser.tabs.remove(tab.id);
                        });
                    }, 3000);
                }
                else {
                    displayChangePasswordInfo("Current password is incorrect, please retry", RED);
                    logData("password isn't correct, user maybe retry!");
                }
            }
            catch (error) {
                if(DEBUG_PRINT) console.info("error changing password: " + error);
                displayChangePasswordInfo("An error occurred. Please try again.", RED);
            }
        }
        else {
            displayChangePasswordInfo("Please complete all entries to change password", RED);
            logData("change password button pressed but not all entries have been completed!");
        }
    });

    const setInitialPasswordBtn = document.getElementById("set_initial_password");
    setInitialPasswordBtn.addEventListener("click", async () => {
        const password = document.getElementById("initial_password").value;
        if (password) {
            const hash = await hashPassword(password);
            browser.storage.local.set({passwordHash: hash}).then(() => {
                showMainSettings(false);
            });
        }
    });
});