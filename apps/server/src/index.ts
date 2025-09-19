import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { typeDefs, resolvers } from "./schema";
import { useServer } from "graphql-ws/use/ws";

const schema = makeExecutableSchema({ typeDefs, resolvers });

const server = new ApolloServer({
  schema,
});

const startServer = async () => {
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
  });

  // Create WebSocket server for subscriptions
  const httpServer = createServer();
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  });

  const serverCleanup = useServer(
    {
      schema,
      context: async (ctx: any, msg: any, args: any) => {
        // Add auth logic here if needed
        return {};
      },
      onConnect: async (ctx) => {
        console.log("WebSocket client connected");
      },
      onDisconnect: (ctx, code, reason) => {
        console.log("WebSocket client disconnected:", code, reason);
      },
    },
    wsServer
  );

  httpServer.listen(4001, () => {
    console.log(`🚀 HTTP Server ready at: ${url}`);
    console.log(`🚀 WebSocket server ready at: ws://localhost:4001/graphql`);
  });

  process.on("SIGINT", async () => {
    console.log("Shutting down servers...");
    await serverCleanup.dispose();
    process.exit(0);
  });
};

startServer().catch((err) => {
  console.error("Error starting server:", err);
  process.exit(1);
});
