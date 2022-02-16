# boring-youtube-blocker

## Purpose

Allow only YouTube videos you want, block the rest.\* So boring!\
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

On startup the extension has no url list. Urls can be added individually using the first text box, or from a json file like what you find in "assets/data.txt".
Lastly, in split mode, the extension will add new youtube urls to the url list as allowed urls.\
Once you have some URLs, when you click the extension, those urls will show up with their blocking status above the first text box.

- The "Checkbox style" button allows blockstatus editing, alongside copy and delete url buttons.
- The "Clear storage" button will erase the whole url list, as well as resetting the radio button in storage.
- The add resource button currently adds the data.txt file if the box is empty. It adds local resources with a path relative to manifest.json in the extension files. It should be able to add internet resources, but I haven't tested that.

- The radio buttons determine the behavior of the extension:

  - Blacklist : blocks all currently listed urls, and allows all unvisited urls
  - Split : Base behavior, new urls default to allow
  - Whitelist : allows all currently listed urls, blocks all unvisited url

## Blocking

Currently a youtube video will block by spinning infinitely and never having the lighter bar of loaded video.
This is ugly, but it works....

## Known Bugs

- Bootstrap will not stay on one line on chrome
- No youtube api thus block channel functionality...

## Confusion

- Console thinks every reject({ type: "direct" }) piece is a real error and not just cause I haven't looked to see if I could change it
- regex.match not working, using regex.test but not sure why
- Lots of css confusion. Awkward

## New features

- [x] Toggle checkboxes - css hide and show
- [x] Remove URL Button
- [x] Button to save url to clipboard
- [x] Have URL and video name - background function that has webpage access
      complex query selector -> Done with youtube data api
- [x] Notify blocked by overlay on youtube video (in normal view)
- Move remove url and copy to a right click menu....

\* Or do something else, we don't care

## Contact

Isaac Garfield\
isaac.garfield@inferno-systems.com
