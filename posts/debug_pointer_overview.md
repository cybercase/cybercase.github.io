---
title: "Debug Pointer: a quick overview"
description: "C++ Smart Pointer for Debugging - Design Decisions"
date: "2012-09-01T00:00:01.000Z"
---

# Debug Pointer: a quick overview
Let's focus on some key points of my debug_ptr:

- What is a debug_ptr used for?
  A debug_ptr can be used like a standard pointer type to hold the address of a dynamically allocated object:
  `typedef_pointer(int*, int_p); int_p p = new int(0);`

- How could it be useful?
  If you forget to delete a dynamically allocated object before losing its last reference, you are probably creating a memory leak. A debug_ptr warns you about it through a warning policy.


    struct ThrowPolicy {
        ThrowPolicy() {
            throw std::runtime_error("lost reference to undeleted object");
        }
    };
    struct PrintPolicy {
        PrintPolicy() {
            std::cerr << "WARNING: lost reference "
                            "to undeleted object" << std::endl;
        }
    };

- How much does it cost (in terms of performance)?
  The features of debug_ptr are mostly useful in "debug mode". In a production release, you may not want to use them (although you can), because of the performance cost of reference counting.

- How did I address this?
  You can turn the debug_ptr features on by defining ENABLE_DEBUG_TYPES when you compile your software. Otherwise, they are turned off by a macro that replaces any occurrence of `debug_ptr<T>` with a `T*`, which avoids any overhead at compile and run time.


    #ifndef ENABLE_DEBUG_TYPES
    #define typedef_pointer(Type, Alias, ...) typedef Type Alias
    #define typedef_array(Type, Alias, ...) typedef Type Alias
    #else // ENABLE_DEBUG_TYPES
    ...
    #endif

- How does the debug_ptr syntax differ from that of a standard pointer type?
  debug_ptr is meant to be used just like any other smart pointer, and in most cases you shouldn't notice any difference when creating, copying, dereferencing, assigning and deleting.


    typedef_pointer(int*, int_p);
    int_p p = new int(0);
    *p = 63;
    int_p p_other = p;
    delete p_other;

- How did I get the same delete syntax as a standard pointer type?
  By defining an implicit conversion operator to a pointer to a deleter class. When you write `delete p`, the conversion operator is called implicitly and returns a new deleter object, so `delete` actually deletes the deleter.


    operator deleter*() const {
        return deleter::new_deleter(pd_);
    }


And that's all, folks!

If you like this project, or have ideas about what the next step for debug_ptr could be, fork it on GitHub and have fun :)


    git clone https://github.com/cybercase/debug_ptr.git # clone the repo
    cd debug_ptr
    g++ -Wall -o test debug_ptr_test.cc -DENABLE_DEBUG_TYPES
    ./test
