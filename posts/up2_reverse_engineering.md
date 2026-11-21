---
title: "UP2 Reverse Engineering"
description: "Jawbone UP2 vibration hack"
coverImage: "/images/up2_band.png"
coverTitle: "UP2 Reverse Engineering"
coverCaption: "Charging my new UP2"
coverDark: true
date: "2015-09-19T00:00:01.000Z"
---

**July 2018 UPDATE:** I've released the source code of this project on GitHub.<br/>
Find out more here: [https://github.com/cybercase/up2_hacking](https://github.com/cybercase/up2_hacking)

### Having fun with Jawbone UP2

A few months after releasing [UpNotifications for UP24](../up24_notifications)
I received a lot of emails asking to add support for the new **Jawbone UP2**.

As soon as Jawbone made the UP2 available outside the US, I placed my order,
and when the new band arrived, without thinking too much, I started tweaking the UpNotifications
source code to add the UP2 to the supported devices, just to see if the same hack I used for the UP24 also worked on this band.

> Unfortunately, it was not.

I didn't give up. Following the same steps as in my own [UP24 Hacking](../up24_reverse_engineering/) post,
I opened Android Studio, turned on the debugger and started intercepting calls to the Android BLE API to see what had changed since the UP24.

The Bluetooth packets I was reading were completely different from the UP24 packets,
so I thought that maybe it was just a matter of replacing the old UP24's pairing command with the new UP2 one. And so I did.

I soon found out that the trick of _sending a pairing command to make the band vibrate_ didn't work, because
the new UP2 knows if it has already been paired with a phone, and in that case it does not vibrate on pairing.

While the UP24 **allowed anyone** to make your band vibrate without your permission just by sending a pairing command,
with the UP2 **Jawbone has fixed this issue**. Though this is good news for all UP2 owners, it meant that I had to
find another way to trigger the vibration.

> I needed to go deeper.

I tried hard to understand how the communication protocol had changed, and to find another command to exploit.
But just looking at the stream of Bluetooth packets wasn't enough,
so I thought of disassembling the app and inspecting its `.smali` code with [apktool](https://ibotpeaches.github.io/Apktool/)
to search for anything that could be useful.

After going through the sources for a while, I noticed a `log` method used all over the app, probably for debugging,
that was disabled by a simple flag check.

In a file called `JBLog.smali`, I changed the following lines

```
-    if-nez v0, :cond_0
+    if-eqz v0, :cond_0
```

then reassembled the app and installed it on my phone.

> I started getting a lot of debug information, put there by the UP developers themselves :)

I immediately found out that the communication protocol was much more sophisticated than the one used for the UP24.

Log messages like this

```
8257-8288/com.jawbone.upopen I/UPOPEN﹕ StreamService >>> writeOutputStream > KeyExchangeRequest >
    f >> (0, 63, 0) > 0x03
    g >> (1, 63, 0) > 0x00
    h >> (2, 63, 0) > 0xd3
    i >> (3, 63, 0) > 0x10
    d >> (4, 63, 0) > 7FA19B1353FC584CAEF3D4214C74A365
```

and

```
8257-7505/com.jawbone.upopen D/SecuredStream﹕ generateSeed > 271372323671BDEE846276EF48B53F75
8257-7505/com.jawbone.upopen D/SecuredStream﹕ 8200CD05803A090000 xor D4CB772B8B9D389527 = 56CBBA2E0BA7319527
```

and

```
8257-7505/com.jawbone.upopen I/UPOPEN﹕ StreamService >>> writeOutputStream > SecureChannelRequest >
    f >> (0, 63, 0) > 0x06
    g >> (1, 63, 0) > 0x00
    h >> (2, 63, 0) > 0xd0
    i >> (3, 63, 0) > 0x10
    c >> (4, 63, 0) > F9FC5162DC8B609B6F891BC88648A49A
    d >> (4, 63, 0) > null
```

suggested that the protocol relied on some kind of encryption to communicate over a secure channel, using a shared key exchanged at pairing time.

> I needed more, so I thought of using a decompiler.

I tried a few, like [Procyon](https://bitbucket.org/mstrobel/procyon/) and [CFR](https://www.benf.org/other/cfr/), to get as much information as possible. With the help of a great tool called [BytecodeViewer](https://github.com/Konloch/bytecode-viewer), I started following the code paths, drawing diagrams, and working out the app's flow and data structures.

Eventually I reproduced all the steps needed to pair and set up an encrypted communication channel with the UP2 and send the vibration command I needed :)

<iframe class="line-11-m line-17-d" src="//www.youtube.com/embed/uwsyjyM5GJU" frameborder="0" allowfullscreen></iframe>

> Victory! ... almost.

When I went back to my initial goal of adding UP2 support to UpNotifications, I realized it would be very hard to offer any kind of _user-friendly_ experience.

The first problem is that the encryption key is kept secret inside the official UP app, and the only way to retrieve it is with a _rooted_ phone.

The second crucial problem is that, even if it were possible to get the encryption key easily, the UP2 supports only one Bluetooth connection at a time.
This means that an _UpNotifications for UP2_ would not work while the band is connected to the original UP application.

And since there's no way (without root permission) to control when the UP app runs or communicates with the band, **UpNotifications for UP2 would be incompatible with the official UP app**.

> I still haven't decided whether to write an _UpNotifications for UP2_ or not.

~~So, for the time being, I'm not releasing the source code of the "test" app I wrote~~ (besides, the code is currently quite a mess).

Also, I want to be sure about the legal consequences of releasing any protocol specs.

Unlike the old UP24's protocol, this one is also used on devices like the UP4 for [contactless payments](https://web.archive.org/web/2015/https://jawbone.com/blog/introducing-up4/), so this time Jawbone could be much more interested in keeping it secret to avoid security issues.

_-- 19/09/2015_