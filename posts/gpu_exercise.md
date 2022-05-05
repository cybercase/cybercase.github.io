---
title: "A GPU Exercise - part 1"
description: ""
date: "2012-09-13T00:00:01.000Z"
---

# A GPU Exercise

## Part 1

It's been several months since the last time I put my hands on something related to GPUs. Sadly, I get very rarely the chance to get this kind of jobs.
So, to keep myself trained (just in case I will get one), during the last two weeks I worked on an "exercise project".

For this exercise project I choosed to port to GPU an algorithm that I studied during my University years. [Here you can find some informations](http://en.wikipedia.org/wiki/Levenshtein_distance):

I'll try to explain in few words and with a little example what is the Levenshtein distance.
Given two strings, the Levenstein distance is the minimum number of character insertion, deletion or substitution, to change a string into the other, ie:

The Levenshtein distance between RISOTTO and PRESTO is 4:

1. Insert P
2. Substitute I with E
3. Delete O
4. Delete T

Finding the shortest list of operations to change a string into another is a problem that can be solved by using the Dynamic Programming technique. The main trouble is that, in many cases, this technique requires an huge amount of memory to store intermediate results and avoid recomputing.

In fact, this algorithm requires a amount of memory proportional to the product of the lengths of the 2 strings: if len(string1) is m, and len(string2) is n, then the memory and operations requirement is O(m\*n).

The required memory amount can be reduced in several ways... expecially exploiting some of the upper bounds of the optimal solution (see the wikipedia link at the top of this article).

However, if we compute just the number of operations (without actually knowing which operations are performed), the memory requirement can be reduced up to O(max(m, n)), even though the number of operations remains unchanged at O(m\*n).

Let's try to understand how the algorithm works, and hence, why computing the optimal cost, in terms of number of changes, is cheaper (in terms of memory) than computing the entire operations list.

Given two string $$X$$ and $$Y$$ such that $$X=x_1,x_2,...,x_m$$ and $$Y=y_1,y_2,...,y_n$$ , we can use a matrix to represent the solutions of each subproblem.

<div class="line-5-m line-5-d text-center">

$$\begin{array}{|c|c|c|c|c|c|} \hline _{X}\backslash^{Y} & \# & y_1 & y_2 & \cdots & y_n \\ \hline \#\\ \hline x_1\\ \hline x_2\\ \hline \vdots\\ \hline x_m\\ \hline \end{array}$$

</div>

Where cell $$i,j$$ will contain the cost of the optimal solution for the subproblem of changing string $$X_i=\#,x_1,x_2,...,x_i$$ into $$Y_i=\#,y_1,y_2,...,y_j$$ with $$i \leq m$$ and $$j \leq n$$. The $$ \# $$ character represents the empty string.
Note that the first row and column of this matrix, are quite easy to fill:

The first column contains the costs of changing any of the $$X$$ substrings into the empty $$\#$$ string. So, substring $$X_1$$ (formed by the empty string plus the $$x_1$$ character) will require 1 deletion to change into substring $$Y_0$$ (the empty string)... $$X_2$$ will require 2 deletion, $$X_3$$ is 3, and so on...
The first row contains the cost of changing the empty string into the substring $$Y_j$$. So, the cost of changing the empty string into $$Y_1$$, will be 1 insertion, $$Y_2$$ is 2, and so on...
Obviusly, the cell $$0,0$$ containing the cost of changing $$\#$$ in $$\#$$, that is 0.

<div class="line-5-m line-5-d text-center">

$$\begin{array}{|c|c|c|c|c|c|} \hline _{X}\backslash^{Y} & \# & y_1 & y_2 & \cdots & y_n \\ \hline \# & 0 & 1 & 2 & \cdots & n\\ \hline x_1 & 1\\ \hline x_2 & 2\\ \hline \vdots\\ \hline x_m & m\\ \hline \end{array}$$

</div>

Now that we have defined the base cases, we can look at how it's possible to fill the remaining cells, and thus finding the costs of the optimal solutions. Let's take as example the cell $$1,1$$ corresponding to subproblem of changing $$X_1=\#,x_1$$ into $$Y1=\#,y_1$$.

The easiest case is when $$x_1=y_1$$. In this case we don't need to perform any operation over the previous subproblem of changing $$X_0$$ into $$Y_0$$, hence the costs are the same.

If $$x_1$$ differs from $$y_1$$, then we can choose the cheapest among the three following options:

- Substitute $$x_1$$ with $$y_1$$. The cost will be 1 plus the cost of changing $$X_0$$ into $$Y_0$$.

- Insert the character $$y_1$$ to $$Y_0$$. The cost will be 1 plus the cost of changing $$X_1$$ into $$Y_0$$

- Delete the character $$x_1$$ from the string $$X_1$$. the cost will be 1 plus the cost of changing $$X_0$$ into $$Y_1$$
  In the same way it's possible to compute the values for all the other cells, by looking at the cells associated to the immediately preceding subproblems. In the end we will get the value of subproblem $$(X_m, Y_n)$$, that is the problem from which we started from.

Let's make some observations:

- The value of cell $$(j,i)$$ depends only from the comparison between $$x_i$$ and $$y_j$$ and value in cells $$(j-1,i-1)$$, $$(j-1,i)$$, $$(j,i-1)$$.

- The operation that was performed to produce the value in cell $$(i,j)$$ can be deduced only by looking at $$x_i$$ and $$y_j$$ and value inside cells $$(j-1,i-1)$$, $$(j-1,i)$$, $$(j,i-1)$$.

This makes easy computing the value of a cell $$i,j$$ since we have to remember just the values of the immediatly preceeding subproblems.
On the other hand, to retrive all the operations associated to the optimal solution, it's necessary to store (or recompute) the values of all the preceeding cells, since it's not possible to know which cells you will need, until you know the "subproblems path" to the optimal solution.

I hope you enjoied this simple introduction to the algorithm. In the next post I'm going straight into the implementation and the problems (and the solutions) of make run this algorithm on a GPU... attaching a lot of code of course :)

And naturally, if you spot errors, I would be really happy to receive reports ;)

_--13/09/2012_
