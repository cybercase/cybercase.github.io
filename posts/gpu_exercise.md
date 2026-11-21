---
title: "A GPU Exercise - part 1"
description: ""
date: "2012-09-13T00:00:01.000Z"
---

# A GPU Exercise

## Part 1

It's been several months since I last got my hands on anything GPU-related. Sadly, I very rarely get the chance to work on this kind of job.
So, to keep in practice (just in case one comes along), I spent the last two weeks on an "exercise project".

For this project I chose to port to the GPU an algorithm I studied at university: the [Levenshtein distance](https://en.wikipedia.org/wiki/Levenshtein_distance).

I'll try to explain what the Levenshtein distance is in a few words, with a small example.
Given two strings, the Levenshtein distance is the minimum number of character insertions, deletions or substitutions needed to change one string into the other. For example:

The Levenshtein distance between RISOTTO and PRESTO is 4:

1. Insert P
2. Substitute I with E
3. Delete O
4. Delete T

Finding the shortest list of operations to change a string into another is a problem that can be solved with dynamic programming. The main trouble is that, in many cases, this technique requires a huge amount of memory to store intermediate results and avoid recomputing them.

In fact, this algorithm requires an amount of memory proportional to the product of the lengths of the two strings: if len(string1) is m and len(string2) is n, then both the memory and the number of operations are O(m\*n).

The amount of memory can be reduced in several ways, especially by exploiting some upper bounds of the optimal solution (see the Wikipedia link at the top of this article).

However, if we compute just the number of operations (without actually knowing which operations are performed), the memory requirement can be reduced to O(max(m, n)), even though the number of operations remains unchanged at O(m\*n).

Let's try to understand how the algorithm works, and why computing the optimal cost (the number of changes) is cheaper, in terms of memory, than computing the entire list of operations.

Given two strings $$X$$ and $$Y$$ such that $$X=x_1,x_2,...,x_m$$ and $$Y=y_1,y_2,...,y_n$$ , we can use a matrix to represent the solutions of each subproblem.

<div class="line-5-m line-5-d text-center">

$$\begin{array}{|c|c|c|c|c|c|} \hline _{X}\backslash^{Y} & \# & y_1 & y_2 & \cdots & y_n \\ \hline \#\\ \hline x_1\\ \hline x_2\\ \hline \vdots\\ \hline x_m\\ \hline \end{array}$$

</div>

Cell $$i,j$$ contains the cost of the optimal solution for the subproblem of changing the string $$X_i=\#,x_1,x_2,...,x_i$$ into $$Y_j=\#,y_1,y_2,...,y_j$$, with $$i \leq m$$ and $$j \leq n$$. The $$ \# $$ character represents the empty string.
Note that the first row and column of this matrix are quite easy to fill:

The first column contains the costs of changing each of the $$X$$ substrings into the empty string $$\#$$. So, substring $$X_1$$ (the empty string plus the character $$x_1$$) requires 1 deletion to change into substring $$Y_0$$ (the empty string), $$X_2$$ requires 2 deletions, $$X_3$$ requires 3, and so on.
The first row contains the costs of changing the empty string into the substrings $$Y_j$$. So, changing the empty string into $$Y_1$$ costs 1 insertion, $$Y_2$$ costs 2, and so on.
Obviously, cell $$0,0$$ contains the cost of changing $$\#$$ into $$\#$$, which is 0.

<div class="line-5-m line-5-d text-center">

$$\begin{array}{|c|c|c|c|c|c|} \hline _{X}\backslash^{Y} & \# & y_1 & y_2 & \cdots & y_n \\ \hline \# & 0 & 1 & 2 & \cdots & n\\ \hline x_1 & 1\\ \hline x_2 & 2\\ \hline \vdots\\ \hline x_m & m\\ \hline \end{array}$$

</div>

Now that we have defined the base cases, we can look at how to fill the remaining cells, and thus find the costs of the optimal solutions. Let's take as an example cell $$1,1$$, corresponding to the subproblem of changing $$X_1=\#,x_1$$ into $$Y_1=\#,y_1$$.

The easiest case is when $$x_1=y_1$$. In this case we don't need any operation on top of the previous subproblem of changing $$X_0$$ into $$Y_0$$, hence the costs are the same.

If $$x_1$$ differs from $$y_1$$, then we can choose the cheapest of the following three options:

- Substitute $$x_1$$ with $$y_1$$. The cost will be 1 plus the cost of changing $$X_0$$ into $$Y_0$$.

- Insert the character $$y_1$$. The cost will be 1 plus the cost of changing $$X_1$$ into $$Y_0$$.

- Delete the character $$x_1$$ from the string $$X_1$$. The cost will be 1 plus the cost of changing $$X_0$$ into $$Y_1$$.

In the same way, we can compute the values of all the other cells by looking at the cells of the immediately preceding subproblems. In the end we get the value of subproblem $$(X_m, Y_n)$$, which is the problem we started from.

Let's make some observations:

- The value of cell $$(i,j)$$ depends only on the comparison between $$x_i$$ and $$y_j$$, and on the values in cells $$(i-1,j-1)$$, $$(i-1,j)$$ and $$(i,j-1)$$.

- The operation that was performed to produce the value in cell $$(i,j)$$ can be deduced just by looking at $$x_i$$ and $$y_j$$, and at the values in cells $$(i-1,j-1)$$, $$(i-1,j)$$ and $$(i,j-1)$$.

This makes it easy to compute the value of cell $$i,j$$, since we only need to remember the values of the immediately preceding subproblems.
On the other hand, to retrieve all the operations of the optimal solution, we need to store (or recompute) the values of all the preceding cells, because we can't know which cells we'll need until we know the "subproblem path" to the optimal solution.

I hope you enjoyed this simple introduction to the algorithm. In the next post I'll go straight into the implementation, and the problems (and solutions) of making this algorithm run on a GPU, with a lot of code of course :)

And naturally, if you spot any errors, I'd be really happy to hear about them ;)

_--13/09/2012_