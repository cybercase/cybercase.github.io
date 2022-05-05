---
title: "Keyboard Shortcuts and Layouts in the Browser"
description: "Defining layout independent keyboard shortcuts in the browser"
coverImage: "/images/keyboard.png"
coverTitle: "Keyboard Shortcuts and Layouts in the Browser"
coverDark: true
date: "2017-05-22T00:00:01.000Z"
---

Current DOM specification provides 2 event types for handling keyboard actions<sup>[[1]](#keypress)</sup>:

- `keydown`
- `keyup`

These events match the physical actions of pressing and releasing a key of the keyboard, and have a payload with the
result of _keymapping_<sup>[[2]](#keymapping)</sup> by the OS (or any software in between), taking into account current _layout_, modifier and dead keys.

The result of _keymapping_ is stored in the `key` property of the event according to the _key algorithm_<sup>[[3]](#keyproperty)</sup>.
The pressing of a specific key can be caught just by listening for `keydown` and checking the `key` prop. e.g.

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
Modifiers like `Meta` or `Ctrl` usually don't have the purpose of altering the unicode produced by a key,
so it's easy to define and catch a shortcut combination using the modifiers props stored in the event payload. e.g.

    let shortcutHandler = (event) => {
        // Shortcut: Meta+c
        if (event.key === 'c' && event.metaKey === true) {
            // The famous "Copy" shortcut on macOS
            console.log('"Meta+c" pressed')
        }
    }

On the other hand `Alt` and `Shift` modifiers may alter the unicode produced by a key, leading to issues in shortcut definition and catching. e.g.

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
The new definition considers the effect produced from the `Shift` modifier, making the code work just fine. e.g.

    let shortcutHandler = (event) => {
        // Shortcut: Meta+Shift+S
        if (event.key === 'S' && event.metaKey === true && event.shiftKey) {
            // The Normalized "Save All" shortcut
            console.log('"Meta+Shift+S" pressed')

            // This works as expected
        }
    }

Let's call **Normalization** the action of replacing of the
character key in a keyboard shortcut, with the unicode produced from the same character key plus the modifiers in the shortcut.

## Layouts

Normalization falls short when considering multiple layouts; in fact it's layout dependant. e.g.:

- Normalization<sub>US</sub> for `Meta + Shift + 2` is `Meta + Shift + @`
- Normalization<sub>IT</sub> for `Meta + Shift + 2` is `Meta + Shift + "`
- Normalization<sub>FR</sub> for `Meta + Shift + 2` is `Meta + Shift + 2`.

This limits the Normalization effectiveness to just the shortcuts that use a character key for which its modified unicode char, according to the shortcut modifiers, is the same across every layout.
Let's call these shortcuts _layout-safe_. e.g.:

- Any lowercase [a-z] letter plus the `Shift` modifier should produce the uppercase version of that letter in every layout.

## Recap

When definining shortcuts for the browsers and multiple layouts it's worth considering that:

- Browsers and OS catch shortcuts too; be aware of collisions.
- Browsers don't provide an API for knowing the current layout.
- Some key may not be available on some layouts or may require additional modifiers to produce the same character.
- If the shortcut contains a character key, modifiers may change the unicode emitted by the `keydown` in an unpredictable way.

## Workaround Ideas

### Catch 'Em All

Given a shortcut, the idea is to collect its Normalization for every layout and listening for all of them.

    let shortcutHandler = (event) => {
        if ((event.key === '2' && event.metaKey === true && event.shiftKey) ||
            (event.key === '"' && event.metaKey === true && event.shiftKey) ||
            (event.key === '@' && event.metaKey === true && event.shiftKey)) {
            // This catches the "Meta+Shift+2" on US, IT, and FR layouts
            console.log('"Meta+Shift+2" pressed')
        }
    }

The obvious problem is that every shortcut ends up producing a set of Normalized shortcuts, and if the interesection of these sets is not empty it's impossible to choose which shortcut was triggered. e.g.

1. Normalization<sub>[US, IT]</sub> for `Meta+Shift+=` is [`Meta+Shift++`, `Meta+Shift+*`]
2. Normalization<sub>[US, IT]</sub> for `Meta+Shift+8` is [`Meta+Shift+*`, `Meta+Shift+(`]

Clearly `Meta+Shift+*` falls into the intersection, making impossible to know if the source is `Meta+Shift+=` on IT layout or `Meta+Shift+8` on US layout.

### Just Ask

The application can infere the keyboard layout using language and location of the browser. Then the Normalization function for such layout is used for catching shortcuts unambiguosly.

### Recovering Numbers

Shortcuts with number keys plus modifiers are not _layout-safe_.
However, the number keys position on the physical layout should be the same for most of Latin script layouts [[6]](#latinscript).
Using the `code` property of `keydown` event [[5]](#keycode), should be possible to check for numeric keys without ambiguity,
as the `code` property returns the keycode before keymapping is applied.

    let shortcutHandler = (event) => {
        if (event.code === 'Digit2' && event.metaKey === true && event.shiftKey) {
            // This also catches "Meta+Shift+2" on Latin Script based layouts
            console.log('"Meta+Shift+2" pressed')
        }
    }

### Further readings

- Internationalize your keyboard controls by Julien Wajsberg, Mozilla Hacks, <a href="https://hacks.mozilla.org/2017/03/internationalize-your-keyboard-controls/" target="_blank">https://hacks.mozilla.org/2017/03/internationalize-your-keyboard-controls/</a>
- Can I Use KeyboardEvent.key, Can I Use, <a target="_blank" href="https://caniuse.com/#feat=keyboardevent-key">https://caniuse.com/#feat=keyboardevent-key</a>
- Can I Use KeyboardEvent.code, Can I Use, <a target="_blank" href="https://caniuse.com/#feat=keyboardevent-code">https://caniuse.com/#feat=keyboardevent-code</a>

### References

1. Keypress Event Types - DOM 3 Level Specifications, W3C, <a href="https://www.w3.org/TR/DOM-Level-3-Events/#events-keyboard-types" target="_blank" id="keypress">https://www.w3.org/TR/DOM-Level-3-Events/#events-keyboardevents</a>
2. Key Mapping, W3C, <a href="https://www.w3.org/TR/DOM-Level-3-Events/#key-mapping" target="_blank" id="keymapping">https://www.w3.org/TR/DOM-Level-3-Events/#key-mapping</a>
3. `key` Property of KeyboardEvent, W3C, <a href="https://www.w3.org/TR/DOM-Level-3-Events/#key-algorithm" target="_blank" id="keyproperty">https://www.w3.org/TR/DOM-Level-3-Events/#key-algorithm</a>
4. Modifier Key, Wikipedia, <a href="https://en.wikipedia.org/wiki/Modifier_key" target="_blank" id="modifier">https://en.wikipedia.org/wiki/Modifier_key</a>
5. Key Codes, W3C, <a href="https://www.w3.org/TR/DOM-Level-3-Events/#keys-codevalues" target="_blank" id="keycode">https://www.w3.org/TR/DOM-Level-3-Events/#keys-codevalues</a>
6. QWERTY-based layouts for Latin script, Keyboard Layout, Wikipedia, <a href="https://en.wikipedia.org/wiki/Keyboard_layout#QWERTY-based_layouts_for_Latin_script" target="_blank" id="latinscript">https://en.wikipedia.org/wiki/Keyboard_layout#QWERTY-based_layouts_for_Latin_script</a>

_-- 22/05/2017_
