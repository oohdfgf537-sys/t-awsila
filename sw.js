importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDE_wyCpcoDStuUyNud9PiUPwezS83Xr00",
  authDomain: "tawsila-53870.firebaseapp.com",
  projectId: "tawsila-53870",
  storageBucket: "tawsila-53870.firebasestorage.app",
  messagingSenderId: "200480445099",
  appId: "1:200480445099:web:2be93d9778ba54c84b1dee"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  const title = payload.notification?.title || "FERRARI | فيراري";

  const options = {
    body: payload.notification?.body || "لديك إشعار جديد",
    icon: "./ferrari-icon.svg",
    data: payload.data || {}
  };

  self.registration.showNotification(title, options);
});

const CACHE_NAME = "ferrari-app-v2";

const FILES = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./ferrari-icon.svg"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache =>
            cache.put("./index.html", copy)
          );
          return response;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache =>
            cache.put(event.request, copy)
          );
        }
        return response;
      });
    })
  );
});
