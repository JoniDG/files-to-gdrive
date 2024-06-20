document.getElementById("chbx1").addEventListener("change", function () {
	if (this.checked) {
		document.getElementById("chbx2").checked = false;
		document.getElementById("chbx2").disabled = true;
	} else {
		document.getElementById("chbx2").disabled = false;
	}
});

document.getElementById("chbx2").addEventListener("change", function () {
	if (this.checked) {
		document.getElementById("chbx1").checked = false;
		document.getElementById("chbx1").disabled = true;
	} else {
		document.getElementById("chbx1").disabled = false;
	}
	checkMessageAndDisableChbx4();
});

document.getElementById("chbx3").addEventListener("change", function () {
	checkMessageAndDisableChbx4();
	if (this.checked) {
		document.getElementById("chbx4").checked = false;
		document.getElementById("chbx4").disabled = true;
	} else {
		document.getElementById("chbx4").disabled = false;
	}
});

document.getElementById("chbx4").addEventListener("change", function () {
	if (this.checked) {
		document.getElementById("chbx3").checked = false;
		document.getElementById("chbx3").disabled = true;
	} else {
		document.getElementById("chbx3").disabled = false;
	}
});

function checkMessageAndDisableChbx4() {
	let chbx2 = document.getElementById("chbx2");
	let chbx3 = document.getElementById("chbx3");
	let message = document.getElementById("message");
	let chbx4 = document.getElementById("chbx4");

	if (chbx2.checked && chbx3.checked) {
		message.style.display = "block";
		chbx4.checked = false;
		chbx4.disabled = true;
	} else {
		message.style.display = "none";
		chbx4.disabled = false;
	}
}
