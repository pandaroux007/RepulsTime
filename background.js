// ***************************************************************
//                          variables
// ***************************************************************
let timePlayedToday = 0;
let timerInterval = null;
let activeTab = null;
let currentDate = new Date().toDateString();
let timeLimits = {};

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
    if(isRootRepulsIo(tab.url)) {
        if(activeTab !== tab.id) {
            activeTab = tab.id;
            startTimer();
        }
    } else {
        if(activeTab === tab.id) {
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
        if(currentDay === ('sunday' || 'wednesday' || 'saturday')) return(45);
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
    return(url === "https://repuls.io/" || url === "http://repuls.io/");
}

function closeRepulsIoTab() {
    browser.tabs.query({url: "*://repuls.io/"}).then((tabs) => {
        tabs.forEach((tab) => {
            browser.tabs.remove(tab.id);
        });
        browser.tabs.create({ url: "blocked/blocked.html" });
    });
}

// ----------------------------------------------- Timer
function startTimer() {
    if(!timerInterval) {
        timerInterval = setInterval(() => {
            timePlayedToday++;

            browser.storage.local.set({ timePlayedToday: timePlayedToday, lastDate: currentDate });
            
            if(timePlayedToday >= getDailyTimeLimit() * 60) {
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
//                          program
// ***************************************************************
// listener for tab changes & tab updates
browser.tabs.onActivated.addListener((activeInfo) => {
    browser.tabs.get(activeInfo.tabId).then(handleURLChange);
});
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if(changeInfo.status === 'complete') handleURLChange(tab);
});
browser.tabs.onRemoved.addListener((tabId, removeInfo) => {
    if(activeTab === tabId) {
        stopTimer();
        activeTab = null;
    }
});

// init > retrieve saved play time and limits
browser.storage.local.get(['timePlayedToday', 'lastDate', 'timeLimits']).then((result) => {
    if(result.lastDate === currentDate) {
        timePlayedToday = result.timePlayedToday || 0;
    } else { // new day
        timePlayedToday = 0;
        browser.storage.local.set({ timePlayedToday: 0, lastDate: currentDate });
    }
    
    if(!result.timeLimits) {
        browser.storage.local.set({ timeLimits: DEFAULT_TIME_LIMITS });
        timeLimits = DEFAULT_TIME_LIMITS;
    } else {
        timeLimits = result.timeLimits;
    }
});

// listerner for blocking after time limit
browser.webRequest.onBeforeRequest.addListener(
    (details) => {
        if(isTimeLimitExceeded() && isRootRepulsIo(details.url)) {
            return {redirectUrl: browser.runtime.getURL("blocked.html")};
        }
    },
    { urls: ["*://repuls.io/"] },
    ["blocking"]
);