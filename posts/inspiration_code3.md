---
title: "Inspiration Code - part 3"
description: "Code I wrote after reading a book - third part"
date: "2011-12-29T00:00:01.000Z"
---

# Inspiration Code

## Part 3

This last part is about the `_thread` and `Result` structures.

`_thread` is just a container for the `pthread_t` and `pthread_attr_t` thread variables. It wraps the `pthread_create` and `pthread_detach` functions, and has a member variable to store the return value of the called function. However, its most important task is reference counting.

    template <typename T> struct _thread
    {
        // This struct holds the return value of the function run by the thread.

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
            int remaining = __sync_sub_and_fetch(&counter, 1);
            if (remaining == 0)
                delete this;
            return remaining;
        }

        private:
        _thread(const _thread&);
        _thread& operator=(const _thread&);
    };

`_thread` has `inc`/`dec` member functions that are called every time another object acquires or releases a reference to it. When `dec` brings the counter to zero, the `_thread` object is deleted. Its destructor calls `pthread_detach`, so that the thread's resources can be freed.

This reference counting is important because `_help_fn` and `_help_st` must save the result of the computation somewhere the caller can fetch it from.

To clarify: we can't just launch the thread (which executes `_help_fn`), save the result and delete everything. We need to be sure we delete the result at the right time.

This is why, when a new thread is created, the corresponding `_thread` object is referenced by both a `_help_st` and a `Result` object. At the end of `_help_fn`, when `_help_st` is deleted, its destructor calls `dec` on the `_thread` object,
but the `_thread` object is deleted only if the corresponding `Result` object has already been deleted too.

    template <typename T> struct Result
    {

        Result(_thread<T>* thd) : thd(thd)
        {
            thd->inc();
        }

        Result(const Result<T>& o) : thd(o.thd)
        {
            thd->inc();
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
    };

The `Result` object is what the caller gets back when starting a new thread. If the caller keeps it, they can fetch the return value through it.
Otherwise, the `Result` object is destroyed automatically, and the corresponding `_thread` object is deleted when the `_help_st` destructor calls `dec`.

To close this last part, here are the static methods of the `Thread` class that create a new thread running a function, a functor or an instance method with one argument. The signatures for more than one argument are similar.
As you can see, these functions return a `Result` object.

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

The returned `Result` object gets a `_thread` object, created by the `_start` helper function of the `Thread` class:

    template <typename T, typename F> static _thread<T>*
    _start(const F& functor)
    {
        _thread<T>* mythread = new _thread<T>();
        _help_st<T, F >* h2 = new _help_st<T, F>(mythread, functor);
        mythread->start(_help_fn<_help_st<T, F> >, h2);
        return mythread;
    }

I hope you enjoyed this series! If you have questions or something isn't clear, open an issue on the [funproject repository](https://github.com/cybercase/funproject): I'll be happy to answer or rewrite the unclear parts.

_-- 29/12/2011_