// Register the Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // CHANGE THIS LINE
        navigator.serviceWorker.register('/my-todo-pwa/sw.js')
            .then(registration => {
                console.log('Service Worker registered! Scope:', registration.scope);
            })
            .catch(err => {
                console.log('Service Worker registration failed:', err);
            });
    });
}

// ... rest of app.js code remains the same ...
