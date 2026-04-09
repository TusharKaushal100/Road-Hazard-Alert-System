// backend/controllers/streamController.js
// Server-Sent Events endpoint for live hazard updates.

export const streamLiveUpdates = (req, res) => {
  res.setHeader("Content-Type",  "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection",    "keep-alive");
  res.flushHeaders();

  // Send a heartbeat every 15s to keep connection alive
  const heartbeat = setInterval(() => {
    res.write(": heartbeat\n\n");
  }, 15000);

  // Register this client so mockIngestionService can push to it
  global.liveUpdateEmitter = (post) => {
    res.write(`data: ${JSON.stringify(post)}\n\n`);
  };

  req.on("close", () => {
    clearInterval(heartbeat);
    global.liveUpdateEmitter = null;
  });
};
