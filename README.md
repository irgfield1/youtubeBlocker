# boring-youtube-blocker
## Purpose
Allow only YouTube videos you want, block the rest. So boring!\
\
Youtube blocker uses the current url to know when to block any requests to google's video host\

The radio buttons determine the behavior of the extension:
- Blacklist : blocks all currently listed urls, and allows all unvisited urls
- Split : Base behavior, new urls default to allow
- Whitelist : allows all currently listed urls, blocks all unvisited url

Whitelist and blacklist don't add urls to storage in real time, split does\
All modes allow individual block toggling

This extension works on Firefox

## User guide
Just step by step

## Known Bugs
* Console thinks every reject({ type: "direct" }) piece is a real error and not just cause I haven't looked to see if I could change it
* Doesn't work on Chrome
* No youtube api thus block channel functionality...

## Confusion
* regex.match not working, using regex.test but not sure why
* No CSS in options.css

## New features
- [x] Toggle checkboxes - css hide and show
- [x] Remove URL Button
- [x] Button to save url to clipboard

- Have URL and video name - background function that has webpage access
complex query selector
- Notify blocked by overlay on youtube video
- Move remove url and copy to a right click menu

## New features
Have URL and video name - background function that has webpage access
complex query selector\
Toggle checkboxes - css hide and show\
Remove URL\
Button to save url to clipboard\
Blocked by overlay on youtube video\


## Contact
Isaac Garfield\
isaac.garfield@inferno-systems.com
