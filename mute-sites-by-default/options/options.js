"use strict";

init();

function init() {
	// initialize whitelist table
	updateTable();

	// add whitelist entry on add button click
	var addButton = document.getElementById("add-button");
	addButton.addEventListener("click", () => {onAdd();});

	// add whitelist entry on enter key press
	var addInput = document.getElementById("add-input");
	addInput.addEventListener("keypress", (event) => {
		if (event.which == 13) {
			onAdd();
		}
	});

	browser.storage.onChanged.addListener(onStorageChanged);
}

function updateTable() {
	// create new table from current whitelist
	var table = document.getElementById("table");
	var rows = document.createElement("tbody");
	
	// create row for every site on whitelist
	return getWhitelist().then(whitelist => {
		whitelist.sort();
		for (let site of whitelist) {
			var row = rows.insertRow(-1);

			var siteText = document.createElement("input");
			siteText.value = site;
			siteText.type = "text";
			siteText.readOnly = "readonly";
			row.insertCell(0).appendChild(siteText);

			var removeButton = document.createElement("input");
			removeButton.value = "X";
			removeButton.type = "button";
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
	var input = document.getElementById("add-input");
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
