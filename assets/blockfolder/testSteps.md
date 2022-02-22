1. **Video handling**
 - Adds video to history in split mode when you watch them
  - Doesn't happen in Blacklist/Whitelist modes
 - Bullet mode
   - List of youtube video urls / titles and blocking state
 - Checkbox mode
   - Video checkbox allows / blocks video
   - Copy gets the url, not the title
   - Delete removes video from storage and video list
 - Add videos anytime using the block box
2. **Blocking**
 - Block with green overlay on video
 - Switch to allow for video, should allow video when page on refresh
 - Navigate to video using back / forward buttons, links (a lot of html persists, green overlay shouldn't)
 - Radio button selection should be persistent
 - PostBtn button should change text (Block Blacklist/Split), (Allow Whitelist)
 - Blacklist should block all currently listed videos
   - Videos not in the list are allowed
 - Whitelist should allow all currently listed videos
   - Not listed videos are blocked
3. **Library**
 - Delete video storage should not affect radio button or library page
 - Export list should pull up a title prompt
  - Title should show up in library under local shelf
 - Text box takes in a url, adds it to web shelf
  - Title : Url with mouseover tags
 - Local and web shelves cleared on clear resource storage
5. **Backend**
 - radio : "split || whitelist || blacklist"
 - resource : [{title: "", tags: [], resourceUrl:""}, ...] No video urls
 - v=*11charVid* : ["blockstatus", videoTitle]
 - Everything cleared after confirmation on clear all storage