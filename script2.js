const videosData = [
  {
    index: 0,
    url: "https://api.screenflex.pro/uploads/companies/62501d25714bb549f5c7933a/media/1678192006208-ForBiggerBlazes.mp4",
    duration: 15.09,
    x: 0,
    y: 0,
    width: 1954,
    height: 1172,
  },
  {
    index: 2,
    url: "https://api.screenflex.pro/uploads/companies/675756ad5d7b12345e853860/media/1744968812539.mp4",
    duration: 15.09,
    x: 0,
    y: 0,
    width: 1954,
    height: 1172,
  },
  {
    index: 3,
    url: "https://api.screenflex.pro/uploads/companies/675756ad5d7b12345e853860/media/1744968915345.mp4",
    duration: 15.09,
    x: 0,
    y: 0,
    width: 1954,
    height: 1172,
  },
  {
    index: 4,
    url: "https://api.screenflex.pro/uploads/companies/675756ad5d7b12345e853860/media/1744969116390.mp4",
    duration: 15.09,
    x: 0,
    y: 0,
    width: 1954,
    height: 1172,
  },
  {
    index: 5,
    url: "https://api.screenflex.pro/uploads/companies/675756ad5d7b12345e853860/media/1744969175660.mp4",
    duration: 15.09,
    x: 0,
    y: 0,
    width: 1954,
    height: 1172,
  },
  {
    index: 6,
    url: "https://api.screenflex.pro/uploads/companies/675756ad5d7b12345e853860/media/1744969255225.mp4",
    duration: 15.09,
    x: 0,
    y: 0,
    width: 1954,
    height: 1172,
  },
  {
    index: 7,
    url: "https://api.screenflex.pro/uploads/companies/675756ad5d7b12345e853860/media/1744969395705.mp4",
    duration: 15.09,
    x: 0,
    y: 0,
    width: 1954,
    height: 1172,
  },
  {
    index: 8,
    url: "https://api.screenflex.pro/uploads/companies/675756ad5d7b12345e853860/media/1744969552457.mp4",
    duration: 15.09,
    x: 0,
    y: 0,
    width: 1954,
    height: 1172,
  },
  {
    index: 9,
    url: "https://api.screenflex.pro/uploads/companies/675756ad5d7b12345e853860/media/1744969610421.mp4",
    duration: 15.09,
    x: 0,
    y: 0,
    width: 1954,
    height: 1172,
  },
  {
    index: 10,
    url: "https://api.screenflex.pro/uploads/companies/675756ad5d7b12345e853860/media/1744969672844.mp4",
    duration: 15.09,
    x: 0,
    y: 0,
    width: 1954,
    height: 1172,
  },
  {
    index: 11,
    url: "https://api.screenflex.pro/uploads/companies/675756ad5d7b12345e853860/media/1744969740473.mp4",
    duration: 15.09,
    x: 0,
    y: 0,
    width: 1954,
    height: 1172,
  },
  {
    index: 12,
    url: "https://api.screenflex.pro/uploads/companies/675756ad5d7b12345e853860/media/1744969796237.mp4",
    duration: 15.09,
    x: 0,
    y: 0,
    width: 1954,
    height: 1172,
  },
  {
    index: 13,
    url: "https://api.screenflex.pro/uploads/companies/675756ad5d7b12345e853860/media/1744969864961.mp4",
    duration: 15.09,
    x: 0,
    y: 0,
    width: 1954,
    height: 1172,
  },
];

let currentVideoIndex = 0;
const video1 = document.getElementById("video1");
const video2 = document.getElementById("video2");
const videoContainer = document.getElementById("videoContainer");
let activeVideo = video1;
let nextVideo = video2;

let dbPromise = indexedDB.open("VideoCacheDB", 1);
dbPromise.onupgradeneeded = (e) => {
  const db = e.target.result;
  db.createObjectStore("videos", { keyPath: "url" });
};

async function getDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("VideoCacheDB", 1);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function storeVideo(url, blob) {
  const db = await getDB();
  const tx = db.transaction("videos", "readwrite");
  tx.objectStore("videos").put({ url, blob });
  return tx.complete;
}

async function getStoredVideo(url) {
  const db = await getDB();
  const tx = db.transaction("videos", "readonly");
  const request = tx.objectStore("videos").get(url);
  return new Promise((resolve) => {
    request.onsuccess = () => {
      const record = request.result;
      resolve(
        record && record.blob
          ? { url: URL.createObjectURL(record.blob), blob: record.blob }
          : null,
      );
    };
    request.onerror = () => resolve(null);
  });
}

async function download(url) {
  const cached = await getStoredVideo(url);
  if (cached) {
    console.log(`Serving from cache: ${url}`);
    return cached;
  }

  try {
    console.log(`Downloading: ${url}`);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    // Store in cache but don't await completion to avoid blocking playback
    storeVideo(url, blob).catch((error) =>
      console.error("Failed to store video in cache:", error),
    );
    return { url: blobUrl, blob };
  } catch (error) {
    console.error(`Failed to download or cache ${url}:`, error);
    return null;
  }
}

async function preloadNextVideo(index) {
  if (!videosData || videosData.length <= 1) return;
  const nextIndex = (index + 1) % videosData.length;
  const nextVideoData = videosData[nextIndex];
  console.log(`Preloading next video: ${nextVideoData.url}`);
  const result = await download(nextVideoData.url);
  if (result) {
    nextVideo.src = result.url;
    // We only need to load metadata to get dimensions if not already in videosData
    // nextVideo.load(); // Load metadata if needed later
    nextVideo.height = nextVideoData.height;
    nextVideo.width = nextVideoData.width;
    console.log(`Next video preloaded: ${nextVideoData.url}`);
  } else {
    console.warn("Failed to preload next video:", nextVideoData.url);
    nextVideo.src = ""; // Clear the src if preload fails
  }
}
async function playVideoByIndex(index) {
  if (!videosData || videosData.length === 0) {
    console.warn("No videos data.");
    return;
  }

  if (index < 0 || index >= videosData.length) {
    console.warn(`Index out of bounds (${index}), resetting to 0`);
    index = 0;
  }

  currentVideoIndex = index;
  const videoData = videosData[currentVideoIndex];
  console.log(
    `[playVideoByIndex] Attempting to play video index ${currentVideoIndex}: ${videoData.url}`,
  );
  const result = await download(videoData.url);

  if (!result) {
    console.error(
      "[playVideoByIndex] Unable to play video, download failed or not available offline.",
    );
    // Optionally attempt to play the next video if this one fails
    playVideoByIndex((currentVideoIndex + 1) % videosData.length);
    return;
  }

  // Set the source of the next video element (which will become active)
  nextVideo.src = result.url;
  nextVideo.height = videoData.height;
  nextVideo.width = videoData.width;
  nextVideo.controls = false;

  console.log(
    `[playVideoByIndex] Set src for next video. Waiting for canplaythrough...`,
  );

  // Use a promise to wait for canplaythrough, handling immediate readiness
  const videoReadyPromise = new Promise((resolve) => {
    const onCanPlayThrough = () => {
      console.log(
        `[playVideoByIndex] canplaythrough event fired for video index ${currentVideoIndex}.`,
      );
      nextVideo.removeEventListener("canplaythrough", onCanPlayThrough);
      resolve();
    };
    nextVideo.addEventListener("canplaythrough", onCanPlayThrough);

    // If the video is already ready (e.g., from cache), the event might not fire.
    // Check readyState and resolve if it's already sufficient.
    if (nextVideo.readyState >= 4) {
      // HAVE_ENOUGH_DATA
      console.log(
        `[playVideoByIndex] Video index ${currentVideoIndex} is already ready (readyState >= 4).`,
      );
      onCanPlayThrough(); // Manually trigger the logic
    }
  });

  await videoReadyPromise;

  console.log(
    `[playVideoByIndex] Video is ready to play. Starting transition.`,
  );

  // Start fading out the active video
  activeVideo.classList.remove("show");
  activeVideo.classList.add("hide");
  console.log(`[playVideoByIndex] Added 'hide' to active video.`);

  // Use a promise to wait for the fade-out transition to finish
  const transitionEndPromise = new Promise((resolve) => {
    // If the activeVideo was not visible, the transitionend won't fire for 'hide'.
    // Resolve immediately in that case.
    if (!activeVideo.classList.contains("show")) {
      console.log(
        "[playVideoByIndex] Previous video was not visible, resolving transitionEndPromise immediately.",
      );
      resolve();
      return;
    }

    const onTransitionEnd = () => {
      console.log(
        `[playVideoByIndex] transitionend event fired for previous video.`,
      );
      activeVideo.removeEventListener("transitionend", onTransitionEnd);
      resolve();
    };
    activeVideo.addEventListener("transitionend", onTransitionEnd);
  });

  await transitionEndPromise;

  console.log(
    `[playVideoByIndex] Fade-out transition ended for previous video.`,
  );

  // Clear the source of the old video after it's hidden and transition is complete
  const oldVideoSrc = activeVideo.src; // Store src before clearing
  activeVideo.src = "";
  console.log(
    `[playVideoByIndex] Cleared src for previous active video. Old src: ${oldVideoSrc}`,
  );

  // Swap active and next video elements
  [activeVideo, nextVideo] = [nextVideo, activeVideo];
  console.log(`[playVideoByIndex] Swapped active and next video references.`);

  // Clean up the old blob URL after the swap and clearing the source
  if (oldVideoSrc && oldVideoSrc.startsWith("blob:")) {
    URL.revokeObjectURL(oldVideoSrc);
    console.log(`[playVideoByIndex] Revoked old blob URL: ${oldVideoSrc}`);
  }

  // Start playing the new active video and fade it in
  activeVideo.classList.remove("hide");
  activeVideo.classList.add("show");
  console.log(`[playVideoByIndex] Added 'show' to new active video.`);

  try {
    console.log(
      `[playVideoByIndex] Attempting to play new active video. readyState: ${activeVideo.readyState}`,
    );
    const playPromise = activeVideo.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log(
            "[playVideoByIndex] Playback successfully started for new active video.",
          );
          // Preload the video after the current one
          preloadNextVideo(currentVideoIndex);
        })
        .catch((error) => {
          console.error(
            "[playVideoByIndex] Playback failed for new active video:",
            error,
          );
          // Handle playback errors, e.g., try playing the next video
          playVideoByIndex((currentVideoIndex + 1) % videosData.length);
        });
    } else {
      // For browsers that don't return a Promise from play()
      console.log(
        "[playVideoByIndex] activeVideo.play() did not return a Promise.",
      );
      // Preload the video after the current one
      preloadNextVideo(currentVideoIndex);
    }
  } catch (error) {
    console.error("[playVideoByIndex] Error during activeVideo.play():", error);
    // Handle immediate errors from play()
    playVideoByIndex((currentVideoIndex + 1) % videosData.length);
  }

  // Re-attach the ended listener to the new active video
  activeVideo.onended = () => {
    console.log(`${activeVideo.id} ended.`);
    playVideoByIndex((currentVideoIndex + 1) % videosData.length);
  };

  // Ensure the other video (now nextVideo) also has its ended listener
  nextVideo.onended = () => {
    console.log(`${nextVideo.id} ended.`);
    playVideoByIndex((currentVideoIndex + 1) % videosData.length);
  };
}

async function preloadRemainingVideos() {
  if (!videosData || videosData.length <= 1) return;
  console.log("Starting to preload remaining videos in background.");
  // Start from the video after the one being preloaded by preloadNextVideo(0)
  for (let i = 2; i < videosData.length; i++) {
    const videoData = videosData[i];
    // No need to await here, let them download in parallel
    download(videoData.url).then((result) => {
      if (!result) {
        console.warn("Failed to preload", videoData.url);
      } else {
        console.log(`Preloaded ${videoData.url}`);
      }
    });
  }
  console.log("Background preloading initiated for remaining videos.");
}

document.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM loaded.");

  // Assuming videosData is available here
  if (videosData.length > 0) {
    const initialVideoData = videosData[0];
    console.log("Attempting to load initial video:", initialVideoData.url);
    const initialResult = await download(initialVideoData.url); // Download the first video

    if (initialResult) {
      video1.src = initialResult.url;
      video1.height = initialVideoData.height;
      video1.width = initialVideoData.width;
      video1.controls = false;

      video1.addEventListener("loadedmetadata", function handler() {
        video1.removeEventListener("loadedmetadata", handler); // Remove the listener
        console.log("Initial video metadata loaded.");

        // Ensure the initial video is visible and on top
        video1.classList.add("show");
        video1.classList.remove("hide");
        video1.style.zIndex = 1;
        video2.style.zIndex = 0; // Ensure video2 is behind

        videoContainer.classList.add("loaded"); // Indicate container is loaded

        video1
          .play()
          .catch((error) => console.error("Initial playback failed:", error));

        console.log("Initial video is playing.");
        preloadNextVideo(0); // Preload the second video
        preloadRemainingVideos(); // Start preloading the rest in the background
      });

      // If the video is already cached and loadedmetadata fires immediately,
      // the event listener might be added after the event.
      // We can check the readyState.
      if (video1.readyState >= 1) {
        // HAVE_METADATA
        console.log("Initial video metadata already available.");
        // Manually trigger the logic that would be in the loadedmetadata handler
        // Ensure the initial video is visible and on top
        video1.classList.add("show");
        video1.classList.remove("hide");
        video1.style.zIndex = 1;
        video2.style.zIndex = 0; // Ensure video2 is behind

        videoContainer.classList.add("loaded"); // Indicate container is loaded

        video1
          .play()
          .catch((error) => console.error("Initial playback failed:", error));

        console.log("Initial video is playing.");
        preloadNextVideo(0); // Preload the second video
        preloadRemainingVideos(); // Start preloading the rest in the background
      }
    } else {
      console.warn("Initial video download failed. Cannot start playback.");
      // Optionally display an error message to the user
    }
  } else {
    console.warn("No videos to play.");
    // Optionally display a message indicating no videos are available
  }

  // Add event listeners to both videos for the 'ended' event
  video1.onended = () => {
    console.log("video1 ended.");
    playVideoByIndex((currentVideoIndex + 1) % videosData.length);
  };
  video2.onended = () => {
    console.log("video2 ended.");
    playVideoByIndex((currentVideoIndex + 1) % videosData.length);
  };
});
