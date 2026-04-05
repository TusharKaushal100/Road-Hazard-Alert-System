// backend/controllers/streamController.js
export const streamLiveUpdates = (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const sendUpdate = (post) => {
    res.write(`data: ${JSON.stringify(post)}\n\n`);
  };


  global.liveUpdateEmitter = sendUpdate;

  req.on("close", () => {
    console.log("Client disconnected from live stream");
  });
};