---
title: "A GPU Exercise - part 2"
description: ""
date: "2012-09-16T00:00:01.000Z"
---

This is the sequel to the previous post: [A GPU Exercise - part 1](../gpu_exercise/)

Let's pick up from the algorithm for computing the Levenshtein distance between two strings. To fill every cell of the subproblem matrix, we can allocate a two-dimensional array and proceed like this:

    // C-like syntax: don't expect this to compile :)
    int lev_distance(char* string_one, char* string_two) {
      int m = strlen(string_one)+1;
      int n = strlen(string_two)+1;
      int matrix[m][n];

      for (int j=0; j < n; ++j) { // Step1: Init first row
        matrix[0][j] = j;
      }

      for (int i=0; i < m; ++i) { // Step2: Init first column
        matrix[i][0] = i;
      }

      for (int i=1; i < m; ++i) { // Step3: Fill every cell
        for (int j=1; j < n; ++j) {
          if (string_one[i-1] == string_two[j-1]) {
            matrix[i][j] = matrix[i-1][j-1];
          } else {
            matrix[i][j] = min(matrix[i][j-1],
              matrix[i-1][j],
              matrix[i-1][j-1]) + 1;
          }
        }
      }
      return matrix[m-1][n-1]; // cell containing cost of the real problem
    }

But if we look carefully at the Step3 inner loop, it's easy to see that there's no need to store the entire matrix since, for each cell, we only need the immediately preceding ones. So, to reduce the allocated memory, we can change the algorithm like this:

    int lev_distance(char* string_one, char* string_two) {
      int m = strlen(string_one); // Note: removed +1
      int n = strlen(string_two)+1;

        int current[n];
        int previous[n];
        for (int j=0; j < n; ++j) {
            previous[j] = j;
        }

        for (int i=0; i < m; ++i) {
            current[0] = i+1;
            for (int j=1; j < n; ++j) {
            // Note: the if is replaced by the conditional assignment
                current[j] = min(previous[j]+1, current[j-1]+1,
                  previous[j-1] + (string_one[i] != string_two[j-1] ? 1 : 0) );
            }
            swap(current, previous);
        }
        return previous[n-1];
    }

Now only two arrays of size `strlen(string_two)+1` are stored.

This algorithm is quite good for a single-core CPU implementation, since it has good data locality: small strings fit entirely in the cache, for the best performance. However, think about optimising this algorithm for a multicore CPU. It's easy to notice the strong data dependency: we can't compute the value of a cell until we have computed the previous ones.

To overcome this problem and take full advantage of multiple cores, we need to change the algorithm. Here are the changes (can you find another way?).

Instead of walking over the matrix by rows and then by columns, we can walk it by diagonals to avoid some data dependencies. Look at the following steps:

Compute the value of cell $$c_{1,1}$$ (the values it needs, $$c_{1,0}$$, $$c_{0,1}$$ and $$c_{0,0}$$, come from the initialisation):

<div class="line-5-m line-5-d text-center">

$$\begin{array}{|c|c|c|c|c|c|} \hline _{X}\backslash^{Y} & \# & y_1 & y_2 & y_3 & \cdots \\ \hline \# & 0 & 1 & 2 & 3 \\ \hline x_1 & 1 & \mathbf{c_{1,1}} \\ \hline x_2 & 2\\ \hline x_3 & 3 \\ \hline \vdots\\ \hline \end{array}$$

</div>

Compute cells $$c_{2,1}$$ and $$c_{1,2}$$: cell $$c_{2,1}$$ requires cell $$c_{1,1}$$ (computed in the previous step) and cells $$c_{2,0}$$ and $$c_{1,0}$$ (both from the initialisation). The same goes for cell $$c_{1,2}$$.

<div class="line-5-m line-5-d text-center">

$$\begin{array}{|c|c|c|c|c|c|} \hline _{X}\backslash^{Y} & \# & y_1 & y_2 & y_3 & \cdots \\ \hline \# & 0 & 1 & 2 & 3 \\ \hline x_1 & 1 & c_{1,1} & \mathbf{c_{1,2}} \\ \hline x_2 & 2 & \mathbf{c_{2,1}} \\ \hline x_3 & 3 \\ \hline \vdots \\ \hline \end{array}$$

</div>

Compute cells $$c_{3,1}$$, $$c_{2,2}$$ and $$c_{1,3}$$: cell $$c_{2,2}$$ requires cells $$c_{1,1}$$ (computed in step 1), $$c_{2,1}$$ and $$c_{1,2}$$ (from step 2).

<div class="line-5-m line-5-d text-center">

$$\begin{array}{|c|c|c|c|c|c|} \hline _{X}\backslash^{Y} & \# & y_1 & y_2 & y_3 & \cdots \\ \hline \# & 0 & 1 & 2 & 3 \\ \hline x_1 & 1 & c_{1,1} & c_{1,2} & \mathbf{c_{1,3}} \\ \hline x_2 & 2 & c_{2,1} & \mathbf{c_{2,2}} \\ \hline x_3 & 3 & \mathbf{c_{3,1}} \\ \hline \vdots \\ \hline \end{array}$$

</div>

And so on.
At any given step, each cell depends on cells computed in previous steps, never on cells of the same step. More precisely, filling the cells of step $$i$$ requires the cells of steps $$i-1$$ and $$i-2$$.

This allows us to rewrite the algorithm so that all the cells of a diagonal can be filled concurrently, since the data dependency is now between diagonals.

Unfortunately I don't have time to show the pseudocode of this algorithm in this post: even if it's conceptually simple, a good implementation has to handle some special cases that would make the code snippet far too long to explain here.

Instead, I'm going to push the code to my GitHub account and talk about it in the next post.

The suspense is building, isn't it? :)

### Update: the code

_Added on 25/09/2012._ The code is now on GitHub, in my funproject repository:

    git clone https://github.com/cybercase/funproject.git

To compile the code you need the _NVIDIA CUDA Toolkit_. Then run:

    cd funproject
    cmake .
    make

If CMake finds the CUDA Toolkit, the lev_distance target is built into the experiments directory. To quickly test the performance, run:

    cd experiments
    ./lev_distance lev_distance.cu thread.h

These are the results on my late-2010 MacBook Air:

    lev_distance.cu size is 8716 bytes
    thread.h size is 17818 bytes
    LevDistance...
    elapsed time: 9.240 (s)
    CudaLevDistance...
    elapsed time: 0.872 (s)
    Results matches!
    Distance: 14332

Please note that this is an educational implementation, and there's a lot of room for improvement to exploit all the features of the underlying architecture.

_--16/09/2012_