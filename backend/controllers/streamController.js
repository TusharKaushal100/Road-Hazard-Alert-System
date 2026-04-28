import { addSSEClient, removeSSEClient } from "../services/mockIngestionService.js";

export const streamLiveUpdates = (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.flushHeaders();

  res.write(": connected\n\n");

  const heartbeat = setInterval(() => {
    res.write(": heartbeat\n\n");
  }, 20000);

  const emit = (data) => res.write(data);
  addSSEClient(emit);

  global.liveUpdateEmitter = (post) => {
    res.write(`data: ${JSON.stringify(post)}\n\n`);
  };

  req.on("close", () => {
    clearInterval(heartbeat);
    removeSSEClient(emit);
  });
};