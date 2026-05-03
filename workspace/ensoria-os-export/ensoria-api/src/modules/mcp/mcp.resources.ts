import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  ListResourceTemplatesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import * as peopleService from "../people/people.service.js";
import * as projectsService from "../projects/projects.service.js";
import * as dashboardService from "../dashboard/dashboard.service.js";

interface ResourceEntry {
  uriTemplate: string;
  name: string;
  description: string;
  mimeType: string;
  handler: (uri: URL, params: Record<string, string>) => Promise<{ uri: string; text: string; mimeType: string }>;
}

const templates: ResourceEntry[] = [
  {
    uriTemplate: "people://{id}",
    name: "person",
    description: "A person/contact in the CRM, including their projects",
    mimeType: "application/json",
    handler: async (uri, params) => {
      const id = params["id"] ?? uri.pathname.split("/").pop() ?? "";
      const person = await peopleService.getById(id);
      return { uri: uri.href, text: JSON.stringify(person, null, 2), mimeType: "application/json" };
    },
  },
  {
    uriTemplate: "project://{id}",
    name: "project",
    description: "A project with all nested resources",
    mimeType: "application/json",
    handler: async (uri, params) => {
      const id = params["id"] ?? uri.pathname.split("/").pop() ?? "";
      const project = await projectsService.getById(id);
      return { uri: uri.href, text: JSON.stringify(project, null, 2), mimeType: "application/json" };
    },
  },
  {
    uriTemplate: "dashboard://summary",
    name: "dashboard",
    description: "CRM dashboard with aggregate metrics, stage distribution, and recent activity",
    mimeType: "application/json",
    handler: async (uri) => {
      const dashboard = await dashboardService.getDashboard();
      return { uri: uri.href, text: JSON.stringify(dashboard, null, 2), mimeType: "application/json" };
    },
  },
];

/**
 * Simple RFC 6570 level-1 URI template matcher.
 * Supports `{var}` in path segments.
 */
function matchTemplate(uriTemplate: string, uri: string): Record<string, string> | null {
  // Escape regex special chars, then replace {var} with named capture groups
  const escaped = uriTemplate.replace(/[.+?^${}()|[\]\\]/g, (c) => {
    // Don't escape { and } that are part of {var} patterns
    if (c === "{" || c === "}") return c;
    return "\\" + c;
  });
  const regexStr = escaped.replace(/\{(\w+)\}/g, "(?<$1>[^/]+)");
  const regex = new RegExp(`^${regexStr}$`);
  const match = uri.match(regex);
  if (!match) return null;
  return match.groups as Record<string, string> ?? {};
}

/**
 * Register resource templates directly on the McpServer's underlying Server.
 * This bypasses the McpServer's resource API (which expects a full ResourceTemplate class object)
 * and sets up the request handlers ourselves.
 */
export function registerResources(server: McpServer) {
  const srv = (server as unknown as { server: Server }).server;

  // Register capabilities
  srv.registerCapabilities({
    resources: {
      listChanged: true,
    },
  });

  // List resource templates
  srv.setRequestHandler(ListResourceTemplatesRequestSchema, async () => ({
    resourceTemplates: templates.map((t) => ({
      uriTemplate: t.uriTemplate,
      name: t.name,
      description: t.description,
      mimeType: t.mimeType,
    })),
  }));

  // Read resources — match against templates
  srv.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const uri = request.params.uri;
    for (const t of templates) {
      const variables = matchTemplate(t.uriTemplate, uri);
      if (variables) {
        const result = await t.handler(new URL(uri), variables);
        return {
          contents: [{
            uri: result.uri,
            text: result.text,
            mimeType: "application/json",
          }],
        };
      }
    }
    throw new Error(`Resource ${uri} not found`);
  });
}
