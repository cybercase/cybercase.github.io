---
title: "Pre-commit Hook - PEP8 Version"
description: "Python PEP8 commit hook for git"
date: "2013-09-15T00:00:01.000Z"
---

# Pre-commit Hook

## PEP8 Version

A couple of days ago I refactored and improved my pre-commit hook so that it also checks Python source files for PEP8 compliance. To do this I used the pep8 tool, which you can easily install with:

`pip install pep8`

And here's the new pre-commit hook:

    #!/bin/bash
    #
    # TAB CHECK:
    #
    # Searches tab characters in staged changes.
    # To specify file extensions to check use "hooks.notabs" variable.
    # Extensions are separated by "|".
    # Eg:
    #   git config hooks.notabs html|js
    #
    # PEP8 CHECK:
    #
    # run pep8 on all python staged files.
    # To specify pep8 command options use "hook.pep8options" variable
    #
    # Eg:
    #   git config hook.pep8 "--ignore=E226,E302"

    exec 1>&2

    notabs=$(git config hooks.notabs)
    notabs_error=0
    for f in `git diff --cached --name-only | egrep "\.("$notabs")$"`
    do
        lines=`git show :$f | fgrep -n $'\t'`
        if [ -n "$lines" ]; then
            echo "TAB(s) found in:" $f "at line(s)"
            echo $lines
            notabs_error=1
        fi
    done

    if [ $notabs_error -eq 1 ]; then
        echo
        echo "Remove all TAB(s) characters and stage again your changes."
        echo
        exit 1
    fi

    pep8_options=$(git config hooks.pep8options)
    pep8_error=0
    for f in `git diff --cached --name-only | egrep ".py$"`
    do
        git show :$f | pep8 --format=$f":%(row)d:%(col)d: %(code)s %(text)s" $pep8_options -
        if [ $? -eq 1 ]; then
            pep8_error=1
        fi
    done

    if [ $pep8_error -eq 1 ]; then
        echo
        echo "Your commit is cause of one or more PEP8 error(s)"
        echo
        echo "Please fix these errors and stage again your changes"
        echo
        exit 1
    fi

This new version is quite straightforward, so I won't dig too much into it.
The two main changes are:

- I discovered the `git show` command :)
- I added the pep8 style check

About the latter, note that pep8 is now a requirement for using this hook. You can also configure your pep8 options by typing:

`git config --add hooks.pep8options "--ignore=E121,E122" # this ignores Error 121, 122`

A complete list of the pep8 errors and warnings is available here: https://pep8.readthedocs.io/en/latest/intro.html#error-codes

PS.

I've only been using this hook for a couple of days, so it may (probably) have some bugs. Feel free to contribute at <https://github.com/cybercase/funproject/blob/master/experiments/pre-commit> ;)
