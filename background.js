// ce fichier est une copie modifiée de l'extension d'origine, dédiée aux tests
// les commentaires ne sont pas à jour par rapport aux code!

// ***************************************************************
//                          debug section
// ***************************************************************
const DEBUG_PRINT = true; // set to false for disable debug print

if(DEBUG_PRINT)
{
    console.info("the extension is ready (`background.js` is launched!)");
    console.info("debug mode is ON!");
}

function logData(msg) {
    if(DEBUG_PRINT) console.log("BACKGROUND >>", msg);
}

// ***************************************************************
//                          variables
// ***************************************************************
let timePlayedToday = 0;
let timerInterval = null;
let activeTab = null;
let currentDate = new Date().toDateString();
let timeLimits = {};

const LINK_GAME = "repuls.io/"
const DEFAULT_TIME_LIMITS = {
    monday: 30,
    tuesday: 30,
    wednesday: 45,
    thursday: 30,
    friday: 45,
    saturday: 45,
    sunday: 30
};
const DEFAULT_STATE_DISPLAYING_USELESS_ELEMENTS = true;

// ***************************************************************
//                          functions
// ***************************************************************
function handleURLChange(tab) {
    logData("handleURLChange called with URL:", tab.url);
    if (isRootRepulsIo(tab.url)) {
        logData("activeTab is repuls.io root page!");
        activeTab = tab.id;
        startTimer();
    }
    else {
        logData("URL is not repuls.io");
        if (activeTab !== null) {
            logData("stopping timer for previous repuls.io tab");
            stopTimer();
            activeTab = null;
        }
    }
}

function getDailyTimeLimit() {
    const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const currentDay = daysOfWeek[new Date().getDay()]; // get the time limit for the current day
    if(timeLimits[currentDay]) return(timeLimits[currentDay])
    else {
        if(currentDay === ("wednesday" || "saturday")) return(45);
        else if(currentDay === "sunday") return(0);
        else return(30);
    }
}

function calculateRemainingTime() {
    const timeLimitInSeconds = getDailyTimeLimit() * 60; //convert to seconds
    return(Math.max(0, timeLimitInSeconds - timePlayedToday));
}

function isTimeLimitExceeded() {
    return(calculateRemainingTime() <= 0);
}

function isRootRepulsIo(url) {
    return(url === `https://${LINK_GAME}` || url === `http://${LINK_GAME}`);
}

function closeRepulsIoTab() {
    browser.tabs.query({url: `*://${LINK_GAME}`}).then((tabs) => {
        tabs.forEach((tab) => {
            browser.tabs.remove(tab.id);
        });
        browser.tabs.create({ url: "blocked/blocked.html" });
    });
}

// ***************************************************************
//                          timer functions
// ***************************************************************
function startTimer() {
    if(!timerInterval) {
        logData("startTimer called now!");
        timerInterval = setInterval(() => {
            timePlayedToday++;

            browser.storage.local.set({ timeRemaining: calculateRemainingTime(), lastDate: currentDate });
            
            if(isTimeLimitExceeded()) {
                logData("time exceeded! stopTimer and closeRepulsIoTab will be called!");
                stopTimer();
                closeRepulsIoTab();
            }
        }, 1000);
    }
}

function stopTimer() {
    if(timerInterval) {
        logData("stopTimer called now!");
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// ***************************************************************
//                          listeners and init
// ***************************************************************
// https://developer.mozilla.org/en/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onActivated
// listener for tab changes & tab updates
browser.tabs.onActivated.addListener((activeInfo) => {
    browser.tabs.get(activeInfo.tabId).then((tab) => {
        handleURLChange(tab);
    });
});
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if(changeInfo.status === "complete") {
        logData("a new tab has been opened or updated!");
        handleURLChange(tab);
    }
});
browser.tabs.onRemoved.addListener((tabId, removeInfo) => {
    if(activeTab === tabId) {
        logData("repuls.io tab closed now!");
        stopTimer();
        activeTab = null;
    }
});

// init > retrieve saved play time and limits
browser.storage.local.get(["contentVisible", "lastDate", "timeLimits"]).then((result) => {
    if(result.lastDate === currentDate) {
        timePlayedToday = getDailyTimeLimit() * 60 - result.timeRemaining || 0;
        logData("today is always the last day, the counter will don't set to 0!");
    } else { // new day
        timePlayedToday = 0;
        browser.storage.local.set({ lastDate: currentDate });
        logData("today is a new day! The counter will set to 0!");
    }
    
    if(!result.timeLimits) {
        logData("timeLimits not found, use the default time limits!");
        browser.storage.local.set({ timeLimits: DEFAULT_TIME_LIMITS });
        timeLimits = DEFAULT_TIME_LIMITS;
    } else {
        logData("timeLimits founded, use it.");
        timeLimits = result.timeLimits;
    }

    if (result.contentVisible === undefined) {
        browser.storage.local.set({ contentVisible: DEFAULT_STATE_DISPLAYING_USELESS_ELEMENTS });
    }
});

// listerner for blocking after time limit
browser.webRequest.onBeforeRequest.addListener(
    (details) => {
        if(isTimeLimitExceeded() && isRootRepulsIo(details.url)) {
            logData("here is repuls.io tab but time limit is exceeded! redirecting to the \"blocked\" page!");
            browser.tabs.update(details.tabId, {url: browser.runtime.getURL("blocked/blocked.html")});
            return {cancel: true};
        }
    },
    {urls: [`*://${LINK_GAME}`]},
    ["blocking"]
);