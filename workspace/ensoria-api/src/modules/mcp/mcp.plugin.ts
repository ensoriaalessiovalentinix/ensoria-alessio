import fp from "fastify-plugin";
import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import type { JwtPayload } from "../../types/index.js";
import { UnauthorizedError } from "../../lib/errors.js";
import { registerTools } from "./mcp.tools.js";
import { registerResources } from "./mcp.resources.js";

function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "Ensoria OS",
    version: "1.0.0",
  });
  registerTools(server);
  registerResources(server);
  return server;
}

async function authenticateRequest(request: FastifyRequest): Promise<JwtPayload> {
  try {
    return await request.jwtVerify<JwtPayload>();
  } catch {
    throw new UnauthorizedError();
  }
}

export default fp(async function mcpPlugin(fastify: FastifyInstance) {
  const sessions = new Map<string, StreamableHTTPServerTransport>();

  // ── POST /api/mcp — Client-to-server messages ──
  fastify.post(
    "/api/mcp",
    {
      config: { rawBody: true },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await authenticateRequest(request);
      } catch {
        return reply.status(401).send({
          jsonrpc: "2.0",
          error: { code: -32001, message: "Unauthorized" },
          id: null,
        });
      }

      const sessionId = request.headers["mcp-session-id"] as string | undefined;
      let transport = sessionId ? sessions.get(sessionId) : undefined;

      try {
        if (!transport) {
          const body = request.body as Record<string, unknown>;

          // Only create a new transport for initialize requests
          if (!isInitializeRequest(body)) {
            return reply.status(400).send({
              jsonrpc: "2.0",
              error: { code: -32000, message: "No valid session. Send initialize first." },
              id: body?.id ?? null,
            });
          }

          transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => crypto.randomUUID(),
            onsessioninitialized: (sid: string) => {
              sessions.set(sid, transport!);
            },
          });

          transport.onclose = () => {
            // Clean up on close — find the session ID from the transport
            for (const [sid, t] of sessions) {
              if (t === transport) {
                sessions.delete(sid);
                break;
              }
            }
          };

          const server = createMcpServer();
          await server.connect(transport);
        }

        // Hand off to the transport — it manages the response lifecycle
        await transport.handleRequest(request.raw, reply.raw, request.body);
        reply.hijack();
      } catch (err) {
        fastify.log.error(err, "MCP POST handler error");
        // If reply hasn't been hijacked yet, send an error
        if (!reply.sent) {
          return reply.status(500).send({
            jsonrpc: "2.0",
            error: { code: -32603, message: "Internal server error" },
            id: null,
          });
        }
      }
    },
  );

  // ── GET /api/mcp — Server-to-client notifications (SSE) ──
  fastify.get(
    "/api/mcp",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await authenticateRequest(request);
      } catch {
        return reply.status(401).send("Unauthorized");
      }

      const sessionId = request.headers["mcp-session-id"] as string;
      const transport = sessionId ? sessions.get(sessionId) : undefined;

      if (!transport) {
        return reply.status(404).send("Session not found");
      }

      try {
        await transport.handleRequest(request.raw, reply.raw);
        reply.hijack();
      } catch (err) {
        fastify.log.error(err, "MCP GET handler error");
        if (!reply.sent) {
          return reply.status(500).send("Internal server error");
        }
      }
    },
  );

  // ── DELETE /api/mcp — Session termination ──
  fastify.delete(
    "/api/mcp",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await authenticateRequest(request);
      } catch {
        return reply.status(401).send("Unauthorized");
      }

      const sessionId = request.headers["mcp-session-id"] as string;
      const transport = sessionId ? sessions.get(sessionId) : undefined;

      if (!transport) {
        return reply.status(404).send("Session not found");
      }

      try {
        await transport.handleRequest(request.raw, reply.raw);
        sessions.delete(sessionId);
        reply.hijack();
      } catch (err) {
        fastify.log.error(err, "MCP DELETE handler error");
        if (!reply.sent) {
          return reply.status(500).send("Internal server error");
        }
      }
    },
  );

  // ── Session cleanup interval ──
  // Periodically clean up stale sessions (no activity for 30 min)
  const CLEANUP_INTERVAL = 5 * 60 * 1000; // every 5 minutes
  const SESSION_TTL = 30 * 60 * 1000; // 30 minutes

  const cleanupTimer = setInterval(() => {
    // StreamableHTTPServerTransport doesn't expose lastActivity,
    // so this is a simple guard against unbounded growth.
    // A production version would track session timestamps.
    if (sessions.size > 100) {
      fastify.log.warn(`MCP sessions exceeded 100 (${sessions.size}), clearing all`);
      sessions.clear();
    }
  }, CLEANUP_INTERVAL);

  // Cleanup on server close
  fastify.addHook("onClose", (_instance, done) => {
    clearInterval(cleanupTimer);
    sessions.clear();
    done();
  });
});
