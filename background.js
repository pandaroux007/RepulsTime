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
    if (isRootRepulsIo(tab.url)) {
        activeTab = tab.id;
        startTimer();
    }
    else {
        if (activeTab !== null) {
            stopTimer();
            activeTab = null;
        }
    }
}

function handleFocusChange(windowId) {
    if (windowId === browser.windows.WINDOW_ID_NONE) {
        stopTimer();
    }
    else {
        browser.windows.get(windowId, { populate: true }).then((window) => {
            const activeTab = window.tabs.find(tab => tab.active);
            if(activeTab) {
                handleURLChange(activeTab);
            }
        });
    }
}

function getDailyTimeLimit() {
    const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const currentDay = daysOfWeek[new Date().getDay()];
    return timeLimits[currentDay] || DEFAULT_TIME_LIMITS[currentDay];
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
        timerInterval = setInterval(() => {
            timePlayedToday++;

            browser.storage.local.set({ timeRemaining: calculateRemainingTime(), lastDate: currentDate });
            
            if(isTimeLimitExceeded()) {
                stopTimer();
                closeRepulsIoTab();
            }
        }, 1000);
    }
}

function stopTimer() {
    if(timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// ***************************************************************
//                          listeners and init
// ***************************************************************
// init > retrieve saved play time and limits
browser.storage.local.get(["contentVisible", "lastDate", "timeLimits", "timeRemaining"]).then((result) => {
    if(result.lastDate === currentDate) {
        timePlayedToday = getDailyTimeLimit() * 60 - result.timeRemaining || 0;
    }
    else { // new day
        timePlayedToday = 0;
        browser.storage.local.set({ lastDate: currentDate });
    }
    
    if(!result.timeLimits) {
        browser.storage.local.set({ timeLimits: DEFAULT_TIME_LIMITS });
        timeLimits = DEFAULT_TIME_LIMITS;
    }
    else {
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
            browser.tabs.update(details.tabId, {url: browser.runtime.getURL("blocked/blocked.html")});
            return {cancel: true};
        }
    },
    {urls: [`*://${LINK_GAME}`]},
    ["blocking"]
);

// https://developer.mozilla.org/en/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onActivated
// listener for tab changes & tab updates
browser.tabs.onActivated.addListener((activeInfo) => {
    browser.tabs.get(activeInfo.tabId).then((tab) => {
        handleURLChange(tab);
    });
});
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if(changeInfo.status === "complete") {
        handleURLChange(tab);
    }
});
browser.tabs.onRemoved.addListener((tabId, removeInfo) => {
    if(activeTab === tabId) {
        stopTimer();
        activeTab = null;
    }
});

browser.windows.onFocusChanged.addListener(handleFocusChange);