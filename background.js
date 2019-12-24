var config={debug:!1,extensionUrl:"",platform:"extension",browser:"chrome"},background={vars:{sidebarLoaded:[],activeTabs:[],debug:config.debug,currentTabId:0},func:{},msg:{scriptsConnection:null},init:function(){background.func.setBrowserActionListener(),background.func.setMessageListeners(),background.func.setInstallListener(),background.func.setTabListener(),background.func.setWindowChangeListener(),background.func.setKeyboardShortcut(),background.func.setupContextMenus()}};background.func.setInstallListener=function(){chrome.runtime.onInstalled.addListener(function(n){switch(n.reason){case"install":console.log("New User installed the extension.");break;case"update":console.log("User has updated their extension.");break;case"chrome_update":case"shared_module_update":default:console.log("Other install events within the browser")}})},background.func.setupForWave=function(n,e){-1==e.indexOf("chrome-devtools://")&&background.func.executeScripts(n,[{file:"contentscript.js"},{code:"var config = config;"},{file:"inject.js"}])},background.func.runWave=function(n,e){if(-1==background.vars.activeTabs.indexOf(n)){background.msg.scriptsConnection=null,background.vars.waveResults=null;var o=background.vars.sidebarLoaded.indexOf(n);o>-1&&background.vars.sidebarLoaded.splice(o,1),background.func.setupForWave(n,e),background.func.toggleBrowserActionState(n)}else background.func.sendToCs("refreshPage",{},n)},background.func.setMessageListeners=function(){chrome.runtime.onConnect.addListener(function(n){var e=n.sender.tab.id;n.onMessage.addListener(function(o,c){if("csToBackground"==n.name)switch(o.action){case"setExtensionUrl":case"waveResults":background.func.sendResultsToSidebarWhenReady(o.action,o.data,e);break;case"buildHeadings":case"moreInfo":background.func.sendToSidebar(o.action,o.data,e);break;case"iconList":background.func.sendResultsToSidebarWhenReady(o.action,o.data,e);break;case"manualRefresh":background.func.toggleBrowserActionState(e,{forceSet:"inactive"});break;case"tabOpen":background.func.toggleBrowserActionState(e,{tabChange:!0});break;case"tabNotOpen":break;case"contrastDetails":background.func.sendToSidebar(o.action,o.data,e)}if("sidebarToBackground"==n.name)switch(o.action){case"sidebarLoaded":background.vars.sidebarLoaded.push(e),background.func.sendToCs(o.action,o.data,e);break;default:background.func.sendToCs(o.action,o.data,e)}})})},background.func.setCurrentTabActive=function(n){background.vars.currentTabId=n,background.func.toggleBrowserActionState(n,{tabChange:!0})},background.func.setupContextMenus=function(){chrome.contextMenus.create({id:"run-wave",title:"WAVE this page"}),chrome.contextMenus.onClicked.addListener(function(n,e){if("run-wave"==n.menuItemId){var o=null!=e.url?e.url:"";background.func.runWave(e.id,o)}})},background.func.sendResultsToSidebarWhenReady=function(n,e,o){-1==background.vars.sidebarLoaded.indexOf(o)?(console.log("action: "+JSON.stringify(n)+" | data: "+JSON.stringify(e)+" | tab: "+o),console.log("sidebar not yet ready"),setTimeout(function(){background.func.sendResultsToSidebarWhenReady(n,e,o)},100)):background.func.sendToSidebar(n,e,o)},background.func.sendToSidebar=function(n,e,o){console.log("BG sendToSidebar: Action - "+n+", Data: "+e),void 0!==o?background.msg.scriptsConnection=chrome.tabs.connect(o,{name:"scriptsConnection"}):chrome.tabs.query({currentWindow:!0,active:!0},function(n){background.msg.scriptsConnection=chrome.tabs.connect(n[0].id,{name:"scriptsConnection"})}),background.msg.scriptsConnection.postMessage({name:"backgroundToSidebar",action:n,data:e,tabId:o})},background.func.sendToCs=function(n,e,o){void 0!==o?background.msg.scriptsConnection=chrome.tabs.connect(o,{name:"scriptsConnection"}):chrome.tabs.query({currentWindow:!0,active:!0},function(n){background.msg.scriptsConnection=chrome.tabs.connect(n[0].id,{name:"scriptsConnection"})}),background.msg.scriptsConnection.postMessage({name:"backgroundToCs",action:n,data:e})},background.func.setBrowserActionListener=function(){chrome.browserAction.onClicked.addListener(function(n){-1!==background.vars.activeTabs.indexOf(n.id)&&chrome.browserAction.disable(n.id);var e=null!=n.url?n.url:"";background.func.runWave(n.id,e)})},background.func.setTabListener=function(){chrome.tabs.onUpdated.addListener(function(n,e,o){}),chrome.tabs.onActivated.addListener(function(n){console.log("activated: tabInfo: "+JSON.stringify(n)),background.func.setCurrentTabActive(n.tabId)})},background.func.setWindowChangeListener=function(){chrome.windows.onFocusChanged.addListener(function(n){chrome.tabs.query({active:!0,currentWindow:!0},function(n){var e=n[0];void 0!==e&&background.func.setCurrentTabActive(e.id)})})},background.func.setKeyboardShortcut=function(){chrome.commands.onCommand.addListener(function(n){"toggle-extension"==n&&background.func.runWave(background.vars.currentTabId,"")})},background.func.toggleBrowserActionState=function(n,e){var o=background.vars.activeTabs.indexOf(n);void 0!==e?(void 0!==e.forceSet&&("inactive"==e.forceSet?(chrome.browserAction.setIcon({path:{16:"/img/wave16bk.png",32:"/img/wave32bk.png"}}),o>-1&&background.vars.activeTabs.splice(o,1)):"active"==e.forceSet&&(chrome.browserAction.setIcon({path:{16:"/img/wave16.png",32:"/img/wave32.png"}}),!o>-1&&background.vars.activeTabs.push(n))),void 0!==e.tabChange&&1==e.tabChange&&(o>-1?chrome.browserAction.setIcon({path:{16:"/img/wave16.png",32:"/img/wave32.png"}}):chrome.browserAction.setIcon({path:{16:"/img/wave16bk.png",32:"/img/wave32bk.png"}}))):o>-1?(chrome.browserAction.setIcon({path:{16:"/img/wave16bk.png",32:"/img/wave32bk.png"}}),background.vars.activeTabs.splice(o,1)):(chrome.browserAction.setIcon({path:{16:"/img/wave16.png",32:"/img/wave32.png"}}),background.vars.activeTabs.push(n))},background.func.executeScripts=function(n,e){function o(n,e,o){return function(){chrome.tabs.executeScript(n,e,o)}}for(var c=null,a=e.length-1;a>=0;--a)c=o(n,e[a],c);null!==c&&c()},background.init();