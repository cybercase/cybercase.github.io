---
title: "Python 3 Metaprogramming"
description: "Experimenting with Python 3 Metaprogramming"
date: "2013-05-22T00:00:01.000Z"
---

# Python 3 Metaprogramming

How can you import XML files into Python 3?
And why would you?
This post doesn't answer the second question, but it definitely answers the first one :)

Everything in this post comes from a talk by David Beazley: [youtube video](https://www.youtube.com/watch?v=sPiWg5jSoZI).
Consider it a very short summary of its contents.

Let's start with the requirements: Python 3.3.
That's all!

And let's see what you're getting:

If you define a `structures.xml` file like this:

    <structures>
        <structure name="Stock">
            <field type="SizedString" maxlen="4">name</field>
            <field type="PosInteger">shares</field>
            <field type="PosFloat">price</field>
        </structure>
    </structures>

By the end of this post you'll be able to do this:

    >>> from structures import *
    >>> s = Stock("GOOG", 100, 99.0)
    >>> # DEFAULT INITIALIZER
    >>> s.name, s.shares, s.price
    ('GOOG', 100, 99.0)

    >>> # TYPE CHECKING
    >>> s.name = 100
    TypeError: Expected <class 'str'>

    >>> # CONSTRAINT CHECKING
    >>> s.name = "GOOOOOOG"
    ValueError: Too big

So, if this has piqued your curiosity, read on ;)

The first step is to have a look at descriptors.
Descriptors are how properties are implemented in Python (see the [Descriptor HowTo Guide](https://docs.python.org/3/howto/descriptor.html)). In this example, we use them to check values on assignment.
So, let's take as an example a descriptor that only allows values of type str up to a certain length.

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

To handle different descriptors, David uses a hierarchy of descriptors like the following:

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

Then he combines the descriptors using multiple inheritance. But pay attention to the MRO (method resolution order)!

    class Positive(Descriptor):
        def __set__(self, instance, value):
            if value < 0:
                raise ValueError('Expected >= 0')
            super().__set__(instance, value)

    class PosInteger(Integer, Positive):
        pass

    class PosFloat(Float, Positive):
        pass

Finally, to avoid repeating the variable's name in the descriptor constructor, David uses a metaclass to inject the name into the descriptor:

    class StructMeta(type):
        def __new__(cls, name, bases, clsdict):
            fields = [ key for key, val in clsdict.items()
                    if isinstance(val, Descriptor) ]
            for name in fields:
                clsdict[name].name = name
            clsobj = super().__new__(cls, name, bases, clsdict)
            return clsobj

The Stock class definition now becomes:

    class Stock(metaclass=StructMeta):
        name = SizedString(maxlen=4)
        shares = PosInteger()
        price = PosFloat()

        def __init__(self, name, shares, price):
            self.name = name
            self.shares = shares
            self.price = price

There's still another "problem" that David solves: the repeated code in the `__init__` method.
To address it, he changes the previous metaclass as follows:

    from collections import OrderedDict

    class StructMeta(type):
        @classmethod
        def __prepare__(cls, name, bases):
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

And the Stock class becomes:

    class Stock(metaclass=StructMeta):
        name = SizedString(maxlen=4)
        shares = PosInteger()
        price = PosFloat()

At this point it's convenient to introduce a Structure base class:

    class Structure(metaclass=StructMeta):
        pass

    class Stock(Structure):
        name = SizedString(maxlen=4)
        shares = PosInteger()
        price = PosFloat()

And finally we get to the XML part :)
The first goal is to generate Python code from the XML file. To do this, David uses these functions:

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

And the result of parsing the structures.xml file (defined at the beginning of the post) is:

    >>> print(_xml_to_code("structures.xml"))
    class Stock(Structure):
        name = SizedString(maxlen=4)
        shares = PosInteger()
        price = PosFloat()

The final step is hooking into the Python import system. You can find all the details about import hooks in [PEP 302](https://peps.python.org/pep-0302/).
We begin by defining a new importer class to append to `sys.meta_path`:

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

And an XML module loader:

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

And finally, here we are:

    python3.3 -i xmlimport.py
    >>> from structures import *
    >>> s = Stock("GOOG", 1, 1.0)

You can find the final version of `xmlimporter.py` and `structures.xml` in the `python_metaprogramming` folder of my [funproject repository](https://github.com/cybercase/funproject).

If you have 3 hours to spare and a lot of love for this metaprogramming stuff, I really recommend watching David Beazley's entire talk. Also, I apologize in advance for any errors in this post.

_-- 22/05/2013_