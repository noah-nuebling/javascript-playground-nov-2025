
Writing simple web stuff.
Also see `Idea - quote-unquote-framework` in our notes repo.

Couldn't get any of the VSCode plugins for inline-HTML autocomplete to work properly - In Webstorm this all works super well out of the box. (
This is very useful for the quote-unquote-framework) [Nov 2025] 

Running:

- Open Chrome like this:
    open -a /Applications/Google\ Chrome.app/ --args --allow-file-access-from-files
- Then just open index.html

Additional notes on NoFramework [Dec 2025]

This Reddit thread sounds like there is interest in something like this:
https://www.reddit.com/r/AskProgramming/comments/1puhkhg/why_is_the_modern_web_so_slow/

Recently been thinking:
Biggest downside to this is **no hot reloading** I think. 
For the MMF website I could just do layout debugging + design directly in the browser thanks to hot-reloading + inline CSS (tailwind)
I had been thinking - if you architect the site so it retains scroll position and state between reloads, you can get almost the same thing. But now Im not so sure how easy or time consuming that is. Hot reloading in React and Vue just works out of the box, and is very useful.
-> but you need a build system for that, I think. Maybe you even need a "components are a function of state"-type component system to male this work? Havent thought this through. [Dec 2025]

Recently heard Adam Wathan (Tailwind creator) talk about something similar - a framework that uses web components to give you much of the same ergonomics of react. i think he said it only made economical sense to sell it and keep it closed source. was only listening with one ear. [Dec 25 2025
