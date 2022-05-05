---
title: "Debug Pointer: a quick overview"
description: "C++ Smart Pointer for Debugging - Design Decisions"
date: "2012-09-01T00:00:01.000Z"
---

# Debug Pointer: a quick overview
Let's focus on some keypoints of my debug_ptr:

- What a debug_ptr is used for?
  A debug_ptr can be used like a standard pointer type to hold the address of a dynamically allocated object:
  `typedef_pointer(int*, int_p); int_p p = new int(0);`

- How could it be useful?
  If you forget to delete a dynamically allocated object before loosing its last reference, you are probably creating a memory leak. A debug_ptr warns you about this fact using a warning policy.


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

- How much does it cost? (in performance terms)
  The features of debug_ptr are mostly useful in "debug mode". In a production release, you may not want use the features of a debug_ptr class (although you can), because of the performance losses due to the reference counting.

- How did I address this issue?
  You can compile your software by defining ENABLE_DEBUG_TYPES to get the debug_ptr feature turned on. Otherwise all the debug_ptr features are turned off by a macro that will substitute any occurrence of debug_ptr<T> with a T*. This will avoid any overhead at compile and run time.


    #ifndef ENABLE_DEBUG_TYPES
    #define typedef_pointer(Type, Alias, ...) typedef Type Alias
    #define typedef_array(Type, Alias, ...) typedef Type Alias
    #else // ENABLE_DEBUG_TYPES
    ...
    #endif

- How debug_ptr syntax differs by the one of a standard pointer type?
  debug_ptr it's intended to be used just like any other smart_ptr, and in most of the cases you should not notice any difference in creating, copying, dereferencing, assigning, and deleting...


    typedef_pointer(int*, int_p);
    int_p p = new int(0);
    int_p p_other = new int(0);
    *p = 63;
    int_p p_other = p;
    delete p_other;

- How did you get the same delete syntax of a standard pointer type?
  By defining a default cast operator to a pointer-to-deleter-class. The cast operator will be implicitly called and a new deleter object returns to operator delete. So, delete operator, deletes the deleter-class.


    operator deleter*() const {
        return deleter::new_deleter(pd_);
    }


And that's all folks!

If you have any question, just leave a comment.
If you like this project, or have any other ideas about what could be the next step of the debug_ptr, fork the project on github and have fun :)


    git clone git://github.com/cybercase/debug_ptr.git # clone the repo
    cd debug_ptr
    g++ -Wall -o test debug_ptr_test.cc -DENABLE_DEBUG_TYPES
    ./test

_--01/09/2012_
