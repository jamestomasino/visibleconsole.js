/*!
 * VisibleConsole v0.4.1
 * http://github.com/jamestomasino/visibleconsole.js
 *
 * Copyright (c) James Tomasino
 *               Eric Emmons
 *               Stephen McDonald
 * MIT license
 *
 */

(function(window, document, navigator){
	"use strict";

	function VC () {}

	VC._fallbackConsole;
	VC._passiveOutput;
	VC._isEnabled = false;
	VC._isPassiveLogging = false;
	VC._commandHistory = [];
	VC._commandIndex = 0;

	// DOM Elements & Struct
	VC.el = {};
	VC.el.console;
		VC.el.header;
		VC.el.inner;
			VC.el.container;
				VC.el.output;
				VC.el.input;
		VC.el.handle;

	// Track what we created so we can remove it
	VC.el.isCreatedConsole = false;
	VC.el.isCreatedHeader = false;
	VC.el.isCreatedInner = false;
	VC.el.isCreatedContainer = false;
	VC.el.isCreatedOutput = false;
	VC.el.isCreatedInput = false;
	VC.el.isCreatedHandle = false;

	VC.enable = function () {
		if (VC._isEnabled === false) {
			VC._isEnabled = true;

			// Prepare #console element
			VC.el.console = document.getElementById('visibleconsole');
			if ( typeof(VC.el.console) == 'undefined' || VC.el.console == null )  {
				VC.el.isCreatedConsole = true;
				VC.el.console = document.createElement('div');
				VC.el.console.id = 'visibleconsole';
				document.body.appendChild(VC.el.console);
			}

			// add the draggable header div
			VC.el.header = document.getElementById('visibleconsoleheader');
			if ( typeof(VC.el.header) == 'undefined' || VC.el.header == null ) {
				VC.el.isCreatedHeader = true;
				VC.el.header = document.createElement('div');
				VC.el.header.id = 'visibleconsoleheader';
				VC.el.header.innerHTML = '~VisibleConsole~';
				document.getElementById('visibleconsole').appendChild(VC.el.header);
			}
			VC.el.header.onmousedown = VC._startMoving;
			VC.el.header.ontouchstart = VC._startTouchMoving;

			// add the console inner div
			VC.el.inner = document.getElementById('visibleconsoleinner');
			if ( typeof(VC.el.inner) == 'undefined' || VC.el.inner == null )  {
				VC.el.isCreatedInner = true;
				VC.el.inner = document.createElement('div');
				VC.el.inner.id = 'visibleconsoleinner';
				document.getElementById('visibleconsole').appendChild(VC.el.inner);
			}

			// add the visible output container div
			VC.el.container = document.getElementById('visibleconsolecontainer');
			if ( typeof(VC.el.container) == 'undefined' || VC.el.container == null )  {
				VC.el.isCreatedContainer = true;
				VC.el.container = document.createElement('div');
				VC.el.container.id = 'visibleconsolecontainer';
				document.getElementById('visibleconsoleinner').appendChild(VC.el.container);
			}

			// add the visible output div
			VC.el.output = document.getElementById('visibleconsoleoutput');
			if ( typeof(VC.el.output) == 'undefined' || VC.el.output == null )  {
				VC.el.isCreatedOutput = true;
				VC.el.output = document.createElement('div');
				VC.el.output.id = 'visibleconsoleoutput';
				document.getElementById('visibleconsolecontainer').appendChild(VC.el.output);
			}

			// add the input
			VC.el.input = document.getElementById('visibleconsoleinput');
			if ( typeof(VC.el.input ) == 'undefined' || VC.el.input == null )  {
				VC.el.isCreatedInput = true;
				VC.el.input = document.createElement('input');
				VC.el.input.id = 'visibleconsoleinput';
				document.getElementById('visibleconsolecontainer').appendChild(VC.el.input);
			}
			VC.el.input.onkeypress = VC._keyPress;
			VC.el.input.onkeydown = VC._keyDown;

			// add the resize handle div
			VC.el.handle = document.getElementById('visibleconsolehandle');
			if ( typeof(VC.el.handle ) == 'undefined' || VC.el.handle == null )  {
				VC.el.isCreatedHandle = true;
				VC.el.handle = document.createElement('div');
				VC.el.handle.id = 'visibleconsolehandle';
				document.getElementById('visibleconsole').appendChild(VC.el.handle);
			}
			VC.el.handle.onmousedown = VC._startResizing;
			VC.el.handle.ontouchstart = VC._startTouchResizing;
			var handleWidth = VC.el.handle.offsetWidth;
			var handleHeight = VC.el.handle.offsetHeight;
			VC.el.handle.appendChild(VC._createline(handleWidth + 1, handleHeight - 5, handleWidth - 4, handleHeight));
			VC.el.handle.appendChild(VC._createline(handleWidth + 1, handleHeight - 11, handleWidth - 10, handleHeight));

			// Store for disable
			if (!VC._fallbackConsole) VC._fallbackConsole = window.console;

			// Get passive logging content if it exists
			if (VC._passiveOutput) {
				VC.el.output.innerHTML = VC._passiveOutput.innerHTML;
				VC.el.output.scrollTop = VC.el.output.scrollHeight;
			}

			// Ouput logs
			window.console = {
				log: function () {
					var outputWrapper = VC._createLogMessage( arguments );

					VC.el.output.appendChild(outputWrapper);
					VC.el.output.scrollTop = VC.el.output.scrollHeight;

					if ( VC._fallbackConsole.log ) VC._fallbackConsole.log.apply ( VC._fallbackConsole, arguments );
				}
			};

			// Output errors
			window.onerror = function (msg, url, linenumber) {
				var outputWrapper = VC._createErrorMessage ( msg, url, linenumber );
				VC.el.output.appendChild(outputWrapper);
				VC.el.output.scrollTop = VC.el.output.scrollHeight;
				return false;
			};

			// Set proper size and position on enable
			VC._resize();
			VC._move();
		}
	};

	VC.disable = function () {
		if (VC._isEnabled === true) {
			VC._isEnabled = false;

			// If passively logging, transfer console behavior, else kill it
			if ( VC._isPassiveLogging === true) {
				VC._enablePassiveLogger();
				if (VC.el.output) VC._passiveOutput.innerHTML = VC.el.output.innerHTML
			} else {
				window.console = VC._fallbackConsole;
				VC._fallbackConsole = null;
			}

			// Remove dom elements in reverse order
			if ( VC.el.isCreatedOutput ) {
				VC.el.output.parentNode.removeChild(VC.el.output);
				VC.el.output = null;
				VC.el.isCreatedOutput = false;
			}
			if ( VC.el.isCreatedInput ) {
				VC.el.input.parentNode.removeChild(VC.el.input);
				VC.el.input = null;
				VC.el.isCreatedInput = false;
			}
			if ( VC.el.isCreatedContainer ) {
				VC.el.container.parentNode.removeChild(VC.el.container);
				VC.el.container = null;
				VC.el.isCreatedContainer = false;
			}
			if ( VC.el.isCreatedInner ) {
				VC.el.inner.parentNode.removeChild(VC.el.inner);
				VC.el.inner = null;
				VC.el.isCreatedInner = false;
			}
			if ( VC.el.isCreatedHeader ) {
				VC.el.header.parentNode.removeChild(VC.el.header);
				VC.el.header = null;
				VC.el.isCreatedHeader = false;
			}
			if ( VC.el.isCreatedHandle ) {
				VC.el.handle.parentNode.removeChild(VC.el.handle);
				VC.el.handle = null;
				VC.el.isCreatedHandle = false;
			}
			if ( VC.el.isCreatedConsole ) {
				VC.el.console.parentNode.removeChild(VC.el.console);
				VC.el.console = null;
				VC.el.isCreatedConsole = false;
			}
		}
	};

	VC.enablePassiveLogging = function () {
		if (VC._isPassiveLogging === false) {
			VC._isPassiveLogging = true;

			// Store console for disable
			if (!VC._fallbackConsole) VC._fallbackConsole = window.console;

			// Only enable our passive console logger if not actively logging
			if (VC._isEnabled !== true) {
				VC._enablePassiveLogger();
			}
		}
	};

	VC.disablePassiveLogging = function () {
		if (VC._isPassiveLogging === true) {
			VC._isPassiveLogging = false;

			// Delete passive content
			VC._passiveOutput = null;

			// If there is no active console, kill the passive one
			if (VC._isEnabled !== true) {
				window.console = VC._fallbackConsole;
				VC._fallbackConsole = null;
			}
		}
	};

	VC._enablePassiveLogger = function () {
		// Create passive log element
		VC._passiveOutput = document.createElement('div');

		// Set up passive logger
		window.console = {
			log: function () {
				var outputWrapper = VC._createLogMessage( arguments );
				VC._passiveOutput.appendChild(outputWrapper);
				if ( VC._fallbackConsole.log ) VC._fallbackConsole.log.apply ( VC._fallbackConsole, arguments );
			}
		};

		// Set up passive error logger
		window.onerror = function (msg, url, linenumber) {
			var outputWrapper = VC._createErrorMessage ( msg, url, linenumber );
			VC._passiveOutput.appendChild(outputWrapper);
			return false;
		};
	};

	VC._createLogMessage = function ( args ) {
		var outputWrapper = document.createElement('span');
		var textNode;
		outputWrapper.className = 'visibleconsolemessage';

		// Loop through arguments and try to convert each to a string in various ways for display
		for (var i = 0; i < args.length; ++i)
		{
			if (typeof(args[i]) == 'string') {
				textNode = document.createTextNode(args[i]);
				outputWrapper.appendChild(textNode);
			} else {
				try {
					textNode = document.createTextNode(JSON.stringify(args[i]));
					outputWrapper.appendChild(textNode);
				} catch (e) {
					textNode = document.createTextNode(Object.prototype.toString.call(args[i]));
					outputWrapper.appendChild(textNode);
				}
			}
			if (i < args.length - 1) outputWrapper.appendChild(document.createTextNode(' '));
		}
		return outputWrapper;
	};

	VC._createErrorMessage = function ( msg, url, linenumber ) {
		var outputWrapper = document.createElement('span');
		outputWrapper.className = 'visibleconsolemessage';
		var errorWrapper = document.createElement('span');
		errorWrapper.className = 'visibleconsoleerror';
		var textNode = document.createTextNode('[ERROR] ' + msg + ' (' + url + ' Line: ' + linenumber + ')');
		errorWrapper.appendChild(textNode);
		outputWrapper.appendChild(errorWrapper);
		return outputWrapper;
	};

	VC._createline = function (x1, y1, x2, y2)	{
		var isIE = navigator.userAgent.indexOf("MSIE") > -1;
		if (x2 < x1) {
			var temp = x1; x1 = x2; x2 = temp;
			temp = y1; y1 = y2; y2 = temp;
		}
		var line = document.createElement("div");
		line.className = "visibleconsoleline";
		var length = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
		line.style.width = length + "px";
		if (isIE) {
			line.style.top = (y2 > y1) ? y1 + "px" : y2 + "px";
			line.style.left = x1 + "px";
			var nCos = (x2-x1)/length;
			var nSin = (y2-y1)/length;
			line.style.filter = "progid:DXImageTransform.Microsoft.Matrix(sizingMethod='auto expand', M11=" + nCos + ", M12=" + -1*nSin + ", M21=" + nSin + ", M22=" + nCos + ")";
		} else {
			var angle = Math.atan((y2-y1)/(x2-x1));
			line.style.top = y1 + 0.5*length*Math.sin(angle) + "px";
			line.style.left = x1 - 0.5*length*(1 - Math.cos(angle)) + "px";
			line.style.MozTransform = line.style.WebkitTransform = line.style.OTransform= "rotate(" + angle + "rad)";
		}
		return line;
	};

	VC._stop = function () {
		document.onmouseup = function(){};
		document.onmousemove = function(){};
		document.ontouchend = function(){};
		document.ontouchmove = function(){};

	};

	VC._move = function (xpos, ypos) {
		if (typeof xpos === "undefined" || typeof ypos === "undefined") {
			var elem = (document.compatMode === "CSS1Compat") ?  document.documentElement : document.body;
			var height = elem.clientHeight;
			var width = elem.clientWidth;
			var wholeConsoleHeight = VC.el.inner.offsetHeight;
			var wholeConsoleWidth = VC.el.inner.offsetWidth;
			xpos = (width >> 1) - (wholeConsoleWidth >> 1);
			ypos = (height >> 1) - (wholeConsoleHeight >> 1);
		}
		VC.el.console.style.left = Math.max(xpos,0) + 'px';
		VC.el.console.style.top = Math.max(ypos,0) + 'px';
	};

	VC._resize = function (w, h) {
		if (typeof w !== "undefined" && typeof h !== "undefined") {
			VC.el.console.style.pixelWidth = w;
			VC.el.console.style.pixelHeight = h;
			VC.el.console.style.width = w + 'px';
			VC.el.console.style.height = h + 'px';
		}
		var wholeConsoleHeight = VC.el.inner.offsetHeight;
		var headerHeight = VC.el.header.offsetHeight;
		var inputHeight = VC.el.input.offsetHeight;
		var contentHeight = (wholeConsoleHeight - headerHeight - inputHeight);
		VC.el.output.style.height = contentHeight + 'px';
	};

	VC._startMoving = function (evt) {
		evt = evt || window.event;

		// Don't track right-clicks
		if ((evt.keyCode || evt.which) == 3) return;
		VC._stopDefault(evt);
		var posX = evt.clientX;
		var posY = evt.clientY;
		var divTop = Number(VC.el.console.style.top.replace('px',''));
		var divLeft = Number(VC.el.console.style.left.replace('px',''));
		var diffX = posX - divLeft;
		var diffY = posY - divTop;

		// Handle mouse movement
		document.onmousemove = function (evt) {
			VC._stopDefault(evt);
			evt = evt || window.event;
			var newX = evt.clientX - diffX;
			var newY = evt.clientY - diffY;
			VC._move (newX, newY);
		};

		// Handle mouse up
		document.onmouseup = document.ontouchend = VC._stop;
	};

	VC._startTouchMoving = function (evt) {
		evt = evt || window.event;
		VC._stopDefault(evt);
		var touch = (typeof (evt.touches) !== 'undefined') ? evt.touches[0] : null;
		if (touch !== null) {
			var posX = touch.clientX;
			var posY = touch.clientY;
			var divTop = Number(VC.el.console.style.top.replace('px',''));
			var divLeft = Number(VC.el.console.style.left.replace('px',''));
			var diffX = posX - divLeft;
			var diffY = posY - divTop;

			// Handle touch movement
			document.ontouchmove = function (evt) {
				VC._stopDefault(evt);
				evt = evt || window.event;
				var touch = (typeof (evt.touches) !== 'undefined') ? evt.touches[0] : null;
				if (touch !== null) {
					var newX = touch.clientX - diffX;
					var newY = touch.clientY - diffY;
					VC._move (newX, newY);
				}
			};

			// Handle touch end
			document.ontouchend = VC._stop;
		}
	};

	VC._startResizing = function (evt) {
		evt = evt || window.event;

		// Don't track right-clicks
		if ((evt.keyCode || evt.which) == 3) return;
		VC._stopDefault(evt);
		var posX = evt.clientX;
		var posY = evt.clientY;
		var divTop = Number(VC.el.console.style.top.replace('px',''));
		var divLeft = Number(VC.el.console.style.left.replace('px',''));
		document.onmousemove = function(evt) {
			evt = evt || window.event;
			VC._stopDefault(evt);
			var newW = evt.clientX - divLeft;
			var newH = evt.clientY - divTop;
			VC._resize(newW, newH);
		};
		document.onmouseup = VC._stop;
	};

	VC._startTouchResizing = function (evt) {
		evt = evt || window.event;
		VC._stopDefault(evt);
		var touch = (typeof (evt.touches) !== 'undefined') ? evt.touches[0] : null;
		if (touch !== null) {
			var posX = touch.clientX;
			var posY = touch.clientY;
			var divTop = Number(VC.el.console.style.top.replace('px',''));
			var divLeft = Number(VC.el.console.style.left.replace('px',''));
			document.ontouchmove = function(evt) {
				evt = evt || window.event;
				VC._stopDefault(evt);
				var touch = (typeof (evt.touches) !== 'undefined') ? evt.touches[0] : null;
				if (touch !== null) {
					var newW = touch.clientX - divLeft;
					var newH = touch.clientY - divTop;
				}
				VC._resize(newW, newH);
			};
			document.ontouchend = VC._stop;
		}
	};


	VC._stopDefault = function (evt) {
		evt = evt || window.event;
		if (evt && evt.preventDefault) {
			evt.preventDefault();
		}
		else {
			window.event.returnValue = false;
		}
		return false;
	};

	VC._keyDown = function (evt) {
		evt = evt || window.event;
		var keyCode = evt ? (evt.which ? evt.which : evt.keyCode) : event.keyCode;
		switch (keyCode) {
			case 38: // up arrow
				if (VC._commandIndex > 0) {
					--VC._commandIndex;
					var command = VC._commandHistory[VC._commandIndex];
					VC.el.input.value = command;
				}
				evt.preventDefault();
				break;

			case 40: // down arrow
				if (VC._commandIndex < VC._commandHistory.length - 1) {
					++VC._commandIndex;
					var command = VC._commandHistory[VC._commandIndex];
					VC.el.input.value = command;
				}
				evt.preventDefault();
				break;
		}
	}

	VC._keyPress = function (evt) {
		evt = evt || window.event;
		var keyCode = evt ? (evt.which ? evt.which : evt.keyCode) : event.keyCode;
		switch (keyCode) {
			case 13:
				var theCode = event.target.value;
				event.target.value = "";
				VC._commandHistory.push (theCode);
				VC._commandIndex = VC._commandHistory.length;

				switch (theCode) {
					case 'clear':
						if (VC._passiveOutput) VC._passiveOutput.innerHTML = '';
						if (VC.el.output) VC.el.output.innerHTML = '';
						break;
					default:
						eval(theCode);
				}
				break;
			default:
				return true;
        }
    };

	window.VisibleConsole = VC;

})(window, document, navigator);

VisibleConsole.enablePassiveLogging();
