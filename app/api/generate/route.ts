import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

type PromptInput = {
  projectName: string;
  websiteBrief: string;
  stage: string;
  audience: string;
  visualStyle: string;
  colorPalette: string;
  typographyStyle: string;
  techStack: string;
  components: string[];
  constraints: string[];
  motion: number;
};

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3-flash-preview";
const FRONTEND_DESIGN_SKILL_DIRECTIVES_TEMPLATE = `
You tend to converge toward generic, "on distribution" outputs. In frontend design, this creates what users call the "AI slop" aesthetic. Avoid this: make creative, distinctive frontends that surprise and delight. Focus on:

Visual Style: Commit to the selected visual style in a clear and cohesive way. Avoid mixed or conflicting visual languages.

Color & Theme: Commit to the selected palette direction. Use CSS variables for consistency, and build a clear hierarchy with dominant colors plus accent contrast.

Motion: Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions.

Typography: Apply the selected typography style consistently across headers, body copy, and UI controls.

Backgrounds: Create atmosphere and depth rather than defaulting to solid colors. Layer CSS gradients, use geometric patterns, or add contextual effects that match the overall aesthetic.

Avoid generic AI-generated aesthetics:
- Ignoring selected directive values in favor of generic defaults
- Predictable layouts and component patterns
- Cookie-cutter design that lacks context-specific character

Interpret creatively and make unexpected choices that feel genuinely designed for the context. Vary between light and dark themes, different fonts, different aesthetics. You still tend to converge on common choices (Space Grotesk, for example) across generations. Avoid this: it is critical that you think outside the box!
`;

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing GEMINI_API_KEY." }, { status: 500 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const input = normalizePayload(body);
  if (!input.projectName) {
    return NextResponse.json({ error: "projectName is required." }, { status: 400 });
  }
  if (!input.websiteBrief) {
    return NextResponse.json({ error: "websiteBrief is required." }, { status: 400 });
  }

  try {
    const prompt = await generateWithGemini(input, apiKey);
    return NextResponse.json({ prompt, model: GEMINI_MODEL }, { status: 200 });
  } catch (error: unknown) {
    console.error("Gemini request failed:", error);
    return NextResponse.json(
      { error: messageFromUnknown(error, "Gemini API request failed.") },
      { status: statusFromUnknown(error, 502) }
    );
  }
}

export function GET() {
  return NextResponse.json({ error: "Method not allowed." }, { status: 405 });
}

function normalizePayload(payload: Record<string, unknown>): PromptInput {
  return {
    projectName: asString(payload?.projectName),
    websiteBrief: asString(payload?.websiteBrief),
    stage: asString(payload?.stage, "From Scratch (New Build)"),
    audience: asString(payload?.audience, "Users who need a memorable and usable website experience"),
    visualStyle: asString(payload?.visualStyle, "Minimalist & Clean"),
    colorPalette: asString(payload?.colorPalette, "Monochrome"),
    typographyStyle: asString(payload?.typographyStyle, "Modern Sans-Serif (Inter, Roboto)"),
    techStack: asString(payload?.techStack, "Next.js + Tailwind CSS"),
    components: asArray(payload?.components, ["Hero", "Sticky Navigation", "Feature Grid", "Footer CTA"]),
    constraints: asArray(payload?.constraints, ["WCAG AA Contrast", "Semantic HTML", "Visible Focus States"]),
    motion: asNumber(payload?.motion, 60)
  };
}

function asString(value: unknown, fallback = ""): string {
  if (typeof value !== "string") {
    return fallback;
  }
  const clean = value.trim();
  return clean || fallback;
}

function asArray(value: unknown, fallback: string[] = []): string[] {
  if (!Array.isArray(value)) {
    return fallback;
  }
  const cleaned = value.map((item) => String(item).trim()).filter(Boolean);
  return cleaned.length ? cleaned : fallback;
}

function asNumber(value: unknown, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.max(0, Math.min(100, parsed));
}

function messageFromUnknown(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

function statusFromUnknown(error: unknown, fallback: number): number {
  if (typeof error !== "object" || error === null || !("status" in error)) {
    return fallback;
  }

  const status = (error as { status?: unknown }).status;
  return typeof status === "number" ? status : fallback;
}

async function generateWithGemini(input: PromptInput, apiKey: string): Promise<string> {
  const prompt = buildGeminiInstruction(input);
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
      temperature: 0.62,
      topP: 0.9,
      maxOutputTokens: 1500
    }
  });

  const text = (response.text || "").trim();
  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  return text;
}

function buildFrontendDesignSkillDirectives(input: PromptInput): string {
  return [
    FRONTEND_DESIGN_SKILL_DIRECTIVES_TEMPLATE,
    "",
    "Apply these selected user inputs exactly as design directives:",
    `- Project Stage: ${input.stage}`,
    `- Audience: ${input.audience}`,
    `- Visual Style: ${input.visualStyle}`,
    `- Color Palette: ${input.colorPalette}`,
    `- Typography Style: ${input.typographyStyle}`,
    `- Preferred Tech Stack: ${input.techStack}`,
    `- Motion Intensity (0-100): ${input.motion}`,
    "Required Components:",
    ...input.components.map((component) => `- ${component}`),
    "Accessibility & Engineering Guardrails:",
    ...input.constraints.map((constraint) => `- ${constraint}`)
  ].join("\n");
}

function buildGeminiInstruction(input: PromptInput): string {
  const frontendDesignSkillDirectives = buildFrontendDesignSkillDirectives(input);

  return [
    "You are an expert prompt engineer for UI-building coding agents.",
    "Generate exactly one polished prompt that can be pasted directly into a UI-building agent.",
    "Return only that prompt text. No markdown fences. No analysis.",
    "",
    "Follow these Frontend Design Directives:",
    frontendDesignSkillDirectives,
    "",
    "Instructions for the output prompt :",
    "1. It must be directive and authoritative.",
    "2. It must explicitly detail the color hex codes, typography rules, spacing , and animation guidelines.",
    "3. It must specify the layout structure and responsiveness.",
    "4. It must mention accessibility standards.",
    "5. It should be structured for maximum clarity for an AI model.",
    "",
    "Integrate typography guidance directly within Visual Direction and Color Strategy.",
    "",
    "INPUT",
    `Project Name: ${input.projectName}`,
    `Website Brief: ${input.websiteBrief}`,
    `Project Stage: ${input.stage}`,
    "Color Strategy Input: Base palette decisions on the selected Color Palette and audience context."
  ].join("\n");
}
