---
title: "The Web MiniDisc Application - Use your old NetMD device in the browser"
description: "Get control of your MiniDisc device thanks to WebUSB and WASM"
coverImage: "/images/minidisc.jpg"
coverTitle: "The Web MiniDisc App"
coverSubtitle: "Bringing the MiniDisc back to life with WebUSB and WASM"
coverDark: true
date: "2020-03-26T05:35:07.322Z"
---

If you've never heard of the MiniDisc don't worry, you're not alone.

If you're curious, you can catch up by reading the [Wikipedia page](https://en.wikipedia.org/wiki/MiniDisc),
or the old community portal [minidisc.org](https://www.minidisc.org/), or interact with the reddit community of [/r/minidisc](https://reddit.com/r/minidisc).

If you're not, long story short, it's a dead music format released by Sony in the early '90s, and slowly killed
by the popularity of the many MP3 players that started coming out in the early 2000s.

Some of the last MiniDisc players, branded as _NetMD_ units, were equipped with a USB port that allowed for recording music onto the device using the infamous SonicStage software (Windows only, of course).
When Sony abandoned the MiniDisc, that software was left unmaintained and, nowadays, it can't run outside virtual machines or without using dangerously unsigned drivers.

Luckily the OSS community managed to completely reverse engineer the NetMD protocol and, before the death of the MiniDisc, the [linux-minidisc](https://wiki.physik.fu-berlin.de/linux-minidisc/doku.php) project was released.

A few weeks ago, just before the coronavirus lockdown here in Italy, I was lucky enough to find my old [MZ-N710](https://www.minidisc.org/part_Sony_MZ-N710.html) in my parents' basement.
Determined to make it work on my Macbook, I brought it home and successfully managed to compile and run the linux-minidisc CLI.

## Porting the MiniDisc to Web

Uploading music with the CLI took two steps:

1. Convert your music

- Use `ffmpeg` <sup>[[1]](#ffmpeg)</sup> to create a 16bit 44100Hz pcm wav file (SP quality)
- Use `atracdenc` <sup>[[2]](#atracdenc)</sup> to create a 132/66 Kbit ATRAC3 file (LP2/LP4 quality)

2. Use the CLI to send the converted music to the device

Not the most _user-friendly_ process for those who don't fancy typing commands in a terminal.

So, after pondering for a while, I realized these steps could be wrapped in a _no-install-required_
progressive web app, for a considerable step up in the ease of the process.

I would just use:

- **WebUSB**<sup>[[8]](#webusb)</sup> to replace the CLI for communicating with the NetMD device
- **emscripten**<sup>[[9]](#emscripten)</sup> to bring `ffmpeg` and `atracdenc` into the browser
- **React**<sup>[[10]](#reacjs)</sup> to create a simple UI

### 1. Writing a library

I started by porting the code from linux-minidisc to a new JS library that I've now published on npm, called `netmd-js`<sup>[[3]](#netmdjs)</sup>.

This library implements the NetMD protocol and takes care of the USB communication with the device.
It will also allow other devs to write their own app, should mine not suit their needs.

It runs both in Node.js and in every browser that supports the WebUSB standard, and uses _Worker Threads_<sup>[[4]](#workerthreads)</sup> or
_Web Workers_<sup>[[5]](#webworkers)</sup> to speed up the
music encryption step required by the protocol. The encryption has been implemented on top of _CryptoJS_<sup>[[6]](#cryptojs)</sup>.

### 2. Using emscripten

I was lucky enough to find a project called `ffmpeg.js`<sup>[[7]](#ffmpegjs)</sup> that already ported ffmpeg to WASM.
So, the only thing left to do was to configure it properly and recompile it, to trim down the binary size.
A full tutorial is available in the GitHub page of `ffmpeg.js`.

Then I followed a similar process to cross-compile the `atracdenc` encoder, and wrote a simple JS wrapper around it.

### 3. The Web MiniDisc Application

With all the building blocks in place, I shifted my focus to designing the app's user interface and experience.

<div class="mtop-1-m mtop-1-d line-21-d" style="text-align: center;">
    <img src="/images/webminidiscapp.png" alt="Web MiniDisc App Wireframe" style="width: 100%;"/>
</div>

> _A dead simple user experience_

Then I started off with the classic _create react app + TypeScript_ template, and added _redux_ and _material-ui_ components... a _no-frills_ setup.

## How to use a NetMD device in 2020

A couple of nights later I was ready to record the first demo of the Web MiniDisc Application.

It was exciting to see the app work seamlessly both on my Macbook and on my Android phone without an `if` needed.

<iframe class="line-17-d line-11-m" src="//www.youtube.com/embed/Frs8qhw0g9Y" frameborder="0" allowfullscreen></iframe>

### Public launch

Honestly, there aren't many places to launch a MiniDisc app in 2020 :)<br/>
It's a pretty tiny niche.

However, I have been lurking for some time in [/r/minidisc](https://www.reddit.com/r/minidisc/) and decided to start from there.
[The feedback was great](https://www.reddit.com/r/minidisc/comments/fn4acd/web_minidisc_application/), and people even responded with a few bug reports and feature requests.

### Links

If you're a lucky owner of a NetMD device, you can try the app yourself at

[https://stefano.brilli.me/webminidisc/](https://stefano.brilli.me/webminidisc/)

Or, if you just want to browse the code, everything's available on GitHub.

[https://github.com/cybercase/webminidisc](https://github.com/cybercase/webminidisc)

### References

1. <span id="ffmpeg">FFmpeg</span>, [https://ffmpeg.org/](https://ffmpeg.org/)
2. <span id="atracdenc">atracdenc</span>, [https://github.com/dcherednik/atracdenc](https://github.com/dcherednik/atracdenc)
3. <span id="netmdjs">netmd-js</span>, [https://github.com/cybercase/netmd-js](https://github.com/cybercase/netmd-js)
4. <span id="workerthreads">Worker Threads</span>, [https://nodejs.org/api/worker_threads.html](https://nodejs.org/api/worker_threads.html)
5. <span id="webworkers">Web Workers</span>, [https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)
6. <span id="cryptojs">CryptoJS</span>, [https://code.google.com/archive/p/crypto-js/](https://code.google.com/archive/p/crypto-js/)
7. <span id="ffmpegjs">ffmpeg.js</span>, [https://github.com/ffmpegjs/ffmpeg.js](https://github.com/ffmpegjs/ffmpeg.js)
8. <span id="webusb">WebUSB</span>, [https://wicg.github.io/webusb/](https://wicg.github.io/webusb/)
9. <span id="emscripten">emscripten</span>, [https://emscripten.org/](https://emscripten.org/)
10. <span id="reacjs">React</span>, [https://reactjs.org/](https://reactjs.org/)
