# visibleconsole.js #
- - - - -

## Usage ###

Include visibleconsole.js in your project.

### To Enable ####

    VisibleConsole.enable();
    
If there is an element with the name #visibleconsole, visibleconsole.js will use it for the output of all future console.log calls. If no #visibleconsole element exists, it will create one at the bottom of your body.

It will also create an iFrame with an id of #visibleconsoleiframe. This is used to maintain ongoing normal console operations, and is leveraged if you disable visibleconsole.js.
    
### To Disable ####

    VisibleConsole.disable();
    
Both #console and #visibleconsoleiframe will be removed from markup and console operations will be returned to the browser's window.console.log.
    
### To Style ####

Target the #visibleconsole element like this:

    #visibleconsole {
	    margin: 20px;
	    padding: 10px;
    	border: 1px solid red;
	    white-space: pre;
    	font-family: Consolas, Monaco, "Courier New", Courier, monospace;
    }
