(() => {
    let youtubeLeftControls, youtubePlayer;
    let currentVideo = ""; //set this variable to string
    let currentVideoBookmarks = []

    chrome.runtime.onMessage.addListener((obj, sender, response) => { //take the message from background.js
        const { type, value, videoId} = obj
        if(type === "NEW"){
            currentVideo = videoId;
            newVideoLoaded()
        }
    });

    const fetchBookmarks = () => { // get bookmarks
        return new Promise((resolve) => { 
            chrome.storage.sync.get([currentVideo], (obj) => { //try to get current video and obj
                resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]): []) //if there is, resolve this but if there isn't, parse it
            })
        })
    }

    async function newVideoLoaded (){
        const bookmarkBtnExists = document.getElementsByClassName('bookmark-btn')[0]
        currentVideoBookmarks = await fetchBookmarks();

        if (!bookmarkBtnExists){
            const bookmarkBtn = document.createElement("img");
            bookmarkBtn.src = chrome.runtime.getURL('assets/bookmark.png')
            bookmarkBtn.className = "ytp-button " + "bookmark-btn"
            bookmarkBtn.title = "Click to bookmark current timestamp"

            youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0];
            youtubePlayer = document.getElementsByClassName('video-stream')[0];

            youtubeLeftControls.appendChild(bookmarkBtn); // add button for adding bookmark
            bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
        }
    }

    async function addNewBookmarkEventHandler(){
        const currentTime = youtubePlayer.currentTime //this is an attribute that youtube gives us
        const newBookmark = {
            time: currentTime,
            desc: "Bookmark at " + convertHMS(currentTime), // convert to hour minute and seconds
        };

        currentVideoBookmarks = await fetchBookmarks()

        chrome.storage.sync.set({
            [currentVideo]: JSON.stringify([...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b)) //take currentVideoBookmarks and add a newBookmark to that list, and sort these in ascending orders

        })
    }

    newVideoLoaded();// if we refresh the page, this doesn't trigger to 9. line on the code, so we call this function twice

})();

function convertHMS(value) {
    const sec = parseInt(value, 10); // convert value to number if it's string
    let hours   = Math.floor(sec / 3600); // get hours
    let minutes = Math.floor((sec - (hours * 3600)) / 60); // get minutes
    let seconds = sec - (hours * 3600) - (minutes * 60); //  get seconds
    // add 0 if value < 10; Example: 2 => 02
    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    if(hours != 00){
        return hours+':'+minutes+':'+seconds; // Return is HH : MM : SS
    }
    else{
        return minutes+':'+seconds; // Return is MM : SS
    }

}