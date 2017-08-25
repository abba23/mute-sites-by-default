"use strict";

init();

function init() {
	// create empty whitelist if it does not exist
	getWhitelist().then(whitelist => {
		if (!whitelist) {
			return setWhitelist([]);
		}
	}).then(() => {
		updateMuted();
		browser.tabs.onCreated.addListener(onTabCreated);
		browser.tabs.onUpdated.addListener(onTabUpdated);
		browser.storage.onChanged.addListener(onStorageChanged);
	});
}

function onTabCreated(tab) {
	// set muted state for new tabs
	updateMuted();
}

function onTabUpdated(tabId, changeInfo, tab) {
	// update muted state when url changes
	if (changeInfo.url) {
		updateMuted();
	}

	// update whitelist when user changes muted state
	if (changeInfo.mutedInfo && changeInfo.mutedInfo.reason == "user") {
		modifyWhitelist(urlToHostname(tab.url), changeInfo.mutedInfo.muted);		
	}
}

function onStorageChanged(changes, area) {
	// update muted states when whitelist changes
	if ("whitelist" in changes) {
		updateMuted();
	}
}
