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
const video = document.getElementById("video");
let previousBlobUrl = null;

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
      resolve(record && record.blob ? { url: URL.createObjectURL(record.blob), blob: record.blob } : null);
    };
    request.onerror = () => resolve(null);
  });
}

async function download(url) {
  const cached = await getStoredVideo(url);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    await storeVideo(url, blob);
    return { url: blobUrl, blob };
  } catch (error) {
    console.error(`Failed to download or cache ${url}:`, error);
    return null;
  }
}

async function preloadAllVideos() {
  for (const videoData of videosData) {
    const result = await download(videoData.url);
    if (!result) {
      console.warn("Failed to preload", videoData.url);
    }
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
  const result = await download(videoData.url);

  if (!result) {
    console.error("Unable to play video, download failed or not available offline.");
    return;
  }

  const blobUrl = result.url;

  video.classList.remove("show");
  video.classList.add("fade");
  video.height = videoData.height
  video.width = videoData.width
  video.controls = false
  // setTimeout(() => {
  video.src = blobUrl;
  video.currentTime = 0;

  video.onended = () => {
    console.log(`Video index ${currentVideoIndex} ended.`);
    const nextIndex = (currentVideoIndex + 1) % videosData.length;
    playVideoByIndex(nextIndex);
  };

  video.onerror = () => {
    console.error("Playback error. Skipping.");
    const nextIndex = (currentVideoIndex + 1) % videosData.length;
    playVideoByIndex(nextIndex);
  };

  video.play().then(() => {
    console.log(`Playing video ${currentVideoIndex}`);
    video.classList.remove("fade");
    video.classList.add("show");
  }).catch(error => {
    console.error("Playback failed:", error);
  });
  // }, 150);
}

document.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM loaded, caching all videos...");
  await preloadAllVideos();
  console.log("Starting playlist...");
  playVideoByIndex(0);
});

video.addEventListener("loadedmetadata", () => {
  if (previousBlobUrl && video.src !== previousBlobUrl && previousBlobUrl.startsWith("blob:")) {
    URL.revokeObjectURL(previousBlobUrl);
  }
  previousBlobUrl = video.src.startsWith("blob:") ? video.src : null;
});

window.addEventListener("beforeunload", () => {
  if (previousBlobUrl && previousBlobUrl.startsWith("blob:")) {
    URL.revokeObjectURL(previousBlobUrl);
  }
});