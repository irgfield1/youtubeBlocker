# boring-youtube-blocker

## Purpose

Allow only YouTube videos you want, block the rest. So boring!\
\
Youtube blocker uses the current url to know when to block any requests to google's video host\

Whitelist and blacklist don't add new urls to storage automatically, split does\
All modes allow individual block toggling

This extension is optimized for Firefox

## User guide

### Install

1. Clone this repository and extract files
2. In Firefox navigate to about:debugging#/runtime/this-firefox (about:debugging then click This Firefox)
3. Click load temporary add ons, then click on manifest.json in the extracted folder
4. A picture of a cat should pop up in the top right of the browser with other extensions

### Usage

- Click the cat image to open the options menu which contains:

  - A url list (initially empty)
  - A block box, which blocks any youtube video url on click
  - A checkbox style button, which shifts the url list from a static list to an editable list
  - An add resource box, which takes in JSON data and adds it to your url list
  - Radio buttons, which control the blocking behavior, as well as blocking or allowing all listed urls

- In Checkbox mode,

  - click on the box to change any url from blocked to allowed
  - Copy the url
  - Remove a url from storage

- Clear storage completly empties the url cache

-

- The radio buttons determine the behavior of the extension:

  - Blacklist : blocks all currently listed urls, and allows all unvisited urls
  - Split : Base behavior, new urls default to allow
  - Whitelist : allows all currently listed urls, blocks all unvisited url

## Known Bugs

- Console thinks every reject({ type: "direct" }) piece is a real error and not just cause I haven't looked to see if I could change it
- Bootstrap looks weird on chrome
- No youtube api thus block channel functionality...
- If you navigate away from the tab, the video plays in the background...

## Confusion

- regex.match not working, using regex.test but not sure why
- No CSS in options.css

## New features

- [x] Toggle checkboxes - css hide and show
- [x] Remove URL Button
- [x] Button to save url to clipboard

- Have URL and video name - background function that has webpage access
  complex query selector
- Notify blocked by overlay on youtube video
- Move remove url and copy to a right click menu

# <<<<<<< Updated upstream

## New features

Have URL and video name - background function that has webpage access
complex query selector\
Toggle checkboxes - css hide and show\
Remove URL\
Button to save url to clipboard\
Blocked by overlay on youtube video\

> > > > > > > Stashed changes

## Contact

Isaac Garfield\
isaac.garfield@inferno-systems.com
