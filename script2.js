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

let currentBlobUrl1 = null;
let currentBlobUrl2 = null;

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
      resolve(record ? record.blob : null);
    };
    request.onerror = () => {
      console.error("Error getting stored video:", request.error);
      resolve(null);
    };
  });
}

async function download(url) {
  console.log(`[download] Attempting to get video for: ${url}`);
  const cachedBlob = await getStoredVideo(url);
  if (cachedBlob) {
    console.log(`[download] Serving blob from cache for: ${url}`);
    return cachedBlob;
  }

  try {
    console.log(`[download] Downloading blob from network for: ${url}`);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const blob = await response.blob();
    console.log(`[download] Downloaded blob for: ${url}`);
    storeVideo(url, blob).catch((error) =>
      console.error("[download] Failed to store video in cache:", error),
    );
    return blob;
  } catch (error) {
    console.error(`[download] Failed to download blob for ${url}:`, error);
    return null; // Crucially, you return null here on failure
  }
}

async function preloadNextVideo(index) {
  if (!videosData || videosData.length <= 1) return;
  const nextIndex = (index + 1) % videosData.length;
  const nextVideoData = videosData[nextIndex];
  console.log(`[preloadNextVideo] Preloading next video: ${nextVideoData.url}`);
  const blob = await download(nextVideoData.url);
  if (blob) {
    console.log(
      `[preloadNextVideo] Next video blob preloaded: ${nextVideoData.url}`,
    );
  } else {
    console.warn(
      "[preloadNextVideo] Failed to preload next video blob:",
      nextVideoData.url,
    );
  }
}

async function playVideoByIndex(index) {
  if (!videosData || videosData.length === 0) {
    console.warn("[playVideoByIndex] No videos data.");
    return;
  }

  if (index < 0 || index >= videosData.length) {
    console.warn(
      `[playVideoByIndex] Index out of bounds (${index}), resetting to 0`,
    );
    index = 0;
  }

  currentVideoIndex = index;
  const videoData = videosData[currentVideoIndex];
  console.log(
    `[playVideoByIndex] Attempting to play video index ${currentVideoIndex}: ${videoData.url}`,
  );

  const videoBlob = await download(videoData.url);

  if (!videoBlob) {
    console.error(
      "[playVideoByIndex] Unable to get video blob, download failed or not available offline.",
    );
    playVideoByIndex((currentVideoIndex + 1) % videosData.length);
    return;
  }

  const newBlobUrl = URL.createObjectURL(videoBlob);
  console.log(`[playVideoByIndex] Created new blob URL: ${newBlobUrl}`);

  // Set the source of the next video element BEFORE revoking the old URL
  nextVideo.src = newBlobUrl;
  nextVideo.height = videoData.height;
  nextVideo.width = videoData.width;
  nextVideo.controls = false;
  console.log(`[playVideoByIndex] Set nextVideo.src to: ${nextVideo.src}`);

  if (nextVideo === video1) {
    if (currentBlobUrl1) {
      URL.revokeObjectURL(currentBlobUrl1);
      console.log(
        `[playVideoByIndex] Revoked old blob URL for video1: ${currentBlobUrl1}`,
      );
    }
    currentBlobUrl1 = newBlobUrl;
  } else {
    if (currentBlobUrl2) {
      URL.revokeObjectURL(currentBlobUrl2);
      console.log(
        `[playVideoByIndex] Revoked old blob URL for video2: ${currentBlobUrl2}`,
      );
    }
    currentBlobUrl2 = newBlobUrl;
  }

  console.log(
    `[playVideoByIndex] Waiting for canplaythrough on nextVideo (${nextVideo.id})... readyState: ${nextVideo.readyState}`,
  );

  const videoReadyPromise = new Promise((resolve) => {
    const onCanPlayThrough = () => {
      console.log(
        `[playVideoByIndex] canplaythrough event fired for video index ${currentVideoIndex} on ${nextVideo.id}.`,
      );
      nextVideo.removeEventListener("canplaythrough", onCanPlayThrough);
      resolve();
    };
    nextVideo.addEventListener("canplaythrough", onCanPlayThrough);

    if (nextVideo.readyState >= 4) {
      console.log(
        `[playVideoByIndex] Video index ${currentVideoIndex} on ${nextVideo.id} is already ready (readyState >= 4).`,
      );
      onCanPlayThrough();
    }
  });

  await videoReadyPromise;

  console.log(
    `[playVideoByIndex] Video on ${nextVideo.id} is ready to play. Starting transition.`,
  );

  activeVideo.classList.remove("show");
  activeVideo.classList.add("hide");
  console.log(
    `[playVideoByIndex] Added 'hide' to active video (${activeVideo.id}).`,
  );

  const transitionEndPromise = new Promise((resolve) => {
    const onTransitionEnd = () => {
      console.log(
        `[playVideoByIndex] transitionend event fired for previous video (${activeVideo.id}).`,
      );
      activeVideo.removeEventListener("transitionend", onTransitionEnd);
      resolve();
    };
    activeVideo.addEventListener("transitionend", onTransitionEnd);

    if (!activeVideo.classList.contains("show")) {
      console.log(
        `[playVideoByIndex] Previous video (${activeVideo.id}) was not visible, resolving transitionEndPromise immediately.`,
      );
      resolve();
    }
  });

  await transitionEndPromise;

  console.log(
    `[playVideoByIndex] Fade-out transition ended for previous video (${activeVideo.id}).`,
  );

  activeVideo.src = "";
  console.log(
    `[playVideoByIndex] Cleared src for previous active video (${activeVideo.id}).`,
  );

  [activeVideo, nextVideo] = [nextVideo, activeVideo];
  console.log(
    `[playVideoByIndex] Swapped activeVideo (${activeVideo.id}) and nextVideo (${nextVideo.id}) references.`,
  );

  activeVideo.classList.remove("hide");
  activeVideo.classList.add("show");
  console.log(
    `[playVideoByIndex] Added 'show' to new active video (${activeVideo.id}).`,
  );

  try {
    console.log(
      `[playVideoByIndex] Attempting to play new active video (${activeVideo.id}). readyState: ${activeVideo.readyState}`,
    );
    const playPromise = activeVideo.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log(
            `[playVideoByIndex] Playback successfully started for new active video (${activeVideo.id}).`,
          );
          preloadNextVideo(currentVideoIndex);
        })
        .catch((error) => {
          console.error(
            `[playVideoByIndex] Playback failed for new active video (${activeVideo.id}):`,
            error,
          );
          playVideoByIndex((currentVideoIndex + 1) % videosData.length);
        });
    } else {
      console.log(
        `[playVideoByIndex] activeVideo.play() did not return a Promise for ${activeVideo.id}.`,
      );
      preloadNextVideo(currentVideoIndex);
    }
  } catch (error) {
    console.error(
      `[playVideoByIndex] Error during activeVideo.play() on ${activeVideo.id}:`,
      error,
    );
    playVideoByIndex((currentVideoIndex + 1) % videosData.length);
  }

  activeVideo.onended = () => {
    console.log(`${activeVideo.id} ended.`);
    playVideoByIndex((currentVideoIndex + 1) % videosData.length);
  };

  nextVideo.onended = () => {
    console.log(`${nextVideo.id} ended.`);
    playVideoByIndex((currentVideoIndex + 1) % videosData.length);
  };
}

async function preloadRemainingVideos() {
  if (!videosData || videosData.length <= 1) return;
  console.log(
    "[preloadRemainingVideos] Starting to preload remaining videos in background.",
  );
  for (let i = 2; i < videosData.length; i++) {
    const videoData = videosData[i];
    download(videoData.url).then((blob) => {
      if (!blob) {
        console.warn(
          "[preloadRemainingVideos] Failed to preload blob for",
          videoData.url,
        );
      } else {
        console.log(
          `[preloadRemainingVideos] Preloaded blob for ${videoData.url}`,
        );
      }
    });
  }
  console.log(
    "[preloadRemainingVideos] Background preloading initiated for remaining videos.",
  );
}

document.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM loaded.");

  if (videosData && videosData.length > 0) {
    const initialVideoData = videosData[0];
    console.log(
      "[DOMContentLoaded] Attempting to load initial video:",
      initialVideoData.url,
    );

    const initialVideoBlob = await download(initialVideoData.url);

    if (initialVideoBlob) {
      const initialBlobUrl = URL.createObjectURL(initialVideoBlob);
      console.log(
        `[DOMContentLoaded] Created initial blob URL for video1: ${initialBlobUrl}`,
      );

      video1.src = initialBlobUrl;
      video1.height = initialVideoData.height;
      video1.width = initialVideoData.width;
      video1.controls = false;
      video1.classList.add("show");
      video1.classList.remove("hide");
      video1.style.zIndex = 1;
      video2.style.zIndex = 0;
      currentBlobUrl1 = initialBlobUrl;
      videoContainer.classList.add("loaded");

      const onInitialMetadataLoaded = () => {
        video1.removeEventListener("loadedmetadata", onInitialMetadataLoaded);
        console.log("[DOMContentLoaded] Initial video metadata loaded.");
        video1
          .play()
          .catch((error) =>
            console.error("[DOMContentLoaded] Initial playback failed:", error),
          );
        console.log("[DOMContentLoaded] Initial video is playing.");
        preloadNextVideo(0);
        preloadRemainingVideos();
      };

      video1.addEventListener("loadedmetadata", onInitialMetadataLoaded);

      if (video1.readyState >= 1) {
        console.log(
          "[DOMContentLoaded] Initial video metadata already available.",
        );
        onInitialMetadataLoaded();
      }
    } else {
      console.warn(
        "[DOMContentLoaded] Initial video download failed. Cannot start playback.",
      );
    }
  } else {
    console.warn("[DOMContentLoaded] No videos to play.");
  }

  video1.onended = () => {
    console.log("video1 ended.");
    playVideoByIndex((currentVideoIndex + 1) % videosData.length);
  };
  video2.onended = () => {
    console.log("video2 ended.");
    playVideoByIndex((currentVideoIndex + 1) % videosData.length);
    video2.pause();
  };

  window.addEventListener("beforeunload", () => {
    if (currentBlobUrl1) {
      URL.revokeObjectURL(currentBlobUrl1);
      console.log(
        `[beforeunload] Revoked blob URL for video1: ${currentBlobUrl1}`,
      );
    }
    if (currentBlobUrl2) {
      URL.revokeObjectURL(currentBlobUrl2);
      console.log(
        `[beforeunload] Revoked blob URL for video2: ${currentBlobUrl2}`,
      );
    }
  });
});
