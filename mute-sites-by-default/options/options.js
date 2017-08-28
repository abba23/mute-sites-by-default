"use strict";

init();

function init() {
	var heading = document.getElementById("whitelist-heading");
	var addInput = document.getElementById("whitelist-add-input");
	var addButton = document.getElementById("whitelist-add-button");
	var websiteHeader = document.getElementById("whitelist-table-website-header");
	var removeHeader = document.getElementById("whitelist-table-remove-header");

	// set localized strings
	heading.appendChild(document.createTextNode(browser.i18n.getMessage("whitelistHeading")));
	addInput.placeholder = browser.i18n.getMessage("whitelistAddInput", "www.youtube.com");
	addButton.appendChild(document.createTextNode(browser.i18n.getMessage("whitelistAddButton")));
	websiteHeader.appendChild(document.createTextNode(browser.i18n.getMessage("whitelistTableWebsiteHeader")));
	removeHeader.appendChild(document.createTextNode(browser.i18n.getMessage("whitelistTableRemoveHeader")));

	// initialize whitelist table
	updateTable();

	// add whitelist entry on add button click or enter key press
	addButton.addEventListener("click", () => {onAdd();});
	addInput.addEventListener("keypress", (event) => {
		if (event.which == 13) {
			onAdd();
		}
	});

	browser.storage.onChanged.addListener(onStorageChanged);
}

function updateTable() {
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
			removeButton.onclick = () => {onRemove(site);};

			var removeCell = row.insertCell(1);
			removeCell.style.textAlign = "center";
			removeCell.appendChild(removeButton);
		}

		// replace old table with new table
		var oldRows = table.getElementsByTagName("tbody")[0];
		table.replaceChild(rows, oldRows);
	});
}

function onAdd() {
	var input = document.getElementById("whitelist-add-input");
	var site = input.value;
	input.value = "";

	modifyWhitelist(site, false).then(() => {
		updateTable();
	});
}

function onRemove(site) {
	modifyWhitelist(site, true).then(() => {
		updateTable();
	});
}

function onStorageChanged(changes, area) {
	// update table when whitelist changes
	if ("whitelist" in changes) {
		updateTable();
	}
}
