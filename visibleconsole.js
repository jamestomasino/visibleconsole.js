(function(window, document){
	"use strict";

	function VisibleConsole () {}

	// Static properties
	VisibleConsole.browserVisibleConsole;
	VisibleConsole.browserLog;
	VisibleConsole.consoleEl;
	VisibleConsole.headerEl;
	VisibleConsole.containerEl;
	VisibleConsole.handleEl;
	VisibleConsole.fallBackIFrame;

	// Static psudo-privates
	VisibleConsole._isEnabled = false;

	VisibleConsole.enable = function () {

		if (VisibleConsole._isEnabled === false) {
			VisibleConsole._isEnabled = true;

			// Prepare #console element
			VisibleConsole.consoleEl = document.getElementById('visibleconsole');
			if (!VisibleConsole.consoleEl)  {
				VisibleConsole.consoleEl = document.createElement('div');
				VisibleConsole.consoleEl.id = 'visibleconsole';
				// VisibleConsole.consoleEl.onmousedown = tzdragg.startMoving;
				// VisibleConsole.consoleEl.onmouseup = tzdragg.stopMoving;
				document.body.appendChild(VisibleConsole.consoleEl);
			}

			//add the draggable header
			if (VisibleConsole.consoleEl)  {
				VisibleConsole.headerEl = document.createElement('div');
				VisibleConsole.headerEl.id = 'header';
				VisibleConsole.headerEl.onmousedown = tzdragg.startMoving;
				VisibleConsole.headerEl.onmouseup = tzdragg.stopMoving;
				document.getElementById('visibleconsole').appendChild(VisibleConsole.headerEl);
			}

			//add the resize container
			if (VisibleConsole.consoleEl)  {
				VisibleConsole.containerEl = document.createElement('div');
				VisibleConsole.containerEl.id = 'container';
				document.getElementById('visibleconsole').appendChild(VisibleConsole.containerEl);
			}

			//add the resize handle
			if (VisibleConsole.containerEl)  {
				VisibleConsole.handleEl = document.createElement('div');
				VisibleConsole.handleEl.id = 'handle';
				document.getElementById('visibleconsole').appendChild(VisibleConsole.handleEl);
			}

			// Prepare fallback console
			VisibleConsole.fallBackIFrame = document.getElementById('visibleconsoleiframe');
			if ( !VisibleConsole.fallBackIFrame) {
				VisibleConsole.fallBackIFrame = document.createElement('iframe');
				VisibleConsole.fallBackIFrame.style.display = 'none';
				VisibleConsole.fallBackIFrame.id = 'visibleconsoleiframe';
				document.body.appendChild(VisibleConsole.fallBackIFrame);
			}

			// Prepare browserVisibleConsole
			VisibleConsole.browserVisibleConsole = VisibleConsole.fallBackIFrame.contentWindow.console;

			// Fix native code interpolation error on apply: http://stackoverflow.com/questions/5538972/console-log-apply-not-working-in-ie9
			VisibleConsole.browserLog = Function.prototype.bind.call(VisibleConsole.browserVisibleConsole.log, VisibleConsole.browserVisibleConsole);

			// Ouput to #visibleconsole
			window.console = {
				log: function () {

					var output = "";

					for (var i = 0; i < arguments.length; ++i)
					{
						if (typeof(arguments[i]) == 'string') {
							output += arguments[i];
							if (i < arguments.length - 1) output += ' ';
							else output += "\n";
						}
					}

					VisibleConsole.containerEl.innerHTML += output;
					VisibleConsole.containerEl.scrollTop = VisibleConsole.containerEl.scrollHeight;

					// Output to native console
					if (VisibleConsole.browserVisibleConsole && VisibleConsole.browserVisibleConsole.log ) {
						VisibleConsole.browserLog.apply ( null, arguments);
					}

				}
			};

			window.onerror = function (msg, url, linenumber) {
				window.console.log('[ERROR] ' + msg + ' (' + url + ' Line: ' + linenumber + ')');
				return true;
			};

		}
	};

	VisibleConsole.disable = function () {
		if (VisibleConsole._isEnabled === true) {
			VisibleConsole._isEnabled = false;

			window.console = VisibleConsole.browserVisibleConsole;
			window.onerror = VisibleConsole.fallBackIFrame.contentWindow.onerror;

			VisibleConsole.consoleEl.parentNode.removeChild(VisibleConsole.consoleEl);
			VisibleConsole.fallBackIFrame.parentNode.removeChild(VisibleConsole.fallBackIFrame);
			VisibleConsole.consoleEl = null;
			VisibleConsole.fallBackIFrame = null;
			VisibleConsole.browserLog = null;
		}
	};

	window.VisibleConsole = VisibleConsole;

})(window, document);

