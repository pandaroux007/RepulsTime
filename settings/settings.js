const GREEN = "#008000";
const RED = "#e74c3c";

const passwordSetup = document.getElementById("password_setup");
const mainSettings = document.getElementById("main_settings");
const notification = document.getElementById("notification");

const setInitialPasswordBtn = document.getElementById("set_initial_password");
const initialPasswordInput = document.getElementById("initial_password");

const currentPasswordInput = document.getElementById("current_password");
const newPasswordInput = document.getElementById("new_password");
const changePasswordBtn = document.getElementById("change_password_btn");

function handleEnterKey(inputElement, callback) {
    inputElement.addEventListener("keypress", async (event) => {
        if (event.key === "Enter") await callback();
    });
}

function toggleVisibility(element, isVisible) {
    element.style.display = isVisible ? "block" : "none";
}

// ***************************************************************
//                          password functions
// ***************************************************************
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return(Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join(""));
}

async function verifyPassword(inputPassword) {
    const inputHash = await hashPassword(inputPassword);
    const result = await browser.storage.local.get("passwordHash");
    return(result.passwordHash === inputHash);
}

async function setInitialPassword() {
    const password = initialPasswordInput.value.trim();
    if (!password) {
        showNotify("Error to set password!", "Password cannot be empty.", true);
        return;
    }
    else {
        const hash = await hashPassword(password);
        await browser.storage.local.set({ passwordHash: hash });
        showMainSettings(false);
        showNotify("Your password is perfect!", "Welcome to RepulsTime's settings!", false);
    }
}

async function setNewPassword() {
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
                showNotify("Password successfully changed!", "This tab will close in 3 seconds.", false);
                
                setTimeout(() => {
                    browser.tabs.getCurrent().then(tab => {
                        browser.tabs.remove(tab.id);
                    });
                }, 3000);
            }
            else showNotify("Change password", "Current password is incorrect, please retry!", true);
        }
        catch (error) {
            showNotify("An error occurred", "Please try again.", true);
        }
    }
    else showNotify("Change password", "Please complete all entries to change password", true);
}

// ***************************************************************
//                          appearance functions
// ***************************************************************
let notificationTimeout;

function showNotify(title, text, isError) {
    if (notificationTimeout) {
        clearTimeout(notificationTimeout);
        notification.classList.remove("show");
    }

    notification.classList.add("show");
    document.getElementById("notif_title").textContent = title;
    const notifyText = document.getElementById("notif_info");
    notifyText.style.color = isError ? RED : GREEN;
    notifyText.innerText = text;

    notificationTimeout = setTimeout(() => {
        notification.classList.remove("show");
        notificationTimeout = null;
    }, 4000);
}

function showModal() {
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
        const { passwordModal, verifyPasswordInput, confirmPasswordBtn } = showModal();

        async function checkPassword() {
            const passwordVerified = await verifyPassword(verifyPasswordInput.value);
            if (passwordVerified) {
                showNotify("Your password is correct!", "Welcome to RepulsTime's settings!", false);
                passwordModal.remove();
                toggleVisibility(passwordSetup, false);
                toggleVisibility(mainSettings, true);
                loadTimeLimits();
            }
            else showNotify("Your password isn't correct!", "Please try again", true);
        }
        
        handleEnterKey(verifyPasswordInput, checkPassword);
        confirmPasswordBtn.addEventListener("click", async () => {
            await checkPassword();
        });
    }
    else {
        toggleVisibility(passwordSetup, false);
        toggleVisibility(mainSettings, true);
        loadTimeLimits();
    }
}

// ***************************************************************
//                          time limits management functions
// ***************************************************************
function loadTimeLimits() {
    browser.storage.local.get("timeLimits").then(result => {
        displayLimitsTable(result.timeLimits || {});
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
}

async function saveLimits() {
    const newLimits = {};
    const inputs = document.querySelectorAll("#time_limits_table input");
    inputs.forEach(input => {
        const day = input.id.split("_")[0];
        newLimits[day] = parseInt(input.value);
    });

    browser.storage.local.set({timeLimits: newLimits}).then(() => {
        showNotify("Time limits changed", "Time limits have been successfully saved!", false);
        browser.runtime.sendMessage({action: "timeLimitsUpdated"});
    });
}

document.addEventListener("DOMContentLoaded", function() {
    // ***************************************************************
    //                          init and events section
    // ***************************************************************
    browser.storage.local.get("passwordHash").then(result => {
        if (result.passwordHash) showMainSettings(true);
        else toggleVisibility(passwordSetup, true);
    });

    const saveLimitsBtn = document.getElementById("save_limits");
    saveLimitsBtn.addEventListener("click", saveLimits);

    notification.addEventListener("click", () => {
        if (notificationTimeout) {
            clearTimeout(notificationTimeout);
            notificationTimeout = null;
        }
        notification.classList.remove("show");
    });

    // ***************************************************************
    //                          initial password setup section
    // ***************************************************************
    setInitialPasswordBtn.addEventListener("click", async () => {
        setInitialPassword();
    });

    handleEnterKey(initialPasswordInput, setInitialPassword);
    
    // ***************************************************************
    //                          change password section
    // ***************************************************************

    changePasswordBtn.addEventListener("click", async () => {
        await setNewPassword();
    });

    handleEnterKey(newPasswordInput, setNewPassword);
    handleEnterKey(currentPasswordInput, setNewPassword);
});