import * as signalR from "@microsoft/signalr";

const connections: Record<string, signalR.HubConnection> = {};

export async function getSignalRConnection(hubUrl: string): Promise<signalR.HubConnection> {
    const key = hubUrl.replace(/\/$/, "");
    if (connections[key]) return connections[key];

    const builder = new signalR.HubConnectionBuilder()
        .withUrl(key)
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information);

    const connection = builder.build();
    connections[key] = connection;

    try {
        await connection.start();
        console.info("[signalr] connected to", key);
    } catch (err) {
        console.warn("[signalr] initial connect failed, retrying with LongPolling", err);
        // try fallback to LongPolling
        try {
            const builder2 = new signalR.HubConnectionBuilder()
                .withUrl(key, { transport: signalR.HttpTransportType.LongPolling })
                .withAutomaticReconnect()
                .configureLogging(signalR.LogLevel.Information);
            const conn2 = builder2.build();
            connections[key] = conn2;
            await conn2.start();
            console.info("[signalr] connected (long polling) to", key);
        } catch (err2) {
            console.error("[signalr] failed to connect to hub", key, err2);
        }
    }

    return connections[key];
}

export function getCachedSignalRConnection(hubUrl: string): signalR.HubConnection | undefined {
    return connections[hubUrl.replace(/\/$/, "")];
}
