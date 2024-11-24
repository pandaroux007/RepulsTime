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
    sunday: 0
};

// ***************************************************************
//                          functions
// ***************************************************************
function handleURLChange(tab) {
    console.log("handleURLChange called with URL:", tab.url);
    if (isRootRepulsIo(tab.url)) {
        console.log("activeTab is repuls.io root page!");
        activeTab = tab.id;
        startTimer();
    } else {
        console.log("URL is not repuls.io");
        if (activeTab !== null) {
            console.log("stopping timer for previous repuls.io tab");
            stopTimer();
            activeTab = null;
        }
    }
}

function getDailyTimeLimit() {
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = daysOfWeek[new Date().getDay()]; // get the time limit for the current day
    if(timeLimits[currentDay]) return(timeLimits[currentDay])
    else {
        if(currentDay === ('wednesday' || 'saturday')) return(45);
        else if(currentDay === 'sunday') return(0);
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

// ----------------------------------------------- Timer
function startTimer() {
    if(!timerInterval) {
        console.log("startTimer called now!");
        timerInterval = setInterval(() => {
            timePlayedToday++;

            browser.storage.local.set({ timePlayedToday: timePlayedToday, lastDate: currentDate, timeRemaining: calculateRemainingTime()});
            
            if(isTimeLimitExceeded()) {
                console.log("time exceeded! stopTimer and closeRepulsIoTab will be called!");
                stopTimer();
                closeRepulsIoTab();
            }
        }, 1000);
    }
}

function stopTimer() {
    if(timerInterval) {
        console.log("stopTimer called now!");
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// ***************************************************************
//                          listeners and init
// ***************************************************************
// listener for tab changes & tab updates
browser.tabs.onActivated.addListener((activeInfo) => {
    browser.tabs.get(activeInfo.tabId).then((tab) => {
        handleURLChange(tab);
    });
});
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if(changeInfo.status === 'complete') {
        console.log("a new tab has been opened or updated!");
        handleURLChange(tab);
    }
});
//https://developer.mozilla.org/en/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onActivated
browser.tabs.onRemoved.addListener((tabId, removeInfo) => {
    if(activeTab === tabId) {
        console.log("repuls.io tab closed now!");
        stopTimer();
        activeTab = null;
    }
});

// init > retrieve saved play time and limits
browser.storage.local.get(['timePlayedToday', 'lastDate', 'timeLimits']).then((result) => {
    if(result.lastDate === currentDate) {
        timePlayedToday = result.timePlayedToday || 0;
        console.log("today is always the last day, the counter will don't set to 0!");
    } else { // new day
        timePlayedToday = 0;
        browser.storage.local.set({ timePlayedToday: 0, lastDate: currentDate });
        console.log("today is a new day! The counter will set to 0!");
    }
    
    if(!result.timeLimits) {
        console.log("timeLimits not found, use DEFAULT_TIME_LIMITS!");
        browser.storage.local.set({ timeLimits: DEFAULT_TIME_LIMITS });
        timeLimits = DEFAULT_TIME_LIMITS;
    } else {
        console.log("timeLimits founded, use it.");
        timeLimits = result.timeLimits;
    }
});

// listerner for blocking after time limit
browser.webRequest.onBeforeRequest.addListener(
    (details) => {
        if(isTimeLimitExceeded() && isRootRepulsIo(details.url)) {
            console.log("here is repuls.io tab but time limit is exceeded! redirecting to the \"blocked\" page!");
            browser.tabs.update(details.tabId, {url: browser.runtime.getURL("blocked/blocked.html")});
            return {cancel: true};
        }
    },
    {urls: [`*://${LINK_GAME}`]},
    ["blocking"]
);