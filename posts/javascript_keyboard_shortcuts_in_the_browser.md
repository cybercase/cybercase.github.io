---
title: "Keyboard Shortcuts and Layouts in the Browser"
description: "Defining layout independent keyboard shortcuts in the browser"
coverImage: "/images/keyboard.png"
coverTitle: "Keyboard Shortcuts and Layouts in the Browser"
coverDark: true
date: "2017-05-22T00:00:01.000Z"
---

The current DOM specification provides two event types for handling keyboard actions<sup>[[1]](#keypress)</sup>:

- `keydown`
- `keyup`

These events match the physical actions of pressing and releasing a key, and carry a payload with the
result of _keymapping_<sup>[[2]](#keymapping)</sup> by the OS (or any software in between), taking into account current _layout_, modifier and dead keys.

The result of _keymapping_ is stored in the `key` property of the event according to the _key algorithm_<sup>[[3]](#keyproperty)</sup>.
You can catch the press of a specific key just by listening for `keydown` and checking the `key` property. For example:

    let shortcutHandler = (event) => {
        // Shortcut: l
        if (event.key === 'l') {
            // Simplest case; Facebook use the same shortcut to like items in the feed.
            console.log('"l" is pressed')
        }
    }

    document.addEventListener('keydown', shortcutHandler)

## Modifiers

Keyboard shortcuts may require the combination of a character key and one or more modifiers<sup>[[4]](#modifier)</sup>.
Modifiers like `Meta` or `Ctrl` usually don't alter the character produced by a key,
so it's easy to define and catch a shortcut using the modifier properties of the event. For example:

    let shortcutHandler = (event) => {
        // Shortcut: Meta+c
        if (event.key === 'c' && event.metaKey === true) {
            // The famous "Copy" shortcut on macOS
            console.log('"Meta+c" pressed')
        }
    }

On the other hand, the `Alt` and `Shift` modifiers may alter the character produced by a key, which causes problems when defining and catching shortcuts. For example:

    let shortcutHandler = (event) => {
        // Shortcut: Meta+Shift+s
        if (event.key === 's' && event.metaKey === true && event.shiftKey) {
            // The "Save All" shortcut
            console.log('"Meta+Shift+s" pressed')

            // WARNING
            // This won't work becase the "Shift" modifier change the unicode
            // of "S" key from "s" (lowercase) to "S" (uppercase)
        }
    }

## Normalization

Fixing the previous example is trivial: just replace the lowercase "s" with the uppercase "S" in the shortcut definition.
The new definition takes into account the effect of the `Shift` modifier, and the code works just fine:

    let shortcutHandler = (event) => {
        // Shortcut: Meta+Shift+S
        if (event.key === 'S' && event.metaKey === true && event.shiftKey) {
            // The Normalized "Save All" shortcut
            console.log('"Meta+Shift+S" pressed')

            // This works as expected
        }
    }

Let's call **Normalization** the act of replacing the
character key in a keyboard shortcut with the character produced by the same key plus the shortcut's modifiers.

## Layouts

Normalization falls short when you consider multiple layouts, because it's layout-dependent. For example:

- Normalization<sub>US</sub> for `Meta + Shift + 2` is `Meta + Shift + @`
- Normalization<sub>IT</sub> for `Meta + Shift + 2` is `Meta + Shift + "`
- Normalization<sub>FR</sub> for `Meta + Shift + 2` is `Meta + Shift + 2`.

This limits Normalization to shortcuts whose character key, combined with the shortcut's modifiers, produces the same character in every layout.
Let's call these shortcuts _layout-safe_. For example:

- Any lowercase [a-z] letter plus the `Shift` modifier should produce the uppercase version of that letter in every layout.

## Recap

When defining shortcuts for the browser and for multiple layouts, keep in mind that:

- Browsers and OS catch shortcuts too; be aware of collisions.
- Browsers don't provide an API for knowing the current layout.
- Some keys may not be available on some layouts or may require additional modifiers to produce the same character.
- If the shortcut contains a character key, modifiers may change the character reported by `keydown` in an unpredictable way.

## Workaround Ideas

### Catch 'Em All

Given a shortcut, the idea is to collect its Normalization for every layout and listen for all of them.

    let shortcutHandler = (event) => {
        if ((event.key === '2' && event.metaKey === true && event.shiftKey) ||
            (event.key === '"' && event.metaKey === true && event.shiftKey) ||
            (event.key === '@' && event.metaKey === true && event.shiftKey)) {
            // This catches the "Meta+Shift+2" on US, IT, and FR layouts
            console.log('"Meta+Shift+2" pressed')
        }
    }

The obvious problem is that every shortcut ends up producing a set of Normalized shortcuts, and if these sets intersect, it's impossible to tell which shortcut was triggered. For example:

1. Normalization<sub>[US, IT]</sub> for `Meta+Shift+=` is [`Meta+Shift++`, `Meta+Shift+*`]
2. Normalization<sub>[US, IT]</sub> for `Meta+Shift+8` is [`Meta+Shift+*`, `Meta+Shift+(`]

Clearly `Meta+Shift+*` falls into the intersection, making it impossible to know whether the source is `Meta+Shift+=` on IT layout or `Meta+Shift+8` on US layout.

### Just Ask

The application can infer the keyboard layout from the browser's language and location, and then use the Normalization function for that layout to catch shortcuts unambiguously.

### Recovering Numbers

Shortcuts with number keys plus modifiers are not _layout-safe_.
However, the position of the number keys should be the same in most Latin-script layouts<sup>[[5]](#latinscript)</sup>.
Using the `code` property of the `keydown` event<sup>[[6]](#keycode)</sup>, it should be possible to check for number keys without ambiguity,
since `code` identifies the physical key, before keymapping is applied.

    let shortcutHandler = (event) => {
        if (event.code === 'Digit2' && event.metaKey === true && event.shiftKey) {
            // This also catches "Meta+Shift+2" on Latin Script based layouts
            console.log('"Meta+Shift+2" pressed')
        }
    }

### Further readings

- Internationalize your keyboard controls by Julien Wajsberg, Mozilla Hacks, [https://hacks.mozilla.org/2017/03/internationalize-your-keyboard-controls/](https://hacks.mozilla.org/2017/03/internationalize-your-keyboard-controls/)
- Can I Use KeyboardEvent.key, Can I Use, [https://caniuse.com/#feat=keyboardevent-key](https://caniuse.com/#feat=keyboardevent-key)
- Can I Use KeyboardEvent.code, Can I Use, [https://caniuse.com/#feat=keyboardevent-code](https://caniuse.com/#feat=keyboardevent-code)

### References

1. <span id="keypress">Keypress Event Types - DOM 3 Level Specifications, W3C</span>, [https://www.w3.org/TR/DOM-Level-3-Events/#events-keyboard-types](https://www.w3.org/TR/DOM-Level-3-Events/#events-keyboard-types)
2. <span id="keymapping">Key Mapping, W3C</span>, [https://www.w3.org/TR/DOM-Level-3-Events/#key-mapping](https://www.w3.org/TR/DOM-Level-3-Events/#key-mapping)
3. <span id="keyproperty">`key` Property of KeyboardEvent, W3C</span>, [https://www.w3.org/TR/DOM-Level-3-Events/#key-algorithm](https://www.w3.org/TR/DOM-Level-3-Events/#key-algorithm)
4. <span id="modifier">Modifier Key, Wikipedia</span>, [https://en.wikipedia.org/wiki/Modifier_key](https://en.wikipedia.org/wiki/Modifier_key)
5. <span id="latinscript">QWERTY-based layouts for Latin script, Keyboard Layout, Wikipedia</span>, [https://en.wikipedia.org/wiki/Keyboard_layout#QWERTY-based_layouts_for_Latin_script](https://en.wikipedia.org/wiki/Keyboard_layout#QWERTY-based_layouts_for_Latin_script)
6. <span id="keycode">Key Codes, W3C</span>, [https://www.w3.org/TR/DOM-Level-3-Events/#keys-codevalues](https://www.w3.org/TR/DOM-Level-3-Events/#keys-codevalues)

_-- 22/05/2017_