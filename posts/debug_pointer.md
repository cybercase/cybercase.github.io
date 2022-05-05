---
title: "Debug Pointer"
description: "C++ Smart Pointer for Debugging"
date: "2012-08-22T00:00:01.000Z"
---

# Debug Pointer

As I mentioned in the last post, lately I'm working on a C++/Boost software (aka speeding up and refactoring an unmaintainable software). This software is just a kind of parser. It parses several binary files and, for each one, produces a xml file. Also it needs to merge and summarise some of the fields contained in each one of these files to produce a _Final Report_ xml file.

There may be several way to write a software for a task like this, and the customer choosed to use threads. A big mistake, because (IMHO) Who wrote the software did not have any idea of how use threads efficently, and he ended up using a lot of locks and semaphores everywhere... but this is another story.

The most impressive thing that I saw in this software was the inconsiderate abuse of Boost shared pointers. These were used almost everywhere in the software in every nonsense way they could be used... passing them around by copy or just like the following:

    for (int i=0; i<SOMEINT; ++i) {
        // Why not: SOMECLASS sp; ???
        boost::shared_ptr<SOMECLASS> sp(new SOMECLASS);
        sp->SomeMethod();
    }

Just by fixing these kind of misuses, I've got a speedup of over 2x.

Shared pointers can be really useful but they:

- should be used with care because they can become really expensive
- should not be used just to avoid thinking about memory management in your software

And the last point is the one that I felt was the case of this software. For this reason, and for helping myself to refactor and remove shared pointers from this software, I wrote my own smart pointer: **debug_ptr**.

**debug_ptr** is a smart pointer that should help the developer to manage the memory correctly (a delete for every new). A debug_ptr just warn the developer when he forgets to delete an dynamically allocated object, so that he can insert the correct delete (or `delete[]`) statement.
Also, debug_ptr is designed in a way such that, once you have tested your software and no memory leaks warning are raised anymore, it can be automatically substituted with a native pointer type, so that no overhead is added both at run and compile time.

For now you can check the debug_ptr source code and have a look at the few test cases that show how it can
be used. It's located in my debug_ptr repository on github:

    git clone git://github.com/cybercase/debug_ptr.git # clone the repo
    cd debug_ptr
    g++ -Wall -o test debug_ptr_test.cc -DENABLE_DEBUG_TYPES
    ./test

In the next post, I'll try to focus on some interesting parts of this very simple smart pointer.

_--22/08/2012_
