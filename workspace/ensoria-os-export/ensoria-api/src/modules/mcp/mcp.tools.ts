import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod/v4";
import * as peopleService from "../people/people.service.js";
import * as projectsService from "../projects/projects.service.js";
import * as conversationsService from "../conversations/conversations.service.js";
import * as requirementsService from "../requirements/requirements.service.js";
import * as milestonesService from "../milestones/milestones.service.js";
import * as collaboratorsService from "../collaborators/collaborators.service.js";
import * as plansService from "../plans/plans.service.js";
import * as dashboardService from "../dashboard/dashboard.service.js";

const textContent = (data: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
});

export function registerTools(server: McpServer) {
  // ── People ────────────────────────────────────

  server.tool(
    "list_people",
    "List all people with optional filters for type, stage, and search",
    {
      type: z.string().optional().describe("Filter by type: staff|partner|freelancer|company|investor"),
      stage: z.string().optional().describe("Filter by stage: Contact|Opportunity|Client|Recurring Client"),
      search: z.string().optional().describe("Search by name, email, or company"),
    },
    async ({ type, stage, search }) => {
      const people = await peopleService.list({ type, stage, search });
      return textContent(people);
    },
  );

  server.tool(
    "get_person",
    "Get a single person by ID, including their projects",
    { id: z.string().describe("Person ID") },
    async ({ id }) => {
      const person = await peopleService.getById(id);
      return textContent(person);
    },
  );

  server.tool(
    "create_person",
    "Create a new person/contact in the CRM",
    {
      name: z.string().min(1).describe("Person's name"),
      type: z.enum(["client", "staff", "partner", "freelancer", "company", "investor"]).default("client").describe("Person type"),
      email: z.string().email().optional().nullable().describe("Email address"),
      phone: z.string().optional().nullable().describe("Phone number"),
      company: z.string().optional().nullable().describe("Company name"),
      stage: z.string().default("Contact").describe("Pipeline stage: Contact|Opportunity|Client|Recurring Client"),
      notes: z.string().optional().nullable().describe("Notes about this person"),
    },
    async (data) => {
      const person = await peopleService.create({
        ...data,
        tags: "",
        email: data.email ?? null,
        phone: data.phone ?? null,
        company: data.company ?? null,
        notes: data.notes ?? null,
      } as Parameters<typeof peopleService.create>[0]);
      return textContent(person);
    },
  );

  server.tool(
    "update_person",
    "Update an existing person's details",
    {
      id: z.string().describe("Person ID"),
      name: z.string().min(1).optional().describe("Updated name"),
      type: z.enum(["client", "staff", "partner", "freelancer", "company", "investor"]).optional().describe("Person type"),
      email: z.string().email().optional().nullable().describe("Updated email"),
      phone: z.string().optional().nullable().describe("Updated phone"),
      company: z.string().optional().nullable().describe("Updated company"),
      notes: z.string().optional().nullable().describe("Updated notes"),
    },
    async ({ id, ...data }) => {
      const person = await peopleService.update(id, data);
      return textContent(person);
    },
  );

  server.tool(
    "change_person_stage",
    "Move a person to a different pipeline stage",
    {
      id: z.string().describe("Person ID"),
      stage: z.enum(["Contact", "Opportunity", "Client", "Recurring Client"]).describe("Target stage"),
    },
    async ({ id, stage }) => {
      const person = await peopleService.changeStage(id, stage);
      return textContent(person);
    },
  );

  server.tool(
    "delete_person",
    "Delete a person from the CRM (irreversible)",
    { id: z.string().describe("Person ID") },
    async ({ id }) => {
      const result = await peopleService.remove(id);
      return textContent(result);
    },
  );

  // ── Projects ──────────────────────────────────

  server.tool(
    "list_projects",
    "List all projects with optional filters",
    {
      stage: z.string().optional().describe("Filter by project stage"),
      peopleId: z.string().optional().describe("Filter by associated person ID"),
      search: z.string().optional().describe("Search by name or description"),
    },
    async ({ stage, peopleId, search }) => {
      const projects = await projectsService.list({ stage, peopleId, search });
      return textContent(projects);
    },
  );

  server.tool(
    "get_project",
    "Get a single project by ID, including all nested resources (conversations, requirements, milestones, collaborators, plans, files, analytics)",
    { id: z.string().describe("Project ID") },
    async ({ id }) => {
      const project = await projectsService.getById(id);
      return textContent(project);
    },
  );

  server.tool(
    "create_project",
    "Create a new project for an existing person",
    {
      name: z.string().min(1).describe("Project name"),
      peopleId: z.string().describe("Associated person ID"),
      description: z.string().optional().nullable().describe("Project description"),
      value: z.number().optional().nullable().describe("Deal value / budget in EUR"),
      stage: z.string().default("Contact").describe("Project stage"),
    },
    async (data) => {
      const project = await projectsService.create(data);
      return textContent(project);
    },
  );

  server.tool(
    "move_project_stage",
    "Move a project to a different pipeline stage",
    {
      id: z.string().describe("Project ID"),
      stage: z.enum(["Contact", "Opportunity", "Proposal", "Implementation", "Onboarding", "Live", "Validated"]).describe("Target stage"),
    },
    async ({ id, stage }) => {
      const project = await projectsService.changeStage(id, stage);
      return textContent(project);
    },
  );

  server.tool(
    "delete_project",
    "Delete a project (irreversible, cascades to all related data)",
    { id: z.string().describe("Project ID") },
    async ({ id }) => {
      const result = await projectsService.remove(id);
      return textContent(result);
    },
  );

  // ── Conversations ─────────────────────────────

  server.tool(
    "list_conversations",
    "List all conversations for a project",
    { projectId: z.string().describe("Project ID") },
    async ({ projectId }) => {
      const convs = await conversationsService.listByProject(projectId);
      return textContent(convs);
    },
  );

  server.tool(
    "add_conversation",
    "Add a conversation entry to a project",
    {
      projectId: z.string().describe("Project ID"),
      channel: z.string().default("manual").describe("Channel: manual|email|whatsapp|webchat|social|gmail"),
      direction: z.string().default("inbound").describe("Direction: inbound|outbound"),
      content: z.string().min(1).describe("Message content"),
      subject: z.string().optional().nullable().describe("Conversation subject"),
    },
    async ({ projectId, channel, direction, content, subject }) => {
      const conv = await conversationsService.create(projectId, {
        channel: channel as "manual" | "email" | "whatsapp" | "webchat" | "social" | "gmail",
        direction: direction as "inbound" | "outbound",
        content,
        subject: subject ?? null,
      });
      return textContent(conv);
    },
  );

  // ── Requirements ──────────────────────────────

  server.tool(
    "list_requirements",
    "List all requirements for a project",
    { projectId: z.string().describe("Project ID") },
    async ({ projectId }) => {
      const reqs = await requirementsService.listByProject(projectId);
      return textContent(reqs);
    },
  );

  server.tool(
    "add_requirement",
    "Add a new requirement to a project",
    {
      projectId: z.string().describe("Project ID"),
      title: z.string().min(1).describe("Requirement title"),
      description: z.string().optional().nullable().describe("Detailed description"),
      category: z.enum(["need", "goal", "requirement"]).default("requirement").describe("Category"),
      priority: z.enum(["low", "medium", "high", "critical"]).default("medium").describe("Priority"),
    },
    async ({ projectId, title, description, category, priority }) => {
      const req = await requirementsService.create(projectId, {
        title,
        description,
        category,
        priority,
        status: "open",
      });
      return textContent(req);
    },
  );

  // ── Milestones ────────────────────────────────

  server.tool(
    "list_milestones",
    "List all milestones for a project",
    { projectId: z.string().describe("Project ID") },
    async ({ projectId }) => {
      const ms = await milestonesService.listByProject(projectId);
      return textContent(ms);
    },
  );

  server.tool(
    "add_milestone",
    "Add a milestone to a project's roadmap",
    {
      projectId: z.string().describe("Project ID"),
      title: z.string().min(1).describe("Milestone title"),
      description: z.string().optional().nullable().describe("Description"),
      dueDate: z.string().optional().nullable().describe("Due date (ISO 8601)"),
    },
    async ({ projectId, title, description, dueDate }) => {
      const ms = await milestonesService.create(projectId, {
        title,
        description,
        dueDate,
        status: "pending",
      });
      return textContent(ms);
    },
  );

  server.tool(
    "update_milestone",
    "Update a milestone's status",
    {
      projectId: z.string().describe("Project ID"),
      id: z.string().describe("Milestone ID"),
      status: z.enum(["pending", "in-progress", "completed", "cancelled"]).optional().describe("New status"),
      title: z.string().optional().describe("Updated title"),
    },
    async ({ projectId, id, ...data }) => {
      const ms = await milestonesService.update(projectId, id, data);
      return textContent(ms);
    },
  );

  // ── Collaborators ─────────────────────────────

  server.tool(
    "list_collaborators",
    "List all collaborators assigned to a project",
    { projectId: z.string().describe("Project ID") },
    async ({ projectId }) => {
      const collabs = await collaboratorsService.listByProject(projectId);
      return textContent(collabs);
    },
  );

  server.tool(
    "add_collaborator",
    "Add a collaborator to a project",
    {
      projectId: z.string().describe("Project ID"),
      name: z.string().min(1).describe("Collaborator name"),
      email: z.string().email().optional().nullable().describe("Email"),
      phone: z.string().optional().nullable().describe("Phone number"),
      role: z.string().optional().nullable().describe("Role (e.g. developer, designer, consultant)"),
    },
    async ({ projectId, name, email, phone, role }) => {
      const collab = await collaboratorsService.create(projectId, { name, email, phone, role });
      return textContent(collab);
    },
  );

  server.tool(
    "remove_collaborator",
    "Remove a collaborator from a project",
    {
      projectId: z.string().describe("Project ID"),
      id: z.string().describe("Collaborator ID"),
    },
    async ({ projectId, id }) => {
      const result = await collaboratorsService.remove(projectId, id);
      return textContent(result);
    },
  );

  // ── Plans ─────────────────────────────────────

  server.tool(
    "list_plans",
    "List all plans/documents for a project",
    { projectId: z.string().describe("Project ID") },
    async ({ projectId }) => {
      const plans = await plansService.listByProject(projectId);
      return textContent(plans);
    },
  );

  server.tool(
    "create_plan",
    "Create a new plan or document for a project (supports markdown content)",
    {
      projectId: z.string().describe("Project ID"),
      title: z.string().min(1).describe("Plan title"),
      content: z.string().default("").describe("Plan content in markdown or plain text"),
    },
    async ({ projectId, title, content }) => {
      const plan = await plansService.create(projectId, { title, content });
      return textContent(plan);
    },
  );

  // ── Dashboard ─────────────────────────────────

  server.tool(
    "get_dashboard",
    "Get CRM dashboard metrics: total people/projects, pipeline value, win rate, stage distribution, and recent activity",
    {},
    async () => {
      const metrics = await dashboardService.getDashboard();
      return textContent(metrics);
    },
  );
}
