(function(window, document){
	"use strict";

	function VisibleConsole () {}

	// Static properties
	VisibleConsole.browserVisibleConsole;
	VisibleConsole.browserLog;
	VisibleConsole.consoleEl;
	VisibleConsole.headerEl;
	VisibleConsole.consoleInnerEl;
	VisibleConsole.consoleContainerEl;
	VisibleConsole.consoleOutputEl;
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
				document.body.appendChild(VisibleConsole.consoleEl);
			}

			//add the draggable header div
			if (VisibleConsole.consoleEl)  {
				VisibleConsole.headerEl = document.createElement('div');
				VisibleConsole.headerEl.id = 'visibleconsoleheader';
				VisibleConsole.headerEl.onmousedown = VisibleConsole._startMoving;
				document.getElementById('visibleconsole').appendChild(VisibleConsole.headerEl);
			}

			//add the console inner div
			if (VisibleConsole.consoleEl)  {
				VisibleConsole.consoleInnerEl = document.createElement('div');
				VisibleConsole.consoleInnerEl.id = 'visibleconsoleinner';
				document.getElementById('visibleconsole').appendChild(VisibleConsole.consoleInnerEl);
			}

			//add the visible output container div
			if (VisibleConsole.consoleInnerEl)  {
				VisibleConsole.consoleContainerEl = document.createElement('div');
				VisibleConsole.consoleContainerEl.id = 'visibleconsolecontainer';
				document.getElementById('visibleconsoleinner').appendChild(VisibleConsole.consoleContainerEl);
			}

			//add the visible output div
			if (VisibleConsole.consoleContainerEl)  {
				VisibleConsole.consoleOutputEl = document.createElement('div');
				VisibleConsole.consoleOutputEl.id = 'visibleconsoleoutput';
				document.getElementById('visibleconsolecontainer').appendChild(VisibleConsole.consoleOutputEl);
			}

			//add the resize handle div
			if (VisibleConsole.consoleInnerEl)  {
				VisibleConsole.handleEl = document.createElement('div');
				VisibleConsole.handleEl.id = 'visibleconsolehandle';
				VisibleConsole.handleEl.onmousedown = VisibleConsole._startResizing;
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

					var output = "", strArg;

					for (var i = 0; i < arguments.length; ++i)
					{
						if (typeof(arguments[i]) == 'string') {
							output += arguments[i];
							if (i < arguments.length - 1) output += ' ';
							else output += "\n";
						} else {
							try {
								strArg = arguments[i].toString();
								output += strArg;
								if (i < arguments.length - 1) output += ' ';
								else output += "\n";
							} catch (e) {
								strArg = Object.prototype.toString.call(arguments[i]);
								output += strArg;
								if (i < arguments.length - 1) output += ' ';
								else output += "\n";
							}
						}
					}

					VisibleConsole.consoleOutputEl.innerHTML += output;
					VisibleConsole.consoleOutputEl.scrollTop = VisibleConsole.consoleOutputEl.scrollHeight;

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

	VisibleConsole._stop = function () {
		document.onmouseup = function(){};
		document.onmousemove = function(){};
		VisibleConsole._setSelectable(true);
	};

	VisibleConsole._move = function (xpos, ypos) {
		VisibleConsole.consoleEl.style.left = Math.max(xpos,0) + 'px';
		VisibleConsole.consoleEl.style.top = Math.max(ypos,0) + 'px';
	};

	VisibleConsole._resize = function (w, h) {
		VisibleConsole.consoleEl.style.pixelWidth = w;
		VisibleConsole.consoleEl.style.pixelHeight = h;
	};

	VisibleConsole._startMoving = function (evt) {
		evt = evt || window.event;
		var posX = evt.clientX;
		var posY = evt.clientY;
		var divTop = Number(VisibleConsole.consoleEl.style.top.replace('px',''));
		var divLeft = Number(VisibleConsole.consoleEl.style.left.replace('px',''));
		var diffX = posX - divLeft;
		var diffY = posY - divTop;

		VisibleConsole._setSelectable(false);


		document.onmousemove = function (evt) {
			evt = evt || window.event;
			var newX = evt.clientX - diffX;
			var newY = evt.clientY - diffY;
			VisibleConsole._move (newX, newY);
		}

		document.onmouseup = VisibleConsole._stop;
	};

	VisibleConsole._startResizing = function (evt) {
		evt = evt || window.event;
		evt.stopPropagation();

		var posX = evt.clientX;
		var posY = evt.clientY;
		var divTop = Number(VisibleConsole.consoleEl.style.top.replace('px',''));
		var divLeft = Number(VisibleConsole.consoleEl.style.left.replace('px',''));

		VisibleConsole._setSelectable(false);

		document.onmousemove = function(evt) {
			evt = evt || window.event;
			var newW = evt.clientX - divLeft;
			var newH = evt.clientY - divTop;
			VisibleConsole._resize(newW, newH);
		}
		document.onmouseup = VisibleConsole._stop;
	};

	VisibleConsole._setSelectable = function (val) {

		var s = VisibleConsole.containerEl.style;
		if (val) {
			s.userSelect = "text";
			s.webkitUserSelect = "text";
			s.MozUserSelect = "text";
			VisibleConsole.containerEl.setAttribute("unselectable", "off"); // For IE and Opera
		} else {
			s.userSelect = "none";
			s.webkitUserSelect = "none";
			s.MozUserSelect = "none";
			VisibleConsole.containerEl.setAttribute("unselectable", "on"); // For IE and Opera
		}
	};

	window.VisibleConsole = VisibleConsole;

})(window, document);

