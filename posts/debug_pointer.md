---
title: "Debug Pointer"
description: "C++ Smart Pointer for Debugging"
date: "2012-08-22T00:00:01.000Z"
---

# Debug Pointer

Lately I've been working on a C++/Boost program (that is, speeding up and refactoring an unmaintainable program). It's basically a parser: it reads several binary files and produces an XML file for each one. It also needs to merge and summarise some of the fields in these files to produce a _Final Report_ XML file.

There are several ways to write software for a task like this, and the customer chose to use threads. A big mistake because, IMHO, whoever wrote it had no idea how to use threads efficiently, and ended up with locks and semaphores everywhere. But that's another story.

The most striking thing I saw in this program was the reckless abuse of Boost shared pointers. They were used almost everywhere, in every nonsensical way possible: passed around by copy, or like this:

    for (int i=0; i<SOMEINT; ++i) {
        // Why not: SOMECLASS sp; ???
        boost::shared_ptr<SOMECLASS> sp(new SOMECLASS);
        sp->SomeMethod();
    }

Just by fixing these kinds of misuse, I got a speedup of over 2x.

Shared pointers can be really useful but they:

- should be used with care because they can become really expensive
- should not be used just to avoid thinking about memory management in your software

The last point is what I felt was happening in this program. For this reason, and to help me refactor and remove shared pointers from it, I wrote my own smart pointer: **debug_ptr**.

**debug_ptr** is a smart pointer that helps developers manage memory correctly (a `delete` for every `new`). A debug_ptr simply warns you when you forget to delete a dynamically allocated object, so that you can add the correct `delete` (or `delete[]`) statement.
Also, debug_ptr is designed so that, once you have tested your software and no more memory leak warnings are raised, it can be automatically replaced with a native pointer type, adding no overhead at either run time or compile time.

For now, you can check out the debug_ptr source code and have a look at the few test cases that show how it can
be used. It's in my debug_ptr repository on GitHub:

    git clone https://github.com/cybercase/debug_ptr.git # clone the repo
    cd debug_ptr
    g++ -Wall -o test debug_ptr_test.cc -DENABLE_DEBUG_TYPES
    ./test

In the next post, I'll try to focus on some interesting parts of this very simple smart pointer.
