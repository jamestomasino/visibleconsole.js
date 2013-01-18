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
	VisibleConsole.outputContent;

	// DOM Elements & Struct
	VisibleConsole.consoleEl;
		VisibleConsole.headerEl;
		VisibleConsole.consoleInnerEl;
			VisibleConsole.consoleContainerEl;
				VisibleConsole.consoleOutputEl;
				VisibleConsole.consoleInputEl;
		VisibleConsole.handleEl;


	// Static psudo-privates
	VisibleConsole._isEnabled = false;

	VisibleConsole.enable = function () {

		if (VisibleConsole._isEnabled === false) {
			VisibleConsole._isEnabled = true;

			// Prepare #console element
			VisibleConsole.consoleEl = document.getElementById('visibleconsole');
			if ( !VisibleConsole.consoleEl )  {
				VisibleConsole.consoleEl = document.createElement('div');
				VisibleConsole.consoleEl.id = 'visibleconsole';
				document.body.appendChild(VisibleConsole.consoleEl);
			}

			// add the draggable header div
			VisibleConsole.headerEl = document.getElementById('visibleconsoleheader');
			if ( !VisibleConsole.headerEl ) {
				VisibleConsole.headerEl = document.createElement('div');
				VisibleConsole.headerEl.id = 'visibleconsoleheader';
				VisibleConsole.headerEl.innerHTML = '~VisibleConsole~';
				VisibleConsole.headerEl.onmousedown = VisibleConsole._startMoving;
				VisibleConsole.headerEl.ontouchstart = VisibleConsole._startTouchMoving;
				document.getElementById('visibleconsole').appendChild(VisibleConsole.headerEl);
			}

			// add the console inner div
			VisibleConsole.consoleInnerEl = document.getElementById('visibleconsoleinner');
			if ( !VisibleConsole.consoleInnerEl )  {
				VisibleConsole.consoleInnerEl = document.createElement('div');
				VisibleConsole.consoleInnerEl.id = 'visibleconsoleinner';
				document.getElementById('visibleconsole').appendChild(VisibleConsole.consoleInnerEl);
			}

			// add the visible output container div
			VisibleConsole.consoleContainerEl = document.getElementById('visibleconsolecontainer');
			if ( !VisibleConsole.consoleContainerEl )  {
				VisibleConsole.consoleContainerEl = document.createElement('div');
				VisibleConsole.consoleContainerEl.id = 'visibleconsolecontainer';
				document.getElementById('visibleconsoleinner').appendChild(VisibleConsole.consoleContainerEl);
			}

			// add the visible output div
			VisibleConsole.consoleOutputEl = document.getElementById('visibleconsoleoutput');
			if ( !VisibleConsole.consoleOutputEl )  {
				VisibleConsole.consoleOutputEl = document.createElement('div');
				VisibleConsole.consoleOutputEl.id = 'visibleconsoleoutput';
				document.getElementById('visibleconsolecontainer').appendChild(VisibleConsole.consoleOutputEl);
			}

			// add the input
			VisibleConsole.consoleInputEl = document.getElementById('visibleconsoleinput');
			if ( !VisibleConsole.consoleInputEl )  {
				VisibleConsole.consoleInputEl = document.createElement('input');
				VisibleConsole.consoleInputEl.id = 'visibleconsoleinput';
				VisibleConsole.consoleInputEl.onkeypress = VisibleConsole._keyPress;
				document.getElementById('visibleconsolecontainer').appendChild(VisibleConsole.consoleInputEl);
			}

			// add the resize handle div
			VisibleConsole.handleEl = document.getElementById('visibleconsolehandle');
			if ( !VisibleConsole.handleEl )  {
				VisibleConsole.handleEl = document.createElement('div');
				VisibleConsole.handleEl.id = 'visibleconsolehandle';
				VisibleConsole.handleEl.onmousedown = VisibleConsole._startResizing;
				VisibleConsole.handleEl.ontouchstart = VisibleConsole._startTouchResizing;
				document.getElementById('visibleconsole').appendChild(VisibleConsole.handleEl);
				var handleWidth = VisibleConsole.handleEl.offsetWidth;
				var handleHeight = VisibleConsole.handleEl.offsetHeight;
				VisibleConsole.handleEl.appendChild(VisibleConsole._createline(handleWidth + 1, handleHeight - 5, handleWidth - 4, handleHeight));
				VisibleConsole.handleEl.appendChild(VisibleConsole._createline(handleWidth + 1, handleHeight - 11, handleWidth - 10, handleHeight));
			}

			// Store for disable
			VisibleConsole.browserFallbackConsole = window.console;

			// Ouput to #visibleconsole
			window.console = {
				log: function () {

					var outputWrapper = VisibleConsole._createLogMessage( arguments );

					VisibleConsole.consoleOutputEl.appendChild(outputWrapper);
					VisibleConsole.consoleOutputEl.scrollTop = VisibleConsole.consoleOutputEl.scrollHeight;

					if ( VisibleConsole.browserFallbackConsole.log ) VisibleConsole.browserFallbackConsole.log.apply ( VisibleConsole.browserFallbackConsole, arguments );
				}
			};

			window.onerror = function (msg, url, linenumber) {
				var outputWrapper = VisibleConsole._createErrorMessage ( msg, url, linenumber );
				VisibleConsole.consoleOutputEl.appendChild(outputWrapper);
				VisibleConsole.consoleOutputEl.scrollTop = VisibleConsole.consoleOutputEl.scrollHeight;
				return false;
			};

			VisibleConsole._resize();
			VisibleConsole._move();
		}
	};

	VisibleConsole.disable = function () {
		if (VisibleConsole._isEnabled === true) {
			VisibleConsole._isEnabled = false;

			window.console = VisibleConsole.browserFallbackConsole;

			VisibleConsole.consoleEl.parentNode.removeChild(VisibleConsole.consoleEl);
			VisibleConsole.consoleEl = null;
		}
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
			var wholeConsoleHeight = VisibleConsole.consoleInnerEl.offsetHeight;
			var wholeConsoleWidth = VisibleConsole.consoleInnerEl.offsetWidth;
			xpos = (width >> 1) - (wholeConsoleWidth >> 1);
			ypos = (height >> 1) - (wholeConsoleHeight >> 1);
		}

		VisibleConsole.consoleEl.style.left = Math.max(xpos,0) + 'px';
		VisibleConsole.consoleEl.style.top = Math.max(ypos,0) + 'px';
	};

	VisibleConsole._resize = function (w, h) {
		if (typeof w !== "undefined" && typeof h !== "undefined") {
			VisibleConsole.consoleEl.style.pixelWidth = w;
			VisibleConsole.consoleEl.style.pixelHeight = h;
			VisibleConsole.consoleEl.style.width = w + 'px';
			VisibleConsole.consoleEl.style.height = h + 'px';
		}
		var wholeConsoleHeight = VisibleConsole.consoleInnerEl.offsetHeight;
		var	headerHeight = VisibleConsole.headerEl.offsetHeight;
		var inputHeight = VisibleConsole.consoleInputEl.offsetHeight;
		var contentHeight = (wholeConsoleHeight - headerHeight - inputHeight);
		VisibleConsole.consoleOutputEl.style.height = contentHeight + 'px';
	};

	VisibleConsole._startMoving = function (evt) {
		evt = evt || window.event;

		// Don't track right-clicks
		if ((evt.keyCode || evt.which) == 3) return;

		VisibleConsole._stopDefault(evt);

		var posX = evt.clientX;
		var posY = evt.clientY;
		var divTop = Number(VisibleConsole.consoleEl.style.top.replace('px',''));
		var divLeft = Number(VisibleConsole.consoleEl.style.left.replace('px',''));
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
			var divTop = Number(VisibleConsole.consoleEl.style.top.replace('px',''));
			var divLeft = Number(VisibleConsole.consoleEl.style.left.replace('px',''));
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
		var divTop = Number(VisibleConsole.consoleEl.style.top.replace('px',''));
		var divLeft = Number(VisibleConsole.consoleEl.style.left.replace('px',''));

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
			var divTop = Number(VisibleConsole.consoleEl.style.top.replace('px',''));
			var divLeft = Number(VisibleConsole.consoleEl.style.left.replace('px',''));

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

