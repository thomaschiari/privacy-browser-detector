function getLocalStorageData() {
    let storageData = [];
    for (let i = 0; i < localStorage.length; i++) {
        let key = localStorage.key(i);
        let value = localStorage.getItem(key);
        storageData.push({ key: key, value: value });
    }
    return storageData;
}

browser.runtime.sendMessage({
    command: 'localStorageData',
    data: getLocalStorageData()
});

(function() {
    let canvasAccessed = false;

    function notifyCanvasAccess() {
        if (!canvasAccessed) {
            canvasAccessed = true;
            browser.runtime.sendMessage({ command: 'canvasFingerprintDetected' });
        }
    }

    const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;
    CanvasRenderingContext2D.prototype.getImageData = function() {
        notifyCanvasAccess();
        return originalGetImageData.apply(this, arguments);
    };

    const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
    HTMLCanvasElement.prototype.toDataURL = function() {
        notifyCanvasAccess();
        return originalToDataURL.apply(this, arguments);
    };

    const originalToBlob = HTMLCanvasElement.prototype.toBlob;
    HTMLCanvasElement.prototype.toBlob = function() {
        notifyCanvasAccess();
        return originalToBlob.apply(this, arguments);
    };
})();

(function() {
    let hijackingDetected = false;

    function notifyHijacking(url) {
        if (!hijackingDetected) {
            hijackingDetected = true;
            browser.runtime.sendMessage({ command: 'hijackingDetected', url: url });
        }
    }

    const originalAssign = window.location.assign;
    window.location.assign = function(url) {
        notifyHijacking(url);
        return originalAssign.apply(this, arguments);
    };

    const originalReplace = window.location.replace;
    window.location.replace = function(url) {
        notifyHijacking(url);
        return originalReplace.apply(this, arguments);
    };

    Object.defineProperty(window.location, 'href', {
        set: function(url) {
            notifyHijacking(url);
            return url;
        }
    });
})();