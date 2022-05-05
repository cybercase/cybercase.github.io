---
title: "Sorting Priorities"
description: "Template Sorting in C++"
date: "2012-01-15T00:00:01.000Z"
---

# Sorting Priorities

Let's say you have your 3d colored point type:

    struct MyPoint
    {
        // A 3d colored point
        MyPoint(int c, int x, int y, int d) :
                 color(c), x(x), y(y), d(d) {}
        int color;
        int x;
        int y;
        int d;
    };

You define a vector of `MyPoint` objects carefully ordered by color, depth, height and width.

    int width = 100;
    int height = 100;
    int depth = 5;
    int colors = 2;

    int len = width * height * colors * depth;
    std::vector<MyPoint> pts;
    pts.reserve(len);

    for (int c=0; c<colors; ++c)
        for (int d=0; d<depth; ++d)
            for (int y=0; y<height; ++y)
                for (int x=0; x<width; ++x)
                    pts.push_back(MyPoint(c, x, y, d));

Then one of your funny colleagues put a

    std::random_shuffle(pts.begin(), pts.end());

just the line before you are scanning the ordered array of `MyPoint`... If it's not a colleague, could be that you need to apply a transformation matrix to all of your points, or whatever else that will break the color, depth, height and width ordering of your set.

To order back your vector by the same priorities, you can use the STL sort algorithm with some custom comparison function.
The the first function I wrote was this:

    bool mypoint_all_sort_fn(const MyPoint& p0, const MyPoint& p1)
    {
        if (p0.color < p1.color)
            return true;
        else if (p0.color == p1.color)
            if (p0.d < p1.d)
                return true;
            else if (p0.d == p1.d)
                if (p0.y < p1.y)
                    return true;
                else if (p0.y == p1.y)
                    if (p0.x < p1.x)
                        return true;
        return false;
    }

and then `std::sort(pts.begin(), pts.end(), mypoint_all_sort_fn);`

I found this solution the ugliest among the others. It's not scalable, has too many indentations and strong code dependancy... And also if `mypoint_all_sort_fn` was defined as operator inside `MyStruct` declaration I wouldn't like to have such a function inside my software.

The second solution I came to was using several `stable_sort`

    bool mypoint_x_sort_fn(const MyPoint& p0, const MyPoint& p1)
    {
        return p0.x < p1.x;
    }
    bool mypoint_y_sort_fn(const MyPoint& p0, const MyPoint& p1)
    {
        return p0.y < p1.y;
    }
    bool mypoint_d_sort_fn(const MyPoint& p0, const MyPoint& p1)
    {
        return p0.d < p1.d;
    }
    bool mypoint_c_sort_fn(const MyPoint& p0, const MyPoint& p1)
    {
        return p0.color < p1.color;
    }

and then

    std::stable_sort(pts.begin(), pts.end(), mypoint_x_sort_fn);
    std::stable_sort(pts.begin(), pts.end(), mypoint_y_sort_fn);
    std::stable_sort(pts.begin(), pts.end(), mypoint_d_sort_fn);
    std::stable_sort(pts.begin(), pts.end(), mypoint_c_sort_fn);

I found this solution not too bad by the code style point of view, but it's not the same about performances. More are the values you want to sort by, more are the stable_sort steps you have to do.

The last solution, which I found the most fascinating one, was suggested to me by two of my collegues, and it took me a just a small bunch of time to write the code down.

    template <typename T> int element(const T&, int i);

    template <typename T, int I> struct Orderer
    {
        static bool compare(const T& t0, const T& t1)
        {
            if (element(t0, I) == element(t1, I))
                return Orderer<T, I-1>::compare(t0, t1);
            else
                return element(t0, I) < element(t1, I);
        }
    };
    template <typename T> struct Orderer<T, -1>
    {
        static bool compare(const T& t0, const T& t1)
        {
            return false;
        }
    };

Using templates it's possible to make the compiler generate the ugly if-else code. Then the task of providing the right element for the sorting is demanded to an element(int) function. Also, it's possible substitute the element(int) function with an element(int) member function (or maybe an operator) in `MyPoint` definition. This is how it work:

    template <> int element<MyPoint>(const MyPoint& p, int i)
    {
        // Watch out!
        // The higher is the i-value, the most significant is the member
        switch(i)
        {
            case 3:
                return p.color;
            case 2:
                return p.d;
            case 1:
                return p.y;
            case 0:
                return p.x;
            default:
                throw std::invalid_argument("Undefined element");
        }
    }
    bool mypoint_sort(const MyPoint& t0, const MyPoint& t1)
    {
        return Orderer<MyPoint, 3>::compare(t0, t1);
    }

and then `std::sort(pts.begin(), pts.end(), mypoint_sort);`

That's it! A more readable switch-case statement provides the priority of sorting.... and the `mypoint_sort` function call the template right specialization of Orderer Struct static compare function.

Here how you can find, compile and run the code for this example:

    git clone git://github.com/cybercase/funproject.git
    cd funproject/other
    g++ order.cpp -o order -Wall

One interesting thing I discovered while writing the code of this example, is that you can't use template function specialization. I found a discussion about this topic at <http://www.gotw.ca/publications/mill17.htm>. The Peter Dimov and Dave Abrahams example shows why template specialization can't be done with functions.

_-- 15/01/2012_
