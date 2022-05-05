---
title: "A GPU Exercise - part 2"
description: ""
date: "2012-09-16T00:00:01.000Z"
---

This is the sequel of previous post: [A GPU Exercise - part 1](./gpu_exercise)

Let's resume from the algorithm for computing the Levenshtein distance among two strings. To fill every cell of the subrpoblems matrix, we can allocate a 2 dimensional array and then proceed like this:

    // C-Like syntax: don't expect this compiles :)
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

But, if we look carefully at Step3 inner loop, it's easy to see that there is not need to store the entire matrix since, for each cell, we need just the immediately preceding ones. Hence, to reduce allocated memory, it's possible to change the algorithm like this:

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
                current[j] = (previous[j]+1, current[j-1]+1,
                  previous[j-1] + (string_one[i] != string_two[j-1] ? 1 : 0) );
            }
            swap(current, previous);
        }
        return previous[n-1];
    }

Now, only 2 array of size `strlen(string_two)+1` are stored.

This algorithm is quite good for a singlecore cpu implementation, since it has good data locality... Small strings can be stored entirely inside the cache memory to achive the best performances. However, think about optimising this algorithm for a multicore CPU... It's easy to notice the strong data dependancy: we can't compute the value of a cell if we didn't already computed the previous ones.

To overcome this problem and take the full advantage of using multiple cores we need to change the algorithm. And these are the changes (can you find another way?).

Instead of walking over the matrix by rows and then by columns, we can walk by diagonals to avoid some data dependancies. Look at the followings steps:

Compute the value of cell $$c_{1,1}$$ (previous needed values $$c_{1,0}$$ $$c_{0,1}$$ and $$c_{0,0}$$ comes from initialisation)

<div class="line-5-m line-5-d text-center">

$$\begin{array}{|c|c|c|c|c|c|} \hline _{X}\backslash^{Y} & \# & y_1 & y_2 & y_3 & \cdots \\ \hline \# & 0 & 1 & 2 & 3 \\ \hline x_1 & 1 & \mathbf{c_{1,1}} \\ \hline x_2 & 2\\ \hline x_3 & 3 \\ \hline \vdots\\ \hline \end{array}$$

</div>

Compute cells $$c_{2,1}$$ and $$c_{1,2}$$: cell $$c_{2,1}$$ requires cells $$c_{1,1}$$ (computed in the previous step), cell $$c_{2,0}$$ and $$c_{1,0}$$ (both comes from initialisation). Same for cell $$c_{1,2}$$.

<div class="line-5-m line-5-d text-center">

$$\begin{array}{|c|c|c|c|c|c|} \hline _{X}\backslash^{Y} & \# & y_1 & y_2 & y_3 & \cdots \\ \hline \# & 0 & 1 & 2 & 3 \\ \hline x_1 & 1 & c_{1,1} & \mathbf{c*{1,2}} \\ \hline x_2 & 2 & \mathbf{c*{2,1}} \\ \hline x_3 & 3 \\ \hline \vdots \\ \hline \end{array}$$

</div>

Compute cell $$c_{3,1}$$ $$c_{2,2}$$ and $$c_{1,3}$$: cell $$c_{2,2}$$ requires cells $$c_{1,1}$$ (computed in step 1) $$c_{2,1}$$ and $$c_{1,2}$$ (from step 2)

<div class="line-5-m line-5-d text-center">

$$\begin{array}{|c|c|c|c|c|c|} \hline _{X}\backslash^{Y} & \# & y_1 & y_2 & y_3 & \cdots \\ \hline \# & 0 & 1 & 2 & 3 \\ \hline x_1 & 1 & c_{1,1} & c*{1,2} & \mathbf{c*{1,3}} \\ \hline x*2 & 2 & c*{2,1} & \mathbf{c*{2,2}} \\ \hline x_3 & 3 & \mathbf{c*{3,1}} \\ \hline \vdots \\ \hline \end{array}$$

</div>

And so on...
At a given step, each cell refers to the cells computed in the previous steps, and never to the ones of the same. Precisely, filling the cells in step $$i$$ requires filling cells at step $$i-1$$ and $$i-2$$.

This allow us to rewrite the algorithm in a way such that all of the cells in a certain diagonal can be filled concurrently since the data dependancy has been moved among diagonals.

Unfortunately I don't have enough time to show the pseudo code of this algorithm in this post because, even if this new algorithm can be conceptually simple to understand, a good implementation requires the handling of a some special cases that will make the code snippet definitely too long to explain in this blogpost...

Instead, I'm going to push (and talk about) the code on my github account during the next blogpost.

... suspense is raising, isn't it? :)

_--16/09/2012_
