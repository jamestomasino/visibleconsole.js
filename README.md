# visibleconsole.js #
- - - - -

Sometimes you need to see the contents of the console when you don't have access to it. Maybe you're working on an iPad, or a set-top-box, or maybe you've got a need nobody anticipated. This will output the contents of the console to a visible element in your markup.

## Example ##

Take a look at a working example [here](http://jamestomasino.github.com/visibleconsole.js/).


## Usage ###

Include visibleconsole.js in your project. It is recommended that you include your script tag after the body as it will not block your content from loading, and also, VisibleConsole requires access to your `<body>` tag to function and will throw an error if you try to activate it before that element exists.

```html
<script src="visibleconsole.js"></script>
```

### To Enable ####

Call the enable method of VisibleConsole to turn it on. 

```javascript
VisibleConsole.enable();
```
    
*Console logs will only be captured to VisibleConsole after it is enabled.*
    
    
### To Disable ####

Call the disable method of VisibleConsole to turn it off.

```javascript
VisibleConsole.disable();
```
    
Both all created markup will be removed from your DOM and console operations will be returned to the browser's window.console.log.
    
### To Style ####

VisibleConsole [creates a number of elements in your DOM](#Structure) that can be styled with CSS. The included [stylesheet](https://github.com/jamestomasino/visibleconsole.js/blob/master/style.css) shows a full-featured starting point for your customization.

### Structure ###

When VisibleConsole is enabled, the following elements are added to the end of your DOM.

```html
<div id="visibleconsole">
<div id="visibleconsoleheader">~VisibleConsole~</div>
	<div id="visibleconsoleinner">
		<div id="visibleconsolecontainer">
			<div id="visibleconsoleoutput"></div>
		</div>
	</div>
	<div id="visibleconsolehandle"></div>
</div>
<iframe style="display: none;" id="visibleconsoleiframe"></iframe>
```

Messages logged to the console will have the class `visibleconsolemessage`.

Errors logged to the console will have the class `visibleconsoleerror` inside of `visibleconsolemessage`.

For example:

```html
<div id="visibleconsoleoutput">
    <span class="visibleconsolemessage">Hello World.</span>
    <span class="visibleconsolemessage">
        <span class="visibleconsoleerror">
            [ERROR] Uncaught ReferenceError: Example Error (index.html Line: 1)
        </span>    
    </span>
</div>
```

The iFrame with an id of `#visibleconsoleiframe` is used to maintain ongoing normal console operations, and is leveraged until you disable visibleconsole.js.

*If an element already exists in your DOM with the same ID as one in this structure, VisibleConsole will leverage your existing element. In this way, by manually creating your own structure, you can completely change the way the VisibleConsole is displayed.*


### Dependencies ###

None! 

This project is a proud supporter of [vanilla.js](http://vanilla-js.com/).