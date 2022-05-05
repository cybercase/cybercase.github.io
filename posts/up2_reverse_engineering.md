---
title: "UP2 Reverse Engineering"
description: "Jawbone UP2 vibration hack"
coverImage: "/images/up2_band.png"
coverTitle: "UP2 Reverse Engineering"
coverCaption: "Charging my new UP2"
coverDark: true
date: "2015-09-19T00:00:01.000Z"
---

**July 2018 UPDATE:** I've released the source code of this project on github.</br>
Find out more here: [https://github.com/cybercase/up2_hacking](https://github.com/cybercase/up2_hacking)

### Having fun with Jawbone UP2

A few months after releasing [UpNotifications for UP24](../up24_notifications)
I received a lot of emails asking to add support for the new **Jawbone UP2**.

As soon as Jawbone made the UP2 available outside the US I placed my order,
and after receiving the new band, without thinking too much I started tuning the UpNotifications
source code to include the UP2 among supported devices just to see if the same hack used for UP24 was working also on this band...

> Unfortunately, it was not.

I didn't give up, and following the same steps of my own [UP24 Hacking](../up24_reverse_engineering) blogpost,
I opened Android Studio, turned on the debugger, started intercepting calls to the android BLE API and see what has changed with respect to UP24...

The bluetooth packets I was reading were completely different from the UP24 packets,
so I thought that maybe it was just a matter of replacing the old UP24's pairing command with the new UP2's one. And so I did.

I soon found out that the same trick of _sending a pairing command to make the band vibrate_ was not working because
the new UP2 knows if it has been already paired with a phone, and in that case it does not vibrate on pairing.

While the UP24 **allowed anyone** to make vibrate your band without your permission just by sending a pairing command,
with the UP2 **Jawbone has fixed this issue**. Though this is a good news for all UP2 owners, this meant that I had to
find another way to trigger the vibration.

> I needed to go deeper.

I struggled to understand how the communication protocol has changed, and see if I could find another command to exploit.
But just looking at the stream of bluetooth packets wasn't enough...

so I though of disassembling the app and inspecting its `.smali` source code using [apktool](http://ibotpeaches.github.io/Apktool/)
to search for anything that could be useful.

After going through the sources for a while I noticed a `log` method used all over the app, probably for debugging purposes,
that was disabled just by a simple flag check.

In a file called `JBLog.smali`, I changed the following lines

```
-    if-nez v0, :cond_0
+    if-eqz v0, :cond_0
```

then reassembled the app and installed into my phone.

> I started getting a lot of debug information placed there right from UP developers :)

I immediately found out that the communication protocol was much more sophisticated than the one used for UP24.

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

were suggesting that the protocol was relying on some kind of encryption to communicate over a secure channel, using a shared encryption key exchanged at the time of pairing.

> I needed more, so I thought of using a decompiler.

I tried some like [Procyon](https://bitbucket.org/mstrobel/procyon/), [CFR](http://www.benf.org/other/cfr/) to get as much information as possible. With the help of a great tool called [BytecodeViewer](https://github.com/Konloch/bytecode-viewer), I stared to follow the code paths, drawing diagrams, understand the app flow and structures...

Eventually I reproduced all the steps needed to pair and setup an encrypted communication channel with the UP2 and send the vibration command I needed :)

<iframe class="line-11-m line-17-d" src="//www.youtube.com/embed/uwsyjyM5GJU" frameborder="0" allowfullscreen></iframe>

> Victory! ... almost.

As I came back on my initial goal of integrating UP2 support into UpNotifications, I realized that it would be very hard to achieve any kind of _user friendly_ experience.

The first problem comes from the fact that the encryption key is kept secret into the original UP application, and the only way to retrieve such key is to have a _rooted_ phone.

The second crucial problem is that, even if it was possible to get the encryption key easily, UP2 supports only one bluetooth connection at time.
This means that an _UpNotifications for UP2_ would not work while the band is connected to the original UP application.

And since there's no way (without root permission) to control when the UP app runs or communicates with the band, **UpNotifications for UP2 would be incompatible with the official UP app**.

> I still haven't decided whether write an _UpNotifications for UP2_ or not...

~~So, for the time being, I'm not releasing the source code of the "test" app I wrote~~ (moreover, currently the code is quite a mess).

Also, I want to be sure of the legal consequences of releasing any protocol specs...

Unlike the old UP24, Jawbone is using this protocol on devices like UP4 for [contactless payments](https://jawbone.com/blog/introducing-up4/), so this time they could be much more interested in keeping the protocol as much secret as possible to avoid security issues.

_-- 19/09/2015_
