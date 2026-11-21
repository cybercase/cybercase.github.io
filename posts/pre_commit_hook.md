---
title: "Pre-commit Hook"
description: "Writing a commit hook for git"
date: "2013-08-13T00:00:01.000Z"
---

# Pre-commit Hook

The project I'm working on has recently taken on some junior developers.

For a couple of them it's even their first job, so I'm really
trying to get across the importance of conventions and a uniform coding style.

It's common (and perfectly normal) to find some coding style mistakes in their commits.
So, to help us all code happily together, I created a small pre-commit hook
for our repositories.

Right now it's just a simple no-tabs check, but with some small changes it could
check for the use of deprecated functions or some forgotten `import pdb; pdb.set_trace()` :)

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

To make it work:

1. Copy this script into `repository_dir/.git/hooks/pre-commit`.
2. Add some file extensions to the `hooks.notabs` config variable, separated by `|`.
3. Done!

Let's look at each part, in strict order of execution:

- `notabs=$(git config hooks.notabs)`: retrieves the file extensions to check from the local config

- `git diff --cached --name-only`: lists names of files that have staged changes

- `egrep '\.('$notabs')$'`: filters out files whose extensions aren't in notabs

- `sed 's/^/'$toplevel'/g'`: prepends the absolute path to each filename

- `xargs`: turns the list of file names into arguments

- `git diff --cached -- not_a_file`: returns the staged changes for the files coming from `xargs`. Note that `not_a_file` is a nonexistent file, added in case the output of `xargs` is empty: if no files were specified, `git diff --cached` would return the staged changes for every file.

- `egrep -qn '^\+\.*\t'`: searches for all the lines starting with "+" and containing a tab

Note that this pre-commit hook can easily be bypassed with:

`git commit --no-verify`

This is exactly the idea I want to get across to my colleagues: everyone should
strive to pass the pre-commit hook checks, but no one should be forced to.

References:

1. [Customizing-Git-Git-Hooks](https://git-scm.com/book/en/Customizing-Git-Git-Hooks)

_-- 13/08/2013_