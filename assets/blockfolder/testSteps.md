1. **Add Copy Delete Url Change blockstatus**
 - Add only runs on split mode
 - Copy gets the url, not the title
 - Delete Removes from storage and from the video list
 - Change blockstatus checkbox is available in bullet mode, and updates the html in it's state and in bullet mode
 - Checkbox button changes textContent on click
   - Checks mode -> Bullet mode -> Checks mode onclick
2. **Split, block and allow videos by urlbar and links**
 - Block with green overlay on urlbar
 - Switch to allow for video, refresh page green overlay should be removed
 - Go to another video either blocked or unblocked, test one, change blocking, refresh
 - Return to first video by back button
3. **Blacklist, Whitelist urlbar, links**
 - Radio button should persist when options menu is exited and between tabs
 - PostBtn button should change text
   - Block -> Allow in whitelist, Allow -> Block for split and blacklist
 - Blacklist should block all currently listed videos
   - In Blacklist videos not in the list should be allowed
   - If on a video, and you switch from blacklist to whitelist, refresh should block current video
 - Whitelist should allow all currently listed videos
   - A new video should be blocked
   - If on a video, and you switch from whitelist to blacklist, refresh should allow current video
4. **Library, Add Resource, Add url from blockbox**
 - Click Add Resource with nothing in box should load the assets/blockfolder/data.txt urls
 - Clear storage erases storage and all fields in bullet mode and checkbox mode
 - Adds internet resources


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
 - Switch to allow for video, should allow video when page is refreshed
 - Navigate to video using back / forward buttons, links
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