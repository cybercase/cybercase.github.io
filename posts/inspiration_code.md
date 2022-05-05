---
title: "Inspiration Code"
description: "Code I wrote after reading a book"
date: "2011-12-19T00:00:01.000Z"
---

# Inspiration Code

A couple of week ago I run into Modern C++ Design, a book from Andrei Alexandrescu.
I read it all the way in just a few days. That was so fascinating! This book shows
you the unknown and magic power of template metaprogramming... a kind of _avada kedavra_ of C++.

I've got uncertain reviews from my colleagues about this book... But my opinion is definitely a ten out of ten.

But now, let's get to the topic! Just a few day ago, I started writing some code for one of my so-called "funprojects". A snippet of code contained in thread.h file to wraps pthreads functions with a Thread class. After few attempts I decided that my Thread class should be able to execute everything that is a callable in C++.

From Modern C++ Design, here is the list of entities that support operator `()`.

- C-like functions
- C-like pointers to functions
- References to functions
- Functors (object that defines operator() )

The result of applying operator `.*` or operator `->*` having a pointer to a member function in the right-hand side of the expression.
The behavior that I was trying to achieve for any of them was

`RETURN_TYPE result = Thread::run(some_callable, arg1, arg2, ...);`

And this is what I've got in the end

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

Want to compile and run this code?!

    git clone git://github.com/cybercase/funproject.git
    cd funproject/other
    g++ concurrent.cpp -o concurrent -Wall # add -lpthread if you are on a linux system

_-- 19/12/2011_
