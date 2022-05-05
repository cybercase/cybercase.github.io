---
title: "Holidays and GPU"
description: "Post about my GPU project before vacation"
date: "2012-09-25T00:00:01.000Z"
---

# Holidays and GPU

Next week I am visiting London.

In the meanwhile enjoy a code preview of A GPU Exercise part 1 and part 2.
To get, compile, and test the code, clone my funproject repository on github.

    git clone git://github.com/cybercase/funproject.git

To compile the code is required the _NVIDIA CUDA Toolkit_. Then run:

    cd funproject
    cmake .
    make

If CUDA Toolkit was found by CMake, then the lev_distance target should be built into the experiments directory. To quickly test the performances run:

    cd experiments
    ./lev_distance lev_distance.cu thread.h

The following result is achieved on my late 2010 MBA

    lev_distance.cu size is 8716 bytes
    thread.h size is 17818 bytes
    LevDistance...
    elapsed time: 9.240 (s)
    CudaLevDistance...
    elapsed time: 0.872 (s)
    Results matches!
    Distance: 14332

Please note that this is an educational implementation, and several improvements can be done to exploit all the features of the underlying architecture...

But before talking about this... holidays! :)

_-- 25/09/2012_
