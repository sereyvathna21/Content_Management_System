const signalR = require("@microsoft/signalr");

const HUB_URL = process.env.HUB_URL || "http://localhost:5001/hubs/contact";

async function run() {
  const connection = new signalR.HubConnectionBuilder()
    .withUrl(HUB_URL)
    .withAutomaticReconnect()
    .build();

  connection.on("ContactCreated", (c) => {
    console.log("[SignalR] ContactCreated event:", JSON.stringify(c, null, 2));
  });

  connection.onclose((err) => {
    console.log("[SignalR] connection closed", err || "");
  });

  try {
    await connection.start();
    console.log("[SignalR] connected to", HUB_URL);
  } catch (e) {
    console.error("[SignalR] failed to connect", e);
    process.exit(1);
  }

  // keep process alive
  process.on("SIGINT", async () => {
    await connection.stop();
    process.exit(0);
  });
}

run();
