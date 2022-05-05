---
title: "Python 3 Metaprogramming"
description: "Experimenting with Python 3 Metaprogramming"
date: "2013-05-22T00:00:01.000Z"
---

# Python 3 Metaprogramming

How can you import XML files into Python 3?
And why you would?
... This blogpost doesn't answer this last question, but it's definetly going to answer the first one :)

Everything I'm writing is taken from this talk from David Beazley: [youtube video](https://www.youtube.com/watch?v=sPiWg5jSoZI).
Consider this post as a very little summary of its contents.

Let's start with the requirements:
Python 3.3
... that's all!

And let's see what you're getting:

If you define a file structures.xml like this

    <structures>
        <structure name="Stock">
            <field type="SizedString" maxlen="4">name</field>
            <field type="PosInteger">shares</field>
            <field type="PosFloat">price</field>
        </structure>
    </structures>

At the end of this blogpost you will get this

    >>> from structures import *
    >>> s = Stock("GOOG", 100, 99.0)
    >>> # DEFAULT INITIALIZER
    >>> s.name, s.shares, s.price
    ('GOOG', 1, 1.0)

    >>> # TYPE CHECKING
    >>> s.name = 100
    TypeError: Expected <class 'str'>

    >>> # CONSTRAINT CHECKING
    >>> s.name = "GOOOOOOG"
    ValueError: Too big

So, if this just aroused your curiosity, go on reading ;)

The first step is to have a look at descriptors.
Descriptors is just how properties are implemented in python [see this link]. In this example, we use them as classes to perform checks on values assignment.
So, let's take as example a descriptor that performs a check such that only values of type str within a certain length are allowed.

    class StringDescriptor:
        def __init__(self, name, maxlen):
            self.name = name
            self.maxlen = maxlen

        def __set__(self, instance, value):
            if type(value) != str:
                raise TypeError("Wrong type, expected: %s" % str(str))
            elif len(value) > self.maxlen:
                raise ValueError("String too long")
            instance.__dict__[self.name] = value

        def __get__(self, instance, cls):
            # Actually performs the default action. Just don't define this
            # method to get the default behavior.
            return instance.__dict__[self.name]

    class Stock:
        name = StringDescriptor("name", 4)
        def __init__(self, name):
            self.name = name

    >>> st = Stock("GOOG")
    >>> st.name = "GOOOOOG"
    Traceback (most recent call last):
      File "<stdin>", line 1, in <module>
      File "post.py", line 10, in __set__
        raise ValueError("String too long")
    ValueError: String too long

    >>> st.name = 1

    Traceback (most recent call last):
      File "<stdin>", line 1, in <module>
      File "post.py", line 8, in __set__
        raise TypeError("Wrong type, expected: %s" % str(str))
    TypeError: Wrong type, expected: <class 'str'>

    To handle different descriptors, David uses a descriptors hierarchy like the following:
    class Descriptor:
        def __init__(self, name=None):
            self.name = name
        def __set__(self, instance, value):
            instance.__dict__[self.name] = value
        def __delete__(self, instance):
            raise AttributeError("Can't delete")

    class Typed(Descriptor):
        ty = object
        def __set__(self, instance, value):
            if not isinstance(value, self.ty):
                raise TypeError('Expected %s' % self.ty)
            super().__set__(instance, value)

    class Sized(Descriptor):
        def __init__(self, *args, maxlen, **kwargs):
            self.maxlen = maxlen
            super().__init__(*args, **kwargs)
        def __set__(self, instance, value):
            if len(value) > self.maxlen:
                raise ValueError('Too big')
            super().__set__(instance, value)

    class String(Typed):
        ty = str

    class Integer(Typed):
        ty = int

    class Float(Typed):
        ty = float

Then merges the descriptors using multiple inheritance... But pay attention at MRO! (method resolution order)

    class Positive(Descriptor):
        def __set__(self, instance, value):
            if value < 0:
                raise ValueError('Expected >= 0')
            super().__set__(instance, value)

    class PosInteger(Integer, Positive):
        pass

    class PosFloat(Float, Positive):
        pass

Finally to get rid of the repeated variable's name in the descriptor constructor, David use a metaclass to inject the name into the descriptor:

    class StructMeta(type):
        def __new__(cls, name, bases, clsdict):
            fields = [ key for key, val in clsdict.items()
                    if isinstance(val, Descriptor) ]
            for name in fields:
                clsdict[name].name = name
            clsobj = super().__new__(cls, name, bases, clsdict)
            return clsobj

The Stock class definition now becomes

    class Stock(metaclass=StructMeta):
        name = SizedString(maxlen=4)
        shares = PosInteger()
        price = PosFloat()

        def __init__(self, name, shares, price):
            self.name = name
            self.shares = shares
            self.price = price

There is still another "problem" that David try to solve: the code repetition inside the **init** method.
To address this problem, he changes the previous metaclass as follows.
from collections import OrderedDict

    class StructMeta(type):
        @staticmethod
        def __prepare__(cls, name, bases=None):
            # this method returns the dictionary used by the class instance.
            # To generate a signature the parameters order is crucial, so an
            # OrderedDict is used
            return OrderedDict()

        def __new__(cls, name, bases, clsdict):
            fields = [ key for key, val in clsdict.items()
                    if isinstance(val, Descriptor) ]
            for name in fields:
                clsdict[name].name = name

            # the following block generates the code for __init__ method
            if len(fields):
                init_code = 'def __init__(self, %s):\n' % \
                            ', '.join(fields)
                for name in fields:
                    init_code += '    self.%s = %s\n' % (name, name)
                exec(init_code, globals(), clsdict)

            clsobj = super().__new__(cls, name, bases, dict(clsdict))
            return clsobj

And the Stock class becomes

    class Stock(metaclass=StructMeta):
        name = SizedString(maxlen=4)
        shares = PosInteger()
        price = PosFloat()

At this point it's convenient introduce a Structure base class:

    class Structure(metaclass=StructMeta):
        pass

    class Stock(Structure):
        name = SizedString(maxlen=4)
        shares = PosInteger()
        price = PosFloat()

And finally we get to the XML part :)
The first goal is to generate the python code from the XML file. To achieve this the David use these functions:

    from xml.etree.ElementTree import parse
    def _xml_to_code(filename):
        doc = parse(filename)
        code = ''
        for st in doc.findall('structure'):
            code += _xml_struct_code(st)
        return code

    def _xml_struct_code(st):
        stname = st.get('name')
        code = 'class %s(Structure):\n' % stname
        for field in st.findall('field'):
            name = field.text.strip()
            dtype = field.get('type')
            kwargs = ', '.join('%s=%s' % (key, val)
                                for key, val in field.items()
                                if key != 'type')
            code += '    %s = %s(%s)\n' % (name, dtype, kwargs)
        return code

And the result of parsing the structure.xml file (defined at the beginning of the blogpost) is:

    >>> print(_xml_to_code("structures.xml"))
    class Stock(Structure):
        name = SizedString(maxlen=4)
        shares = PosInteger()
        price = PosFloat()

The final step consists in hooking to the python import system. Full details about the new Import Hooks feature of Python3.3 are found at [PEP-302].
We begin defining a new importer class to append at sys.meta_path

    import os
    class StructImporter:
        def __init__(self, path):
            self._path = path
        def find_module(self, fullname, path=None):
            name = fullname.rpartition('.')[-1]
            if path is None:
                path = self._path
            for dn in path:
                filename = os.path.join(dn, name+'.xml')
                if os.path.exists(filename):
                    return StructXMLLoader(filename)
            return None

And an XML module loader

    import imp
    class StructXMLLoader:
        def __init__(self, filename):
            self._filename = filename
        def load_module(self, fullname):
            mod = sys.modules.setdefault(fullname,
                                        imp.new_module(fullname))
            mod.__file__ = self._filename
            mod.__loader__ = self
            code = _xml_to_code(self._filename)
            # actually this is bad. I should use mod.__dict__
            # instead of globals(), and add an import statement into
            # "code" to load Structure and the other classes.
            exec(code, globals(), mod.__dict__)
            return mod

    import sys
    def install_importer(path=sys.path):
        sys.meta_path.append(StructImporter(path))

    install_importer()

    And finally here we are:
    Python3.3 -i xmlimport.py
    >>> from structures import *
    >>> s = Stock("GOOG", 1, 1.0)

You can find the final version of the xmlimporter.py and structures.xml under the folder

`python_metaprogramming` in my git repository at:

`git://github.com/cybercase/funproject.git`

If you got 3 hours to spend, and a lot of love for this metaprogramming stuff, I really suggest to watch the entire video from David Beazley. Also, I apologize in advance for any error in this blogpost.

_-- 22/05/2013_
