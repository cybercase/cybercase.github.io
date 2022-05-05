---
title: "The Web MiniDisc Application - Use your old NetMD device in the browser"
description: "Get control of your MiniDisc device thanks to WebUSB and WASM"
coverImage: "/images/minidisc.jpg"
coverTitle: "The Web MiniDisc App"
coverSubtitle: "Bringing back to life the MiniDisc with WebUSB and WASM"
coverDark: true
date: "2020-03-26T05:35:07.322Z"
---

If you've never heard of the MiniDisc don't worry, you're not alone.

If you're curious, you can catch up by reading the [Wikipedia page](https://en.wikipedia.org/wiki/MiniDisc),
or the old community portal [minidisc.org](http://www.minidisc.org/), or interact with the reddit community of [/r/minidisc](https://reddit.com/r/minidisc).

If you're not, long story short, it's a dead music format released by Sony at the beginning of the '90s, that was slowly killed
by the popularity of the many MP3 players that started coming out in the early 2000s.

Some of the last MiniDisc players, branded as _NetMD_ units, were equipped with a USB port that allowed for recording music onto the device by using the infamously SonicStage software (Windows only, of course).
When Sony abandoned the MiniDisc, that software was left unmaintained and, nowadays, it can't run outside virtual machines or without using dangerously unsigned drivers.

Luckily the OSS community managed to completely reverse engineer the NetMD protocol and, before the death of the MiniDisc, the [linux-minidisc](https://wiki.physik.fu-berlin.de/linux-minidisc/doku.php) project was released.

A few of weeks ago, just before the infamously Coronavirus lockdown here in Italy, I've been lucky enough to find my old [MZ-N710](https://www.minidisc.org/part_Sony_MZ-N710.html) in my parents' basement.
Determined to make it work on my Macbook, I brought it home and successfully managed to compile and run the linux-minidisc CLI.

## Porting the MiniDisc to Web

The process for uploading the music via the CLI was comprised of 2 steps:

1. Convert your music

- Use `ffmpeg` <sup>[[1]](#ffmpeg)</sup> to create a 16bit 44100Hz pcm wav file (SP quality)
- Use `atrac3denc` <sup>[[2]](#atracdenc)</sup> to create a 132/66 Kbit ATRAC3 file (LP2/LP4 quality)

2. Use the CLI to send the converted music to the device

Not the most _user friendly_ process for those who're not fancy to type commands in a terminal.

So, after pondering for a while, I realized these steps could have been encapsulated in a _no-install-required_
progressive web app, for a considerable step up in the ease of the process.

I would just use:

- **WebUSB**<sup>[[8]](#webusb)</sup> to replace the CLI for communicating with the NetMD device
- **emscripten**<sup>[[9]](#emscripten)</sup> to bring `ffmpeg` and `atracdenc` into the browser
- **React**<sup>[[10]](#reacjs)</sup> to create a simple UI

### 1. Writing a library

I started by porting the code from linux-minidisc to a new JS library that I've now published on npm, called `netmd-js`<sup>[[3]](#netmdjs)</sup>.

This library implements the NetMD protocol and takes care of the USB communication with the device.
It will also allow other devs to write their own app, should mine not suit their needs.

It runs either in `nodejs` and in every browser supporting the WebUSB standard, and uses _Worker Threads_<sup>[[4]](#workerthreads)</sup> or
_Web Workers_<sup>[[5]](#webworkers)</sup> to speed up the
music encryption step required by the protocol. The encryption has been implemented on top of _CryptoJS_<sup>[[6]](#cryptojs)</sup>.

### 2. Using emscripten

I was lucky enough to find a project called `ffmpeg.js`<sup>[[7]](#ffmpegjs)</sup> that already ported ffmpeg to WASM.
So, the only thing left to do was to configure it properly and recompile, just to trim down the binary size.
A full tutorial is available in the GitHub page of `ffmpeg.js`.

Then, I've followed a similar process to cross compile the `atracdenc` encoder and eventually write a simple JS wrapper around it.

### 3. The Web MiniDisc Application

After gathering all the bricks together, I've shifted my focus to design the app's user interface and experience.

<div class="mtop-1-m mtop-1-d line-21-d" style="text-align: center;">
    <img src="/images/webminidiscapp.png" alt="Web MiniDisc App Wireframe" style="width: 100%;"/>
</div>

> _A dead simple user experience_

Then I started off with the classic _create react app + TypeScript_ template, and added _redux_ and _material-ui_ components... a _no-frills_ setup.

## How to use a NetMD device in 2020

A couple of nights later I was ready to record the first demo of the the Web MiniDisc Application.

It has been exciting to see the app work seamlessly both on my Macbook and on my Android phone without an `if` needed.

<iframe class="line-17-d line-11-m" src="//www.youtube.com/embed/Frs8qhw0g9Y" frameborder="0" allowfullscreen></iframe>

### Public launch

Honestly, there aren't many places to launch a MiniDisc app in 2020 :)<br/>
It's a pretty tiny niche.

However, I have been lurking for some time in [/r/minidisc](https://www.reddit.com/r/minidisc/) and decided to start from there.
[The feedback was great](https://www.reddit.com/r/minidisc/comments/fn4acd/web_minidisc_application/), and people even responded with a few bug reports and feature requests.

### Links

If you're a lucky owner of a NetMD device, you can try the app yourself at

<a href="https://stefano.brilli.me/webminidisc/" target="_blank">https://stefano.brilli.me/webminidisc/</a>

Or, if you just want to browse the code, everything's available on GitHub.

<a href="https://github.com/cybercase/webminidisc" target="_blank">https://github.com/cybercase/webminidisc</a>

### References

1. FFmpeg, <a href="https://ffmpeg.org/" target="_blank" id="ffmpeg">https://ffmpeg.org/</a>
2. atracdenc, <a href="https://github.com/dcherednik/atracdenc" target="_blank" id="atracdenc">https://github.com/dcherednik/atracdenc</a>
3. netmd-js, <a href="https://github.com/cybercase/netmd-js" target="_blank" id="netmdjs">https://github.com/cybercase/netmd-js</a>
4. Worker Threads, <a href="https://nodejs.org/api/worker_threads.html" target="_blank" id="workerthreads">https://nodejs.org/api/worker_threads.html</a>
5. Web Workers, <a href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers" target="_blank" id="webworkers">https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers</a>
6. CryptoJS, <a href="https://code.google.com/archive/p/crypto-js/" target="_blank" id="cryptojs">https://code.google.com/archive/p/crypto-js/</a>
7. ffmpeg.js, <a href="https://github.com/ffmpegjs/ffmpeg.js" target="_blank" id="ffmpegjs">https://github.com/ffmpegjs/ffmpeg.js</a>
8. WebUSB, <a href="https://wicg.github.io/webusb/" target="_blank" id="webusb">https://wicg.github.io/webusb/</a>
9. emscripten, <a href="https://emscripten.org/" target="_blank" id="emscripten">https://emscripten.org/</a>
10. React, <a href="https://reactjs.org/" target="_blank" id="reacjs">https://reactjs.org/</a>

_-- 26/03/2020_
