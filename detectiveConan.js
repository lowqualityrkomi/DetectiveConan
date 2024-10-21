class DetectiveConan {
	constructor(options) {
		const defaults = {
			enableUrl: true,
			enableOrigin: true,
			enableFormId: true,
			enableTicketFormRequestId: true,
			enableAdBlockerDetection: true,
			storageType: "sessionStorage",
			keyName: "userActivityLogs",
		};

		// Settings setup
		this.settings = { ...defaults, ...options };

		// Initialize logger
		this.init();

		// Log url
		if (this.settings.enableUrl) this.logUrl();

		// Log origin
		if (this.settings.enableOrigin) this.logOrigin();

		// Log form id
		if (this.settings.enableFormId) this.logFormId();

		// Log ticket form request id
		if (this.settings.enableTicketFormRequestId) this.logTicketFormRequestId();

		// Log AD Blocker
		if (this.settings.enableAdBlockerDetection) this.logAdBlocker();
	}

	/**
	 * This function is used to setup the storage where the user want to store the logs
	 */
	init() {
		if (!window[this.settings.storageType].getItem(this.settings.keyName)) {
			window[this.settings.storageType].setItem(this.settings.keyName, JSON.stringify([]));
		}
	}

	/**
	 * This function is used to log the url of the visited page
	 */
	logUrl() {
		const currentPage = window.location.href;

		this.writeLog(`Page loaded: ${currentPage}`);
	}

	/**
	 * This function is used to log the origin page
	 */
	logOrigin() {
		const originPage = document.referrer || "No origin";
		this.writeLog(`Origin: ${originPage}`);
	}

	/**
	 * This function is used to log the form id
	 */
	logFormId() {
		const field = document.querySelector(".request_ticket_form_id");

		if (field) {
			const searchParams = new URLSearchParams(window.location.search);

			if (searchParams.get("ticket_form_id")) {
				this.writeLog(`Form ID: ${searchParams.get("ticket_form_id")}`);
			} else {
				this.writeLog(`Form ID: Not available`);
			}
		}
	}

	/**
	 * This function is used to log if the form selection is visible
	 */
	logTicketFormRequestId() {
		const field = document.querySelector(".request_ticket_form_id");

		if (field) {
			const isVisible = field.style.display !== "none";

			this.writeLog(`Ticket form request id ${isVisible ? "IS" : "IS NOT"} visible`);
		}
	}

	/**
	 * This function is used to log if the current viewer is using an AD Blocker
	 * It runs three types of checks:
	 * - Bait Element Detection
	 * - Script Loading Detection
	 * - CSS-Based Detection
	 */
	logAdBlocker() {
		// Method 1: Bait Element Detection
		this.detectAdblockerByBaitElement();

		// Method 2: Script Loading Detection
		this.detectAdblockerByScript();

		// Method 3: CSS-Based Detection
		this.detectAdblockerByCSS();
	}

	/**
	 * Bait Element Detection:
	 * - Creates a bait element like an AD
	 * - Checks if it is visible after 100ms
	 */
	detectAdblockerByBaitElement() {
		const bait = document.createElement("div");
		bait.className = "adsbox";
		bait.style.height = "1px";
		bait.style.width = "1px";
		bait.style.position = "absolute";
		bait.style.left = "-10000px";
		document.body.appendChild(bait);

		window.setTimeout(() => {
			const isBlocked = !bait.offsetParent && bait.offsetHeight === 0;
			document.body.removeChild(bait);
			const logMessage = isBlocked ? "Adblocker detected (Bait Element)" : "No Adblocker detected (Bait Element)";
			this.writeLog(logMessage);
		}, 100);
	}

	/**
	 * Script Loading Detection:
	 * - Inserts a bait script
	 * - Checks if the script loading works
	 */
	detectAdblockerByScript() {
		const script = document.createElement("script");
		// Use a script URL that is commonly blocked by adblockers
		// Example: Google's AdSense script
		script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
		script.async = true;

		script.onload = () => {
			const logMessage = "No Adblocker detected (Script Loading)";
			this.writeLog(logMessage);
			// Remove the script after detection
			document.body.removeChild(script);
		};

		script.onerror = () => {
			const logMessage = "Adblocker detected (Script Loading)";
			this.writeLog(logMessage);
			// Remove the script after detection
			document.body.removeChild(script);
		};

		document.body.appendChild(script);
	}

	/**
	 * CSS-Based Detection:
	 * - Creates an element using a bait class
	 * - Checks if the element is visible after 100ms
	 */
	detectAdblockerByCSS() {
		const bait = document.createElement("div");
		bait.className = "ad-banner";
		bait.style.width = "1px";
		bait.style.height = "1px";
		bait.style.position = "absolute";
		bait.style.top = "-1000px";
		bait.style.left = "-1000px";
		document.body.appendChild(bait);

		window.setTimeout(() => {
			const computedStyle = window.getComputedStyle(bait);
			const isHidden =
				computedStyle &&
				(computedStyle.display === "none" ||
					computedStyle.visibility === "hidden" ||
					parseInt(computedStyle.height) === 0);
			document.body.removeChild(bait);
			const logMessage = isHidden ? "Adblocker detected (CSS)" : "No Adblocker detected (CSS)";
			this.writeLog(logMessage);
		}, 100);
	}

	/**
	 * This function is used to write into the selected storage a new log
	 * @param {String} message
	 */
	writeLog(message) {
		const logs = JSON.parse(window[this.settings.storageType].getItem(this.settings.keyName));
		logs.push({ timestamp: new Date().toISOString(), message });
		window[this.settings.storageType].setItem(this.settings.keyName, JSON.stringify(logs));
	}

	/**
	 * This function is used to get all the logs stored into the selected storage
	 * @returns {String} all the logs as a string
	 */
	getLogs() {
		if (window[this.settings.storageType].getItem(this.settings.keyName)) {
			return window[this.settings.storageType].getItem(this.settings.keyName);
		} else {
			return "ERROR: No logs available";
		}
	}

	/**
	 * This function is used to reset the logs stored into the selected storage
	 */
	resetLogs() {
		window[this.settings.storageType].setItem(this.settings.keyName, JSON.stringify([]));
	}
}

export default DetectiveConan;
