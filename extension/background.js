let thirdPartyDomains = {};
let localStorageData = {};
let canvasFingerprinting = {};
let hijackingAttempts = {};

function extractDomain(url) {
    let hostname;
    if (url.indexOf("://") > -1) {
        hostname = url.split('/')[2];
    } else {
        hostname = url.split('/')[0];
    }
    hostname = hostname.split(':')[0];
    hostname = hostname.split('?')[0];

    return hostname;
}

browser.webRequest.onBeforeRequest.addListener(
    function(details) {
        if (details.tabId < 0) return;

        browser.tabs.get(details.tabId).then(tab => {
            let tabUrl = tab.url;
            let requestUrl = details.url;

            let tabDomain = extractDomain(tabUrl);
            let requestDomain = extractDomain(requestUrl);

            if (tabDomain !== requestDomain) {
                if (!thirdPartyDomains[tab.id]) {
                    thirdPartyDomains[tab.id] = new Set();
                }
                thirdPartyDomains[tab.id].add(requestDomain);
            }
        }).catch(error => {
            console.error('Erro ao obter a aba:', error);
        });
    },
    { urls: ["<all_urls>"] },
    []
);

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.command === 'localStorageData') {
        let tabId = sender.tab.id;
        localStorageData[tabId] = message.data;
    } else if (message.command === 'getLocalStorageData') {
        let tabId = message.tabId;
        let data = localStorageData[tabId] ? localStorageData[tabId] : [];
        sendResponse({ data: data });
    } else if (message.command === 'getThirdPartyDomains') {
        let tabId = message.tabId;
        let domains = thirdPartyDomains[tabId] ? Array.from(thirdPartyDomains[tabId]) : [];
        sendResponse({ domains: domains });
    } else if (message.command === 'canvasFingerprintDetected') {
        let tabId = sender.tab.id;
        canvasFingerprinting[tabId] = true;
    } else if (message.command === 'getCanvasFingerprinting') {
        let tabId = message.tabId;
        let detected = canvasFingerprinting[tabId] || false;
        sendResponse({ detected: detected });
    } else if (message.command === 'getHijackingAttempts') {
        let tabId = message.tabId;
        let detected = hijackingAttempts[tabId] || false;
        sendResponse({ detected: detected });
    }
});

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'loading') {
        if (thirdPartyDomains[tabId]) {
            delete thirdPartyDomains[tabId];
        }
        if (localStorageData[tabId]) {
            delete localStorageData[tabId];
        }
        if (canvasFingerprinting[tabId]) {
            delete canvasFingerprinting[tabId];
        }
        if (hijackingAttempts[tabId]) {
            delete hijackingAttempts[tabId];
        }
    }
});

browser.tabs.onRemoved.addListener((tabId, removeInfo) => {
    if (thirdPartyDomains[tabId]) {
        delete thirdPartyDomains[tabId];
    }
    if (localStorageData[tabId]) {
        delete localStorageData[tabId];
    }
    if (canvasFingerprinting[tabId]) {
        delete canvasFingerprinting[tabId];
    }
    if (hijackingAttempts[tabId]) {
        delete hijackingAttempts[tabId];
    }
});