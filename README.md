# Code Completion work.
## Creation of a VS Code extension that works in similar fashion to GitHub's "CoPilot." This extension is currently using EleutherAI/gpt-neox-20b LLM.

# GOALS and TASKS:
    ✅ Get more than one line of code suggestion being displayed for the user.

    ✅ Give users more options for suggestions to flip through. Options:
        (1) One line of generated code.
        (2) Two lines of generated code.
        (3) Three lines of generated code.

    - Get Generation to still display, even after first space in code:
        [currently, if "import " is typed, code will display suggestions.]
        [ - - - - , if "import nu" is typed, code will NOT display suggestions.]

    - Support user settings support, to be able to put in custom API KEY for their own use.
