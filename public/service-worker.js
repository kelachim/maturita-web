self.addEventListener('install', function(event) {
    event.waitUntil(self.skipWaiting());
  });
  
  self.addEventListener('activate', function(event) {
    event.waitUntil(self.clients.claim());
  });
  
  self.addEventListener('push', function(event) {
    if (event.data) {
      const payload = event.data.json();
      event.waitUntil(
        self.registration.showNotification(payload.title, {
          body: payload.body,
          icon: payload.icon,
        })
      );
    } else {
      console.log('Push event but no data');
    }
  });
  
  self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
      clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      })
      .then(function(clientList) {
        if (clientList.length > 0) {
          let client = clientList[0];
          for (let i = 0; i < clientList.length; i++) {
            if (clientList[i].focused) {
              client = clientList[i];
            }
          }
          return client.focus();
        }
        return clients.openWindow('/');
      })
    );
  });