---
title: "Inspiration Code"
description: "Code I wrote after reading a book"
date: "2011-12-19T00:00:01.000Z"
---

# Inspiration Code

A couple of weeks ago I came across Modern C++ Design, a book by Andrei Alexandrescu.
I read it cover to cover in just a few days. It was so fascinating! This book shows
you the little-known, magic power of template metaprogramming: a kind of _avada kedavra_ of C++.

My colleagues have mixed opinions about this book, but for me it's definitely a ten out of ten.

But now, let's get to the point! Just a few days ago, I started writing some code for one of my so-called "funprojects": a `thread.h` file that wraps the pthreads functions in a Thread class. After a few attempts I decided that my Thread class should be able to execute anything that is callable in C++.

Modern C++ Design lists the entities that support operator `()`:

- C-like functions
- C-like pointers to functions
- References to functions
- Functors (objects that define `operator()`)
- The result of applying operator `.*` or `->*` with a pointer to a member function on the right-hand side of the expression

The behavior I wanted for all of them was:

`RETURN_TYPE result = Thread::run(some_callable, arg1, arg2, ...);`

And this is what I ended up with:

    // main.cpp
    #include <iostream>
    #include "thread.h"
    int myfun(int i)
    {
        std::cout << "myfun received: " << i << std::endl;
        return i*2;
    }

    class myclass
    {
    public:

        myclass(int i) : i(i) {}

        int mymember(int k)
        {
            std::cout << "mymember received: " << k << std::endl;
            return i*2;
        }
        int i;

        int operator()(int j)
        {
            std::cerr << "operator received: " << j << std::endl;
            return i*2;
        }

    };

    int main(int argc, char** argv)
    {

        int (*mypt)(int) = &myfun;
        int (&myref)(int) = myfun;
        myclass mc(5);

        // Call to function
        Result<int> r0 = Thread::run(myfun, 0);
        std::cout << "retval:" << r0.value() << std::endl;

        // Call to function pointer
        Result<int> r1 = Thread::run(mypt, 1);
        std::cout << "retval:" << r1.value() << std::endl;

        // Call to function reference
        Result<int> r2 = Thread::run(myref, 2);
        std::cout << "retval:" << r2.value() << std::endl;

        // Call to functor
        Result<int> r3 = Thread::run<int>(mc, 3);
        std::cout << "retval:" << r3.value() << std::endl;

        // Call to member function pointer
        Result<int> r4 = Thread::run(&mc, &myclass::mymember, 4);
        std::cout << "retval:" << r4.value() << std::endl;

        return 0;
    }

In the next post I'm going to show some details of the code in `thread.h`.

Want to compile and run this code?

    git clone https://github.com/cybercase/funproject.git
    cd funproject/other
    g++ concurrent.cpp -o concurrent -Wall # add -lpthread if you are on a linux system
