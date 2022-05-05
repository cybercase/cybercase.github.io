---
title: "UP24 Hacking"
description: "Jawbone UP24 band vibration hack"
date: "2014-10-11T00:00:00.322Z"
---

# UP24 Hacking

### Intro

Last month I received a [Jawbone UP24](http://jawbone.com/store/buy/up24) as birthday gift, and after a couple of weeks of _standard use_ I couldn't resist digging into its technical side to discover how this device actually works.

As far as I discovered, UP24 features a 3 axis accelerometer, 2 notification leds, a vibrating motor and a Bluetooth LE interface to communicate with the companion smartphone app "UP" (available for Android and iOS). Technical readers can find further info and a complete teardown of the _low-end_ version of UP24 (the older UP) [here](http://www.eevblog.com/forum/blog/eevblog-412-jawbone-up-pedometer-teardown/).

The strength of UP24 comes also from the great companion app that let users configure alarms and notifications in response of activities or events. Great features are the _smart alarm_ that chooses the best time to wake you up in the morning, and _idle notifications_ that reminds you to stretch your legs after being too much time idle on the chair.

The UP24 is definitely meant to be an activity band, and I think this is the sole reason why the guys ad Jawbone decided (at the time of writing) to not provide some extra useful features (IMO) like notifications on email/sms/calls/etc...

<iframe class="line-17-d line-11-m" src="//www.youtube.com/embed/fVznagkOwo0" frameborder="0" allowfullscreen></iframe>

### Beginning

I wanted to use my UP24 as a notification device for messages coming from some of my android phone's contacts... something simple, like a _vibrate on sms_.

So, as usual, the first question is

> " has someone already solved my problem? "

Googling around I found [something here](http://www.plutinosoft.com/hacking-bluetooth-le/) and [here](https://forums.adafruit.com/viewtopic.php?f=8&t=51450).
... Perfect! Just no code available, and wrong OS :)

However, thanks to these blogposts I knew it was possible to make vibrate my UP on command, and it had to be done through some custom Bluetooth LE command.

### Learning

After learning the basics of Bluetooth LE ([here's](https://www.usenix.org/conference/woot13/workshop-program/presentation/ryan) one of the most interesting article I found) I needed to find out how to use it on my Android.

Found a great example and all the necessary documentation [here](http://developer.android.com/samples/BluetoothLeGatt/index.html), and after installing Android Studio I was ready to start!

### Doing

Using the example from Android SDK I was able to list all the services of my UP24 in matter of minutes... However I still hadn't a clue of what services, attributes, and values I had to exploit to make the UP24 vibrate.

> Then I thought of debugging the process on my phone

to see what was happening behind the scene while issuing a vibrate command. Note, there isn't any _vibrate command_ in UP application, but I noticed that after a successful bluetooth pairing the band vibrates; and that was exactly the reaction I wanted to use for my custom-notifications app.

After connecting my phone to the Android Studio debugger I did set a breakpoint for UP's process to break at `BluetoothGatt.writeCharacteristic` method... This made everything _a lot_ slower both on my old phone and laptop but in the end, after a successful pairing, I got what I wanted :)

> -20 32 8 16 4 53 1 0 16 0 1 125.

And by the end of the day I was able to record the video at the top of this page.

<div class="mtop-1-m mtop-1-d line-16-d line-13-m" style="text-align: center;">
    <img src="/images/up24_pairing.jpg" alt="Successful UP24 Pairing" style="width: 100%;"/>
</div>

### Epilogue

I'm still writing my custom-notifications app, nevertheless I'm not releasing any of the source code of this project due to possible legal issues. However, for any _mid-level_ programmer should be easy to achieve the same results just by following the steps of this blogpost.

### Assignment

I also managed to make some experiments in order to reverse engineer a couple of the _sniffed_ values... what if you change the previous value to "-20 32 8 16 4 53 1 0 **3** 0 1 125" ? :)

_-- 10/11/2014_
