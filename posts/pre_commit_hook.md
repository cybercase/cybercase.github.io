---
title: "Pre-commit Hook"
description: "Writing a commit hook for git"
date: "2013-08-13T00:00:01.000Z"
---

# Pre-commit Hook

The project on which I'm working has acquired some young people recently.

For a couple of them it's even their first working experience so I'm really
trying to transmit them the importance of conventions and an uniform coding style.

It's usual (and perfectly normal) to find some coding style mistakes in their commits.
So, to help us happily code all together, I created a small pre-commit hook
to put in our repositories.

Right now it's just a simple no-tabs check, but with some small changes it could
check for use of deprecated functions or some forgotten `import pdb; pdb.set_trace()` :)

    # Files extensions in hooks.notabs are separated by "|"
    # Eg:
    #   git config hooks.notabs py|js

    exec 1>&2
    notabs=$(git config hooks.notabs)
    toplevel=$(echo "`git rev-parse --show-toplevel`/" | sed -e 's/[\/&]/\\&/g')
    if [ -n "$notabs" ] &&
        git diff --cached -- not_a_file `git diff --cached --name-only |
          egrep '\.('$notabs')$' |
          sed 's/^/'$toplevel'/g' | xargs` |
          egrep -qn $'^\+\.*\t'
    then
        echo "Error: Attempt to add TABS"
        echo
        echo "Do you really want to break our beautiful coding conventions? :("
        echo
        echo "Remove all tabs characters and stage again your changes."
        echo
        echo "To override this hook use:"
        echo
        echo "  git commit --no-verify"
        echo
        exit 1
    fi

To have it working:

copy this script into `repository_dir/.git/hooks/pre-commit`.
Add some file extensions to hooks.notabs variable (these must be separated by |).
Done!

Let's look at each parts in rigorous order of execution

- `notabs=$(git config hooks.notabs)`: retrieves from local config the files extensions to check

- `git diff --cached --name-only`: lists names of files that have staged changes

- `egrep '\.('$notabs')$'`: removes files having different extensions from the ones in notabs

- `sed 's/^/'$toplevel'/g'`: prepend the absoulute path to each filename

- `xargs`: creates a list of arguments using previous file names list

- `git diff --cached -- not_a_file`: returns staged changes for files coming from "xargs". Note that "not_a_file" is an unexistant file, specified in case that the output of xargs is empty. In fact if no files are specified the "git diff --cached" command would return staged changes for every file.

- `egrep -qn '^\+\.*\t'`: searches for all the lines starting with "+" and containing a tab

Note that this pre-commit hook can be easily bypassed using.

`git commit --no-verify`

This reflects exactly the same thought I want communicate to my collegues. Everyone should
struggle to pass the pre-commit hook checks, but no one should be forced to.

References:

1. [Customizing-Git-Git-Hooks](http://git-scm.com/book/en/Customizing-Git-Git-Hooks)

_-- 13/08/2013_
