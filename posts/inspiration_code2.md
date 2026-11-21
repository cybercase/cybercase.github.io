---
title: "Inspiration Code - part 2"
description: "Code I wrote after reading a book - second part"
date: "2011-12-20T00:00:01.000Z"
---

# Inspiration Code

## Part 2

Since `pthread_create` can only run functions of type `void*(*)(void*)`, I decided to pack both the callable object and its arguments into a struct, and pass it to a function matching that signature. Here is that function, which I named `_help_fn`:

    template <typename S> void* _help_fn(void* v)
    {
        // This function signature matches the one needed by
        // pthread_create func.
        S* st = (S*)v;
        st->exec();
        delete st;
        return NULL;
    };

The `S` template parameter is the type of a package struct. The `exec()` method of this struct should call any callable type with its arguments and, of course, store the return value of the call somewhere.
This is how I wrote the package struct, named `_help_st`:

    template <typename T, typename I> struct _help_st
    {
        _help_st(_thread<T>* t, I f) : functor(f)
        {
            thd = t;
            thd->inc();
        }

        ~_help_st()
        {
            thd->dec();
        }

        I functor;
        _thread<T>* thd;

        void exec()
        {
            thd->result = functor();
        }
    };

For now, don't pay too much attention to the `_thread` member variable. You just need to know that it holds the result of the thread's computation.
The only task of the `exec()` member function is to store the value returned by the callable object. The return type is given by the template parameter `T`, and the dirty job of calling the function with all of its arguments is left to a functor object of type `I`.

I couldn't find any other way than writing one functor for each of the callable types listed in the previous post.
This is the functor for pointers to instance methods taking one argument:

    template <typename T, typename C, typename I0> struct _class_functor1
    {
        _class_functor1(C* c, T(C::*m)(I0), I0 a0) : m(m), c(c), a0(a0) {}
        T operator()() { return (c->*m)(a0); }
        T(C::*m)(I0);
        C* c;
        I0 a0;
    };

And this is the functor for all the other kinds of callable objects taking one argument:

    template <typename T, typename O, typename I0> struct _functor1
    {
        _functor1(O obj, I0 a0) : o(obj), a0(a0) {}
        T operator()() { return o(a0); }
        O o;
        I0 a0;
    };

I needed a special functor like `_class_functor1` to handle instance methods, because C++ doesn't provide a way to store the callable result of `(c->*m)`.

_-- 20/12/2011_