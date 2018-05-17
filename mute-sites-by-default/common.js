"use strict";

function modifyWhitelist(site, muted) {
	return getWhitelist().then(whitelist => {
		var whitelisted = isWhitelisted(whitelist, site);

		// add site to whitelist if user changed it to unmuted
		if (!muted && !whitelisted) {
			whitelist.push(site);
		}

		// remove site from whitelist if user changed it to muted
		if (muted && whitelisted) {
			whitelist.splice(whitelist.indexOf(site), 1);
		}

		return setWhitelist(whitelist);
	});
}

function updateTab(tab) {
	return getWhitelist().then(whitelist => {
		var whitelisted = isWhitelisted(whitelist, urlToHostname(tab.url));
		return modifyTab(tab.id, !whitelisted);
	});
}

function updateAllTabs() {
	return Promise.all([getWhitelist(), getTabs()]).then(result => {
		var whitelist = result[0];
		var tabs = result[1];
		var updates = [];

		// unmute sites on whitelist and mute sites not on whitelist
		for (let tab of tabs) {
			let whitelisted = isWhitelisted(whitelist, urlToHostname(tab.url));
			updates.push(modifyTab(tab.id, !whitelisted));
		}

		return Promise.all(updates);
	});
}

function getOptions() {
	return browser.storage.local.get("options").then(optionsObject => {
		return optionsObject.options;
	});
}

function setOptions(options) {
	return browser.storage.local.set({"options": options});
}

function getWhitelist() {
	return browser.storage.local.get("whitelist").then(whitelistObject => {
		return whitelistObject.whitelist;
	});
}

function setWhitelist(whitelist) {
	return browser.storage.local.set({"whitelist": whitelist});
}

function isWhitelisted(whitelist, url) {
	for (let whitelistedUrl of whitelist) {
		// escape ignored regular expression symbols
		whitelistedUrl = whitelistedUrl.replace(/[\-\[\]\/\{\}\(\)\+\?\.\\\^\$\|]/g, "\\$&");

		// replace wildcard character "*" with regular expression
		whitelistedUrl = whitelistedUrl.split("*").join(".*")

		if (new RegExp("^" + whitelistedUrl + "$").test(url)) {
			return true;
		}
	}
	return false;
}

function getTabs() {
	return browser.tabs.query({});
}

function modifyTab(tabId, muted) {
	return browser.tabs.update(tabId, {muted: muted});
}

function urlToHostname(url) {
	return new URL(url).hostname;
}
