//ONLY EDIT THIS FILE IN THE extension_source/ DIRECTORY. Any changes done outside of that directory will be overridden by gulp!
var cs = {
    vars: {},
    func: {},
    msg: {
        toBackground: null,
        fromBackground: null
    },
    init: function () {
        cs.func.setEventListeners();
        cs.func.setMessageListeners();
    }
}


cs.func.setupAndDispatchEvent = function (eventName, eventDataObject) {
    var eventData =  {
        "detail": (eventDataObject !== null && typeof eventDataObject === 'object') ? JSON.stringify(eventDataObject) : eventDataObject
    };
    

    var event = new CustomEvent(eventName, eventData);

    // console.log("cs event setup and fired: " + eventName);
    // console.log(eventData);
    document.dispatchEvent(event);
};



cs.func.setEventListeners = function () {
    //Document Event Listeners
    document.addEventListener("waveResults", function (message) {
        cs.func.sendToBackground("waveResults", message.detail.data);
    });

    document.addEventListener("getExtensionUrl", function() {
        var extensionUrl = chrome.extension.getURL("");
        cs.func.setupAndDispatchEvent("setExtensionUrl", extensionUrl);
        cs.func.sendToBackground("setExtensionUrl", extensionUrl);
    });
    
    document.addEventListener("buildHeadings", function (message) {
        cs.func.sendToBackground("buildHeadings", message.detail.data);
    });

    document.addEventListener("moreInfo", function (message) {
        cs.func.sendToBackground("moreInfo", message.detail.data);
    });
    document.addEventListener("iconList", function (message) {
        cs.func.sendToBackground("iconList", message.detail.data);
    });
    document.addEventListener("contrastDetails", function (message) {
        cs.func.sendToBackground("contrastDetails", message.detail.data);
    });

    //Window Event Listeners
    window.addEventListener("beforeunload", function (e) {
        cs.func.sendToBackground("manualRefresh", {});
        return null;
    });
    window.addEventListener("load", function (e) {
        cs.func.sendToBackground("manualRefresh", {});
    });
    
}

cs.func.setMessageListeners = function () {
    chrome.runtime.onConnect.addListener(function (port) {
        cs.msg.fromBackground = port;
        cs.msg.fromBackground.onMessage.addListener(function (message, sender) {
            // console.log("action Called: " + message.action + ", name: " + message.name);
            if (message.name == "backgroundToCs") {
                  cs.func.setupAndDispatchEvent(message.action, message.data);
            }
        });
    });
}

cs.func.sendToBackground = function (action, data) {
    // console.log("CS sendToBackground: Action - " + action + ", Data: " + JSON.stringify(data));
    if (cs.msg.toBackground == null) {
        cs.msg.toBackground = chrome.runtime.connect({ name: "csToBackground" });
    }
    cs.msg.toBackground.postMessage({"action": action, "data": data });
}

cs.init();