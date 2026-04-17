self.addEventListener("install", (event) => {
  console.log("Service Worker Installed");
});

self.addEventListener("fetch", (event) => {
  // future me caching yaha hoga
});
