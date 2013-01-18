/*!
 * VisibleConsole v0.3.1
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

	function VisibleConsole () {}

	// Static properties
	VisibleConsole.browserFallbackConsole;
	VisibleConsole.browserFallbackLog;
	VisibleConsole.consolePassiveOutput;

	VisibleConsole.el = {};

	// DOM Elements & Struct
	VisibleConsole.el.console;
		VisibleConsole.el.header;
		VisibleConsole.el.inner;
			VisibleConsole.el.container;
				VisibleConsole.el.output;
				VisibleConsole.el.input;
		VisibleConsole.el.handle;


	// Static psudo-privates
	VisibleConsole._isEnabled = false;
	VisibleConsole._isPassiveLogging = false;


	VisibleConsole.enable = function () {

		if (VisibleConsole._isEnabled === false) {
			VisibleConsole._isEnabled = true;

			// Prepare #console element
			VisibleConsole.el.console = document.getElementById('visibleconsole');
			if ( !VisibleConsole.el.console )  {
				VisibleConsole.el.console = document.createElement('div');
				VisibleConsole.el.console.id = 'visibleconsole';
				document.body.appendChild(VisibleConsole.el.console);
			}

			// add the draggable header div
			VisibleConsole.el.header = document.getElementById('visibleconsoleheader');
			if ( !VisibleConsole.el.header ) {
				VisibleConsole.el.header = document.createElement('div');
				VisibleConsole.el.header.id = 'visibleconsoleheader';
				VisibleConsole.el.header.innerHTML = '~VisibleConsole~';
				VisibleConsole.el.header.onmousedown = VisibleConsole._startMoving;
				VisibleConsole.el.header.ontouchstart = VisibleConsole._startTouchMoving;
				document.getElementById('visibleconsole').appendChild(VisibleConsole.el.header);
			}

			// add the console inner div
			VisibleConsole.el.inner = document.getElementById('visibleconsoleinner');
			if ( !VisibleConsole.el.inner )  {
				VisibleConsole.el.inner = document.createElement('div');
				VisibleConsole.el.inner.id = 'visibleconsoleinner';
				document.getElementById('visibleconsole').appendChild(VisibleConsole.el.inner);
			}

			// add the visible output container div
			VisibleConsole.el.container = document.getElementById('visibleconsolecontainer');
			if ( !VisibleConsole.el.container )  {
				VisibleConsole.el.container = document.createElement('div');
				VisibleConsole.el.container.id = 'visibleconsolecontainer';
				document.getElementById('visibleconsoleinner').appendChild(VisibleConsole.el.container);
			}

			// add the visible output div
			VisibleConsole.el.output = document.getElementById('visibleconsoleoutput');
			if ( !VisibleConsole.el.output )  {
				VisibleConsole.el.output = document.createElement('div');
				VisibleConsole.el.output.id = 'visibleconsoleoutput';
				document.getElementById('visibleconsolecontainer').appendChild(VisibleConsole.el.output);
			}

			// add the input
			VisibleConsole.el.input = document.getElementById('visibleconsoleinput');
			if ( !VisibleConsole.el.input )  {
				VisibleConsole.el.input = document.createElement('input');
				VisibleConsole.el.input.id = 'visibleconsoleinput';
				VisibleConsole.el.input.onkeypress = VisibleConsole._keyPress;
				document.getElementById('visibleconsolecontainer').appendChild(VisibleConsole.el.input);
			}

			// add the resize handle div
			VisibleConsole.el.handle = document.getElementById('visibleconsolehandle');
			if ( !VisibleConsole.el.handle )  {
				VisibleConsole.el.handle = document.createElement('div');
				VisibleConsole.el.handle.id = 'visibleconsolehandle';
				VisibleConsole.el.handle.onmousedown = VisibleConsole._startResizing;
				VisibleConsole.el.handle.ontouchstart = VisibleConsole._startTouchResizing;
				document.getElementById('visibleconsole').appendChild(VisibleConsole.el.handle);
				var handleWidth = VisibleConsole.el.handle.offsetWidth;
				var handleHeight = VisibleConsole.el.handle.offsetHeight;
				VisibleConsole.el.handle.appendChild(VisibleConsole._createline(handleWidth + 1, handleHeight - 5, handleWidth - 4, handleHeight));
				VisibleConsole.el.handle.appendChild(VisibleConsole._createline(handleWidth + 1, handleHeight - 11, handleWidth - 10, handleHeight));
			}

			// Store for disable
			if (!VisibleConsole.browserFallbackConsole) VisibleConsole.browserFallbackConsole = window.console;

			// Get passive logging content if it exists
			if (VisibleConsole.consolePassiveOutput) {
				VisibleConsole.el.output.innerHTML = VisibleConsole.consolePassiveOutput.innerHTML;
				VisibleConsole.el.output.scrollTop = VisibleConsole.el.output.scrollHeight;
			}

			// Ouput to #visibleconsole
			window.console = {
				log: function () {

					var outputWrapper = VisibleConsole._createLogMessage( arguments );

					VisibleConsole.el.output.appendChild(outputWrapper);
					VisibleConsole.el.output.scrollTop = VisibleConsole.el.output.scrollHeight;

					if ( VisibleConsole.browserFallbackConsole.log ) VisibleConsole.browserFallbackConsole.log.apply ( VisibleConsole.browserFallbackConsole, arguments );
				}
			};

			window.onerror = function (msg, url, linenumber) {
				var outputWrapper = VisibleConsole._createErrorMessage ( msg, url, linenumber );
				VisibleConsole.el.output.appendChild(outputWrapper);
				VisibleConsole.el.output.scrollTop = VisibleConsole.el.output.scrollHeight;
				return false;
			};

			VisibleConsole._resize();
			VisibleConsole._move();
		}
	};

	VisibleConsole.disable = function () {
		if (VisibleConsole._isEnabled === true) {
			VisibleConsole._isEnabled = false;

			if ( VisibleConsole._isPassiveLogging === true) {
				VisibleConsole._enablePassiveLogger();
				if (VisibleConsole.el.output) VisibleConsole.consolePassiveOutput.innerHTML = VisibleConsole.el.output.innerHTML
			} else {
				window.console = VisibleConsole.browserFallbackConsole;
				VisibleConsole.browserFallbackConsole = null;
			}

			VisibleConsole.el.console.parentNode.removeChild(VisibleConsole.el.console);
			VisibleConsole.el.console = null;
		}
	};

	VisibleConsole.enablePassiveLogging = function () {
		if (VisibleConsole._isPassiveLogging === false) {
			VisibleConsole._isPassiveLogging = true;

			if (!VisibleConsole.browserFallbackConsole) VisibleConsole.browserFallbackConsole = window.console;

			if (VisibleConsole._isEnabled !== true) {
				VisibleConsole._enablePassiveLogger();
			}
		}
	};

	VisibleConsole.disablePassiveLogging = function () {
		if (VisibleConsole._isPassiveLogging === true) {
			VisibleConsole._isPassiveLogging = false;

			VisibleConsole.consolePassiveOutput = null;

			if (VisibleConsole._isEnabled !== true) {
				window.console = VisibleConsole.browserFallbackConsole;
				VisibleConsole.browserFallbackConsole = null;
			}
		}
	};

	VisibleConsole._enablePassiveLogger = function () {

		VisibleConsole.consolePassiveOutput = document.createElement('div');

		window.console = {
			log: function () {
				var outputWrapper = VisibleConsole._createLogMessage( arguments );
				VisibleConsole.consolePassiveOutput.appendChild(outputWrapper);
				if ( VisibleConsole.browserFallbackConsole.log ) VisibleConsole.browserFallbackConsole.log.apply ( VisibleConsole.browserFallbackConsole, arguments );
			}
		};

		window.onerror = function (msg, url, linenumber) {
			var outputWrapper = VisibleConsole._createErrorMessage ( msg, url, linenumber );
			VisibleConsole.consolePassiveOutput.appendChild(outputWrapper);
			return false;
		};
	};

	VisibleConsole._createLogMessage = function ( args ) {
		var outputWrapper = document.createElement('span');
		var textNode;
		outputWrapper.className = 'visibleconsolemessage';

		for (var i = 0; i < args.length; ++i)
		{
			// Try to display as a normal string
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

	VisibleConsole._createErrorMessage = function ( msg, url, linenumber ) {

	var outputWrapper = document.createElement('span');
		outputWrapper.className = 'visibleconsolemessage';

		var errorWrapper = document.createElement('span');
		errorWrapper.className = 'visibleconsoleerror';

		var textNode = document.createTextNode('[ERROR] ' + msg + ' (' + url + ' Line: ' + linenumber + ')');

		errorWrapper.appendChild(textNode);
		outputWrapper.appendChild(errorWrapper);

		return outputWrapper;
	};

	VisibleConsole._createline = function (x1, y1, x2, y2)	{

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

	VisibleConsole._stop = function () {
		document.onmouseup = function(){};
		document.onmousemove = function(){};
		document.ontouchend = function(){};
		document.ontouchmove = function(){};
	};

	VisibleConsole._move = function (xpos, ypos) {
		if (typeof xpos === "undefined" || typeof ypos === "undefined") {
			var elem = (document.compatMode === "CSS1Compat") ?  document.documentElement : document.body;
			var height = elem.clientHeight;
			var width = elem.clientWidth;
			var wholeConsoleHeight = VisibleConsole.el.inner.offsetHeight;
			var wholeConsoleWidth = VisibleConsole.el.inner.offsetWidth;
			xpos = (width >> 1) - (wholeConsoleWidth >> 1);
			ypos = (height >> 1) - (wholeConsoleHeight >> 1);
		}

		VisibleConsole.el.console.style.left = Math.max(xpos,0) + 'px';
		VisibleConsole.el.console.style.top = Math.max(ypos,0) + 'px';
	};

	VisibleConsole._resize = function (w, h) {
		if (typeof w !== "undefined" && typeof h !== "undefined") {
			VisibleConsole.el.console.style.pixelWidth = w;
			VisibleConsole.el.console.style.pixelHeight = h;
			VisibleConsole.el.console.style.width = w + 'px';
			VisibleConsole.el.console.style.height = h + 'px';
		}
		var wholeConsoleHeight = VisibleConsole.el.inner.offsetHeight;
		var headerHeight = VisibleConsole.el.header.offsetHeight;
		var inputHeight = VisibleConsole.el.input.offsetHeight;
		var contentHeight = (wholeConsoleHeight - headerHeight - inputHeight);
		VisibleConsole.el.output.style.height = contentHeight + 'px';
	};

	VisibleConsole._startMoving = function (evt) {
		evt = evt || window.event;

		// Don't track right-clicks
		if ((evt.keyCode || evt.which) == 3) return;

		VisibleConsole._stopDefault(evt);

		var posX = evt.clientX;
		var posY = evt.clientY;
		var divTop = Number(VisibleConsole.el.console.style.top.replace('px',''));
		var divLeft = Number(VisibleConsole.el.console.style.left.replace('px',''));
		var diffX = posX - divLeft;
		var diffY = posY - divTop;

		document.onmousemove = function (evt) {
			VisibleConsole._stopDefault(evt);
			evt = evt || window.event;
			var newX = evt.clientX - diffX;
			var newY = evt.clientY - diffY;
			VisibleConsole._move (newX, newY);
		};

		document.onmouseup = document.ontouchend = VisibleConsole._stop;
	};

	VisibleConsole._startTouchMoving = function (evt) {
		evt = evt || window.event;
		VisibleConsole._stopDefault(evt);

		var touch = (typeof (evt.touches) !== 'undefined') ? evt.touches[0] : null;
		if (touch !== null) {
			var posX = touch.clientX;
			var posY = touch.clientY;
			var divTop = Number(VisibleConsole.el.console.style.top.replace('px',''));
			var divLeft = Number(VisibleConsole.el.console.style.left.replace('px',''));
			var diffX = posX - divLeft;
			var diffY = posY - divTop;

			document.ontouchmove = function (evt) {
				VisibleConsole._stopDefault(evt);
				evt = evt || window.event;
				var touch = (typeof (evt.touches) !== 'undefined') ? evt.touches[0] : null;
				if (touch !== null) {
					var newX = touch.clientX - diffX;
					var newY = touch.clientY - diffY;
					VisibleConsole._move (newX, newY);
				}
			};

			document.ontouchend = VisibleConsole._stop;
		}
	};

	VisibleConsole._startResizing = function (evt) {
		evt = evt || window.event;

		// Don't track right-clicks
		if ((evt.keyCode || evt.which) == 3) return;

		VisibleConsole._stopDefault(evt);

		var posX = evt.clientX;
		var posY = evt.clientY;
		var divTop = Number(VisibleConsole.el.console.style.top.replace('px',''));
		var divLeft = Number(VisibleConsole.el.console.style.left.replace('px',''));

		document.onmousemove = function(evt) {
			evt = evt || window.event;
			VisibleConsole._stopDefault(evt);
			var newW = evt.clientX - divLeft;
			var newH = evt.clientY - divTop;
			VisibleConsole._resize(newW, newH);
		};
		document.onmouseup = VisibleConsole._stop;
	};

	VisibleConsole._startTouchResizing = function (evt) {
		evt = evt || window.event;
		VisibleConsole._stopDefault(evt);

		var touch = (typeof (evt.touches) !== 'undefined') ? evt.touches[0] : null;
		if (touch !== null) {
			var posX = touch.clientX;
			var posY = touch.clientY;
			var divTop = Number(VisibleConsole.el.console.style.top.replace('px',''));
			var divLeft = Number(VisibleConsole.el.console.style.left.replace('px',''));

			document.ontouchmove = function(evt) {
				evt = evt || window.event;
				VisibleConsole._stopDefault(evt);
				var touch = (typeof (evt.touches) !== 'undefined') ? evt.touches[0] : null;
				if (touch !== null) {
					var newW = touch.clientX - divLeft;
					var newH = touch.clientY - divTop;
				}
				VisibleConsole._resize(newW, newH);
			};
			document.ontouchend = VisibleConsole._stop;
		}
	};


	VisibleConsole._stopDefault = function (evt) {
		evt = evt || window.event;
		if (evt && evt.preventDefault) {
			evt.preventDefault();
		}
		else {
			window.event.returnValue = false;
		}
		return false;
	};

	VisibleConsole._keyPress = function (evt) {
		evt = evt || window.event;
        var keyCode = evt ? (evt.which ? evt.which : evt.keyCode) : event.keyCode;
        if (keyCode == 13) {
        	var theCode = event.target.value;
            event.target.value = "";
            eval(theCode);
        }
        else
            return true;
    };


	window.VisibleConsole = VisibleConsole;

})(window, document, navigator);

