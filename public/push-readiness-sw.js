self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  event.waitUntil((async () => {
    let payload = {};
    try {
      payload = event.data?.json() ?? {};
    } catch {
      payload = {};
    }

    const windows = await self.clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    });
    const visibleClient = windows.find((client) => client.visibilityState === "visible");
    if (visibleClient) {
      visibleClient.postMessage({
        type: "octagon-notification-push",
        notificationId: payload.notification_id ?? null,
      });
      return;
    }

    const title = typeof payload.title === "string" && payload.title.trim()
      ? payload.title.trim()
      : "Octagon HQ";
    const body = typeof payload.summary === "string" ? payload.summary : "You have a new update.";
    const route = typeof payload.route === "string" && payload.route.startsWith("/")
      ? payload.route
      : "/notifications";
    const icon = typeof payload.icon === "string"
      ? payload.icon
      : "https://codyking0602.github.io/ufc-goat-rankings/assets/app-icon.png";

    await self.registration.showNotification(title, {
      body,
      icon,
      badge: icon,
      tag: `octagon-notification-${payload.notification_id ?? "latest"}`,
      renotify: Number(payload.aggregate_count) > 1,
      data: {
        route,
        notificationId: payload.notification_id ?? null,
      },
    });
  })());
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil((async () => {
    const route = typeof event.notification.data?.route === "string"
      && event.notification.data.route.startsWith("/")
      ? event.notification.data.route
      : "/notifications";
    const targetUrl = new URL(route, self.location.origin).href;
    const windows = await self.clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    });

    const existing = windows.find((client) => client.url.startsWith(self.location.origin));
    if (existing) {
      if ("navigate" in existing) await existing.navigate(targetUrl);
      return existing.focus();
    }

    return self.clients.openWindow(targetUrl);
  })());
});
