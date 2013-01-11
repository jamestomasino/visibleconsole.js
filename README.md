# visibleconsole.js #
- - - - -

Sometimes you need to see the contents of the console in places that aren't, well, the console. Maybe you're working on an iPad, or maybe you've got a need nobody anticipated. This will output the contents of the console to a visible element in your markup.

## Usage ###

Include visibleconsole.js in your project.

### Example ###

Take a look at a working example [here](example/example.html).

### To Enable ####

    VisibleConsole.enable();
    
*Console logs will only be captured to VisibleConsole after it is enabled.*
    
If there is an element with the name `#visibleconsole`, visibleconsole.js will use it for the output of all future console.log calls. If no `#visibleconsole` element exists, it will create one at the bottom of your body.

It will also create an iFrame with an id of `#visibleconsoleiframe`. This is used to maintain ongoing normal console operations, and is leveraged until you disable visibleconsole.js.
    
### To Disable ####

    VisibleConsole.disable();
    
Both `#visibleconsole` and `#visibleconsoleiframe` will be removed from markup and console operations will be returned to the browser's window.console.log.
    
### To Style ####

VisibleConsole creates an element with the id: `#visibleconsole`. The example stylesheet shows a method of styling this div.


### Dependencies ###

None. This project is a proud supporter of [vanilla.js](http://vanilla-js.com/).