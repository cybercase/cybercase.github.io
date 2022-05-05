---
title: "Inspiration Code - part 2"
description: "Code I wrote after reading a book - second part"
date: "2011-12-20T00:00:01.000Z"
---

# Inspiration Code

## Part 2

Since the `pthread_create` function signature allows running of `void*(*)(void*)` function type only, I was quite sure on packaging into a struct both the callable object and its args, and pass them to some function matching that signature. Here is the "some function" I named `_help_fn`:

    template <S> void* _help_fn(void* v)
    {
        // This function signature match the one needed by
        // pthread_create func.
        S* st = (S*)v;
        st->exec();
        delete st;
        return NULL;
    };

The `S` template parameter is meant to be the type of a package struct. The exec() method from this struct should call any callable type, together with its arguments and, obviously, write somewhere the return value of the call.
This is how I wrote the package struct, named `_help_st`.

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

For now, don't pay too much attention to the `_thread` member variable... You just need to know that this member variable holds the result of thread's computations.
I assigned `exec()` member function just the task of storing the returned value by a some callable object. The return value type is told by template parameter `T`. Then, the dirty job of calling the function with all of its args is left to a functor object of type `I`.

I didn't find any other way than writing as many functors as needed to match all of the previously told callable types.
This is the functor for instance method pointers receiving one arg:

    template <typename T, typename C, typename I0> struct _class_functor1
    {
        _class_functor1(C* c, T(C::*m)(I0), I0 a0) : m(m), c(c), a0(a0) {}
        T operator()() { return (c->*m)(a0); }
        T(C::*m)(I0);
        C* c;
        I0 a0;
    }

And this is the functor for all the other kinds of callable objects receiving one arg:

    template <typename T, typename O, typename I0> struct _functor1
    {
        _functor1(O obj, I0 a0) : o(obj), a0(a0) {}
        T operator()() { return o(a0); }
        O o;
        I0 a0;
    }

I needed a special functor object like `_class_functor1` for handling instance methods. This is because C++ don't provide a way to store the callable result of `(c->*m)`.

_-- 20/12/2011_
