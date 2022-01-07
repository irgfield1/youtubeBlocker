# Youtube Tracker Extension
## Purpose
Youtube Tracker/Blocker is intended to effectively block specific youtube videos, or allow only specific videos\
\
Youtube blocker uses the current url to know when to block any requests to google's video host\

The radio buttons determine the behavior of the extension:
- Blacklist : blocks all currently listed urls, and allows all unvisited urls
- Split : Base behavior, new urls default to allow
- Whitelist : allows all currently listed urls, blocks all unvisited url

Whitelist and blacklist don't add urls to storage in real time, split does\
All modes allow individual block toggling

This extension works on firefox

## Known Bugs
* Console thinks every reject({ type: "direct" }) piece is a real error and not just cause I haven't looked to see if I could change it
* postBtn doesn't switch between allow and block persistently
* Doesn't work on Chrome
* regex.match not working, using regex.test but not sure why
* No CSS in options.css
* No youtube api thus block channel functionality...

## Contact
Isaac Garfield\
isaac.garfield@inferno-systems.com
