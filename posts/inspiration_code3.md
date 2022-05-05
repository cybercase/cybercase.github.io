---
title: "Inspiration Code - part 3"
description: "Code I wrote after reading a book - third part"
date: "2011-12-29T00:00:01.000Z"
---

# Inspiration Code

## Part 3

The last of these three parts summary is about `_thread` and `Result` structures.

`_thread` is a just a container for `pthread_t` and `pthread_attr_t` thread variables. It provides a wrapper for pthread_create and pthread_detach functions, and a member variable for storing the called function return value... However the most important task accomplished by this structure is reference counting.

    template <typename T> struct _thread
    {
        // This struct will hold the return value of the thread called func.

        _thread() : counter(0)
        {
            pthread_attr_init(&attr);
            pthread_attr_setdetachstate(&attr, PTHREAD_CREATE_JOINABLE);
        }

        ~_thread() { pthread_detach(thd); }

        T result;
        pthread_t thd;
        pthread_attr_t attr;
        volatile int counter;

        int join() { return pthread_join(thd, NULL); }
        int start(void*(f)(void*), void* v)
        {
            return pthread_create(&thd, &attr, f, v);
        }

        // Atomic function for add and sub
        int inc() { return __sync_fetch_and_add(&counter, 1); }
        int dec()
        {
            if (__sync_fetch_and_sub(&counter, 1) == 0)
                delete this;
            return counter;
        }

        private:
        _thread(const _thread&);
        _thread& operator=(const _thread&);
    };

`_thread` has both inc/dec member functions that are called everytime the structure instance is referenced/dereferenced by some other object. When the dec member function is called and the counter becomes zero, then the destructor is invoked and `_thread` is deleted. Also, the destructor calls `pthread_detach`, so that thread's resources can be freed.

This reference counting mechanism is very important since we want that `_help_fn` and `_help_st` saves the computation results in a place from which we can fetch the result...

To clarify: we can't just launch the thread (that executes `_help_fn`), save the results and delete everything. We need to be sure that we are deleting the result at the right time.

This is why, when a new thread is created, the corresponding `_thread` object is referenced both by a `_help_st` and a `Result` object. In this way, at the end of `_help_fn`, when `_help_st` is deleted, the dec function of `_thread` object is called by `_help_st` destructor...
But `_thread` object is deleted only if also the corresponding `Result` object is already deleted.

    template <typename T> struct Result
    {

        Result(_thread<T>* thd) : thd(thd)
        {
            thd->inc();
        }

        Result(const Result<T>& o)
        {
            thd->inc();
            thd = o.thd;
        }

        Result<T>& operator=(const Result& o)
        {
            o.thd->inc();
            thd->dec();
            thd = o.thd;
            return *this;
        }

        T value()
        {
            switch (thd->join())
            {
                case 0:
                  break;
                case EINVAL:
                  throw std::runtime_error("EINVAL on pthread_join");
                  break;
                case EDEADLK:
                  throw std::runtime_error("EDEADLK on pthread_join");
                  break;
                case ESRCH:
                  // Thread already exited
                  break;
            }
            return thd->result;
        }

        ~Result()
        {
            thd->dec();
        }

        _thread<T>* thd;
    }

The `Result` object is the one that is returned to the user who started a new thread. So, if the user keep it, he can fetch the return value through the `Result` object.
Otherwise the `Result` object is automatically destroyed and corresponding `_thread` object is deleted when dec is called by `_help_st` destructor.

To close this last part, here are the static methods of `Thread` class for creating a new thread that runs a function, a functor or an instance method having one argument. The signature is similar for functions, functors, and instance methods having more than one arument.
As you see the return value of these function is a `Result` object.

    template <typename T, typename O, typename I0> static Result<T>
    run(O obj, I0 a0)
    {
        _functor1<T, O, I0> o(obj, a0);
        return Result<T>(_start<T>(o));
    }

    template <typename T, typename I0> static Result<T>
    run(T(*fun)(I0), I0 a0)
    {
        _functor1<T, T(*)(I0), I0> f(fun, a0);
        return Result<T>(_start<T>(f));
    }

    template <typename T, typename C, typename I0> static Result<T>
    run(C* c, T(C::*fun)(I0), I0 a0)
    {
        _class_functor1<T, C, I0> f(c, fun, a0);
        return Result<T>(_start<T>(f));
    }

Returning `Result` object is assigned a `_thread` object, created by `_start` helper function in `Thread` class.

    template <typename T, typename F> static _thread<T>*
    _start(const F& functor)
    {
        _thread<T>* mythread = new _thread<T>();
        _help_st<T, F >* h2 = new _help_st<T, F>(mythread, functor);
        mythread->start(_help_fn<_help_st<T, F> >, h2);
        return mythread;
    }

I hope you enjoyed this post serie... If you have question or you need some clarification, just leave a comment. I will be happy to answer or rewrite the unclear part

_-- 29/12/2011_
