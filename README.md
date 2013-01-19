# visibleconsole.js #
- - - - -

Current Stable Version: v0.4.1

Sometimes you need to see the contents of the console when you don't have access to it. Maybe you're working on an iPad, or a set-top-box, or maybe you've got a need nobody anticipated. This will output the contents of the console to a visible element in your markup.

## Example ##

Take a look at a working example [here](http://jamestomasino.github.com/visibleconsole.js/).


## Usage ###

Include visibleconsole.js in your project. It is recommended that you include your script tag after the body as it will not block your content from loading, and also, VisibleConsole requires access to your `<body>` tag to function and will throw an error if you try to activate it before that element exists.

	<script src="visibleconsole.js"></script>

### Enable VisibleConsole ####

Call the enable method of VisibleConsole to turn it on.

	VisibleConsole.enable();

*Console logs will only be captured to VisibleConsole after it is enabled.*


### Disable VisibleConsole ####

Call the disable method of VisibleConsole to turn it off.

	VisibleConsole.disable();


Both all created markup will be removed from your DOM and console operations will be returned to the browser's window.console.log.

### Capture Logs While Disabled (Passively) ###

Call the enablePassiveLogging method of VisibleConsole to turn on this feature.

	VisibleConsole.enablePassiveLogging();
	
Logs will be captured and maintained even while the VisibleConsole is not visible. When the VisibleConsole is later enabled, you will see all of these logs.

### Stop Capturing Logs Passively ###

Call the disablePassiveLogging method.

	VisibleConsole.disablePassiveLogging();

### Input and Execute Code Interactively ###

Tapping or clicking on the input bar at the bottom of the console will allow you to enter JavaScript commands and eval them, just like in a normal console. Type your command and press `Enter` to execute the line.

### Style ####

VisibleConsole [creates a number of elements in your DOM](#Structure) that can be styled with CSS. The included [stylesheet](https://github.com/jamestomasino/visibleconsole.js/blob/master/style.css) shows a full-featured starting point for your customization.

### Structure ###

When VisibleConsole is enabled, the following elements are added to the end of your DOM.


	<div id="visibleconsole">
	<div id="visibleconsoleheader">~VisibleConsole~</div>
		<div id="visibleconsoleinner">
			<div id="visibleconsolecontainer">
				<div id="visibleconsoleoutput"></div>
				<input id="visibleconsoleinput"></input>
			</div>
		</div>
		<div id="visibleconsolehandle"></div>
	</div>


Messages logged to the console will have the class `visibleconsolemessage`.

Errors logged to the console will have the class `visibleconsoleerror` inside of `visibleconsolemessage`.

For example:

	<div id="visibleconsoleoutput">
    	<span class="visibleconsolemessage">Hello World.</span>
	    <span class="visibleconsolemessage">
    	    <span class="visibleconsoleerror">
        	    [ERROR] Uncaught ReferenceError: Example Error (index.html Line: 1)
	        </span>
    	</span>
	</div>


*If an element already exists in your DOM with the same ID as one in this structure, VisibleConsole will leverage your existing element. In this way, by manually creating your own structure, you can completely change the way the VisibleConsole is displayed.*

### History ###

##### v0.4 #####

* Optimized logging code via document.createElement and appendChild instead of innerHTML
* Center on screen on startup
* Removed iFrame hack for restoring console. Console logs and errors pass through to browser properly now.
* Passive logging enabled (track logs while VisibleConsole is not enabled)
* "clear" command will clear the console
* Up/Down arrow keys cycle through console input history


##### v0.3 #####

* Touch events for drag & resize
* Input bar added

##### v0.2 #####

* Created Demo page
* Cross-browser functionality and styles

 


### Dependencies ###

None!

This project is a proud supporter of [vanilla.js](http://vanilla-js.com/).