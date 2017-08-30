"use strict";

init();

function init() {
	var optionsHeading = document.getElementById("options-heading");
	var optionsChangeWhitelistCheckbox = document.getElementById("options-change-whitelist-checkbox");
	var optionsChangeWhitelistLabel = document.getElementById("options-change-whitelist-label");
	var whitelistHeading = document.getElementById("whitelist-heading");
	var whitelistAddInput = document.getElementById("whitelist-add-input");
	var whitelistAddButton = document.getElementById("whitelist-add-button");
	var whitelistTableWebsiteHeader = document.getElementById("whitelist-table-website-header");
	var whitelistTableRemoveHeader = document.getElementById("whitelist-table-remove-header");

	// set localized strings
	optionsHeading.appendChild(document.createTextNode(browser.i18n.getMessage("optionsHeading")));
	optionsChangeWhitelistLabel.appendChild(document.createTextNode(browser.i18n.getMessage("optionsChangeWhitelistLabel")));
	whitelistHeading.appendChild(document.createTextNode(browser.i18n.getMessage("whitelistHeading")));
	whitelistAddInput.placeholder = browser.i18n.getMessage("whitelistAddInput", "www.youtube.com");
	whitelistAddButton.appendChild(document.createTextNode(browser.i18n.getMessage("whitelistAddButton")));
	whitelistTableWebsiteHeader.appendChild(document.createTextNode(browser.i18n.getMessage("whitelistTableWebsiteHeader")));
	whitelistTableRemoveHeader.appendChild(document.createTextNode(browser.i18n.getMessage("whitelistTableRemoveHeader")));

	// initialize options
	getOptions().then((options) => {
		optionsChangeWhitelistCheckbox.checked = options.changeWhitelist;
	});
	optionsChangeWhitelistCheckbox.addEventListener("change", () => {onOptionsChanged();});

	// initialize whitelist
	updateWhitelistTable();
	whitelistAddButton.addEventListener("click", () => {onWhitelistAdd();});
	whitelistAddInput.addEventListener("keypress", (event) => {
		if (event.which == 13) {
			onWhitelistAdd();
		}
	});
	browser.storage.onChanged.addListener(onStorageChanged);
}

function updateWhitelistTable() {
	// create new table from current whitelist
	var table = document.getElementById("whitelist-table");
	var rows = document.createElement("tbody");

	// create row for every site on whitelist
	return getWhitelist().then(whitelist => {
		whitelist.sort();
		for (let site of whitelist) {
			var row = rows.insertRow(-1);

			var siteText = document.createElement("input");
			siteText.value = site;
			siteText.type = "text";
			siteText.className = "form-control";
			siteText.readOnly = "readonly";
			row.insertCell(0).appendChild(siteText);

			var removeButton = document.createElement("input");
			removeButton.type = "button";
			removeButton.className = "btn btn-danger";
			removeButton.value = "X";
			removeButton.onclick = () => {onWhitelistRemove(site);};

			var removeCell = row.insertCell(1);
			removeCell.style.textAlign = "center";
			removeCell.appendChild(removeButton);
		}

		// replace old table with new table
		var oldRows = table.getElementsByTagName("tbody")[0];
		table.replaceChild(rows, oldRows);
	});
}

function onOptionsChanged() {
	var optionsChangeWhitelistCheckbox = document.getElementById("options-change-whitelist-checkbox");
	var options = {
		"changeWhitelist": optionsChangeWhitelistCheckbox.checked
	};
	return setOptions(options);
}

function onWhitelistAdd() {
	var input = document.getElementById("whitelist-add-input");
	var site = input.value;
	input.value = "";

	return modifyWhitelist(site, false).then(() => {
		return updateWhitelistTable();
	});
}

function onWhitelistRemove(site) {
	return modifyWhitelist(site, true).then(() => {
		return updateWhitelistTable();
	});
}

function onStorageChanged(changes, area) {
	// update table when whitelist changes
	if ("whitelist" in changes) {
		return updateWhitelistTable();
	}
}
