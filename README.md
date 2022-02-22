# boring-youtube-blocker

## Purpose

Allow only YouTube videos you want, block the rest. Nice and boring!\
Edit save and reapply blocklists, or get video lists online.

This extension was built for Firefox and ported to Chrome

## User guide

### How it works

### Install

1. Clone this repository and extract files
2. In Firefox navigate to about:debugging#/runtime/this-firefox (about:debugging then click This Firefox)
3. Click load temporary add ons, then click on manifest.json in the extracted folder
4. A picture of a cat should pop up in the top right of the browser with other extensions
\
\
**This extension is not published, temporary addons do not persist if you close the browser**

### Usage

On startup the extension has no url list. Urls can be added individually using the first text box, or from a json file like what you find in "assets/data.txt". Using the add resource box on the main popup directly inserts the list, on the library page saves the list which can then be applied later
In split mode, the extension will add new youtube urls to a video history, their blockstatus defaults to allow and can be modified whenever.\
Once you have some URLs, when you click the extension, those urls will show up with their blocking status above the first text box.

- The "Checkbox style" button allows blockstatus editing, as well as copy and delete url buttons.
- The "Clear storage" button will erase the whole url list, as well as resetting the radio button in storage.
- The export list button saves the list for later and **Clears the list**

- The radio buttons determine the behavior of the extension:

  - Blacklist : blocks all currently listed urls, and allows all unvisited urls
  - Split : Default behavior, new urls default to allow
  - Whitelist : allows all currently listed urls, blocks all unvisited url

## Blocking

Currently a youtube video will block by spinning infinitely and being covered by a green overlay in normal view. In theatre mode or fullscreen, will only spin indefinitely.
Youtube blocker uses the current tab url, or the tab id of background requests to know when to block any requests to google's video host\
This is because Youtube video requests are from the video url of the first video you watched/clicked from the home page instead of the current video since no html changes between videos watched.

## Known Bugs

- Bootstrap will not stay on one line on chrome
- No youtube api thus block channel functionality...
- New / weird coverGreen when not blocked...
- Cookie “SIDCC” will be soon rejected because it has the “SameSite” attribute set to “None” or an invalid value, without the “secure” attribute.

## New features

- [x] Notify blocked by overlay on youtube video (in normal view)
- Move remove url and copy to a right click menu....\*

\* Or do something else, I don't care

## Contact

Isaac Garfield\
isaac.garfield@inferno-systems.com
