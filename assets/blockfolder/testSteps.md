1. Add Copy Delete Url Change blockstatus
 - Add only runs on split mode
 - Copy gets the url, not the title
 - Delete Removes from storage and from the video list
 - Change blockstatus checkbox is available in bullet mode, and updates the html in it's state and in bullet mode
 - Checkbox button changes textContent on click
   - Checks mode -> Bullet mode -> Checks mode onclick
2. Split, block and allow videos by urlbar and links
 - Block with green overlay on urlbar
 - Switch to allow for video, refresh page green overlay should be removed
 - Go to another video either blocked or unblocked, test one, change blocking, refresh
 - Return to first video by back button
3. Blacklist, Whitelist urlbar, links
 - Radio button should persist when options menu is exited and between tabs
 - PostBtn button should change text
   - Block -> Allow in whitelist, Allow -> Block for split and blacklist
 - Blacklist should block all currently listed videos
 - If on a video, refresh should block current video
 - A new video should be allowed
 - Whitelist should allow all currently listed videos
 - Refresh should allow current video
 - A new video should be blocked
4. Add Resource, Add url from blockbox
 - Click with nothing in box should load the assets/blockfolder/data.txt urls
 - Clear storage erases storage and all fields in bullet mode and checkbox mode
 - *Hopefully adds internet resources