"use client";

import type { CSSProperties, FormEvent } from "react";
import { useRef, useState } from "react";

type SelectOption = {
  value: string;
  label: string;
};

type FormState = {
  projectName: string;
  websiteBrief: string;
  stage: string;
  audience: string;
  visualStyle: string;
  colorPalette: string;
  typographyStyle: string;
  techStack: string;
  motion: number;
};

type PresetScene = FormState & {
  selectedComponents: string[];
  selectedGuardrails: string[];
};

type BuilderPayload = {
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

type GenerateResponse = {
  prompt?: string;
  model?: string;
  error?: string;
};

const VISUAL_STYLE_OPTIONS: SelectOption[] = [
  { value: "minimalist", label: "Minimalist & Clean" },
  { value: "brutalist", label: "Neo-Brutalist" },
  { value: "glassmorphism", label: "Glassmorphism" },
  { value: "cyberpunk", label: "Cyberpunk / High Tech" },
  { value: "corporate", label: "Corporate & Professional" },
  { value: "playful", label: "Playful & Bouncy" },
  { value: "material", label: "Material Design" },
  { value: "apple", label: "Apple/Human Interface Guidelines" },
  { value: "editorial", label: "Editorial / Magazine" },
  { value: "retro_futurist", label: "Retro Futurist" },
  { value: "art_deco", label: "Art Deco / Geometric" },
  { value: "scandinavian", label: "Scandinavian / Soft Minimal" },
  { value: "industrial", label: "Industrial / Utility-First" },
  { value: "luxury_minimal", label: "Luxury Minimal" },
  { value: "y2k", label: "Y2K / Digital Nostalgia" }
];

const COLOR_PALETTE_OPTIONS: SelectOption[] = [
  { value: "monochrome", label: "Monochrome" },
  { value: "pastel", label: "Pastel" },
  { value: "dark_neon", label: "Dark Mode + Neon Accents" },
  { value: "earth_tones", label: "Earth Tones / Organic" },
  { value: "vibrant", label: "High Contrast & Vibrant" },
  { value: "corporate_blue", label: "Trustworthy Blue & Grey" },
  { value: "luxury", label: "Black & Gold / Luxury" },
  { value: "warm_sunset", label: "Warm Sunset (Coral/Amber/Rose)" },
  { value: "oceanic", label: "Oceanic (Teal/Blue/Cyan)" },
  { value: "forest", label: "Forest & Moss Greens" },
  { value: "noir", label: "Noir (Charcoal/Silver/White)" },
  { value: "candy_pop", label: "Candy Pop (Bubblegum + Lime + Sky)" },
  { value: "desert", label: "Desert Clay & Sand" },
  { value: "duotone", label: "Duotone + Accent Color" }
];

const TYPOGRAPHY_STYLE_OPTIONS: SelectOption[] = [
  { value: "sans_serif", label: "Modern Sans-Serif (Inter, Roboto)" },
  { value: "serif", label: "Elegant Serif (Merriweather, Playfair)" },
  { value: "mono", label: "Technical Monospace (JetBrains Mono, Fira Code)" },
  { value: "mixed", label: "Bold Serif Headers + Clean Sans Body" }
];

const AUDIENCE_OPTIONS: SelectOption[] = [
  { value: "startup_teams", label: "Startup Teams" },
  { value: "agency_clients", label: "Agency Clients" },
  { value: "enterprise_buyers", label: "Enterprise Buyers" },
  { value: "independent_creators", label: "Independent Creators" },
  { value: "operations_leads", label: "Operations Leaders" },
  { value: "product_marketers", label: "Product Marketers" },
  { value: "founders", label: "Founders" },
  { value: "fintech_teams", label: "Fintech Teams" },
  { value: "ecommerce_brands", label: "E-commerce Brands" },
  { value: "developer_tool_users", label: "Developer Tool Users" },
  { value: "saas_growth_teams", label: "SaaS Growth Teams" },
  { value: "healthcare_ops", label: "Healthcare Operations Teams" },
  { value: "education_platforms", label: "Education Platform Teams" },
  { value: "nonprofit_orgs", label: "Nonprofit Organizations" },
  { value: "hospitality_brands", label: "Hospitality & Travel Brands" },
  { value: "real_estate_teams", label: "Real Estate Teams" },
  { value: "government_services", label: "Government Service Teams" },
  { value: "gaming_communities", label: "Gaming Communities" }
];

const STAGE_OPTIONS: SelectOption[] = [
  { value: "from_scratch", label: "From Scratch (New Build)" },
  { value: "redesign", label: "Redesign Existing Site" },
  { value: "refresh", label: "Visual Refresh" },
  { value: "migration", label: "Platform/Stack Migration" },
  { value: "expansion", label: "Expand Existing Product/Pages" }
];

const TECH_STACK_OPTIONS: SelectOption[] = [
  { value: "nextjs_tailwind", label: "Next.js + Tailwind CSS" },
  { value: "nextjs_css_modules", label: "Next.js + CSS Modules" },
  { value: "react_vite_typescript", label: "React + Vite + TypeScript" },
  { value: "react_vite_javascript", label: "React + Vite + JavaScript" },
  { value: "vue_nuxt", label: "Vue + Nuxt" },
  { value: "svelte_sveltekit", label: "Svelte + SvelteKit" },
  { value: "html_css_js", label: "Vanilla HTML/CSS/JS" },
  { value: "astro", label: "Astro" },
  { value: "remix", label: "Remix" }
];

const COMPONENT_OPTIONS: SelectOption[] = [
  { value: "hero", label: "Hero" },
  { value: "sticky_navigation", label: "Sticky Navigation" },
  { value: "feature_grid", label: "Feature Grid" },
  { value: "social_proof", label: "Social Proof" },
  { value: "pricing", label: "Pricing" },
  { value: "faq", label: "FAQ" },
  { value: "testimonial_rail", label: "Testimonial Rail" },
  { value: "footer_cta", label: "Footer CTA" }
];

const GUARDRAIL_OPTIONS: SelectOption[] = [
  { value: "wcag_aa", label: "WCAG AA Contrast" },
  { value: "semantic_html", label: "Semantic HTML" },
  { value: "visible_focus", label: "Visible Focus States" },
  { value: "keyboard_navigation", label: "Keyboard Navigation" },
  { value: "reduced_motion", label: "Respects Reduced Motion" },
  { value: "fast_render", label: "Performance-Oriented Rendering" }
];

const PRESET_SCENES: PresetScene[] = [
  {
    projectName: "Pulse Vertex",
    websiteBrief:
      "Create a premium AI workflow automation website with trust-building proof, strong call-to-action hierarchy, and polished motion that still feels practical.",
    stage: "from_scratch",
    audience: "enterprise_buyers",
    visualStyle: "corporate",
    colorPalette: "corporate_blue",
    typographyStyle: "sans_serif",
    techStack: "nextjs_tailwind",
    motion: 62,
    selectedComponents: ["hero", "sticky_navigation", "feature_grid", "social_proof", "pricing", "footer_cta"],
    selectedGuardrails: ["wcag_aa", "semantic_html", "visible_focus", "reduced_motion", "fast_render"]
  },
  {
    projectName: "Arc Bloom",
    websiteBrief:
      "Build a boutique studio website with immersive storytelling, layered layouts, tactile interactions, and mobile-first readability.",
    stage: "redesign",
    audience: "agency_clients",
    visualStyle: "glassmorphism",
    colorPalette: "pastel",
    typographyStyle: "mixed",
    techStack: "nextjs_css_modules",
    motion: 48,
    selectedComponents: ["hero", "feature_grid", "testimonial_rail", "faq", "footer_cta"],
    selectedGuardrails: ["wcag_aa", "semantic_html", "visible_focus", "keyboard_navigation", "reduced_motion"]
  },
  {
    projectName: "Signal Forge",
    websiteBrief:
      "Design a high-conversion platform website for developer tooling with sharp information architecture, benchmark-driven proof sections, and frictionless signup flows.",
    stage: "from_scratch",
    audience: "developer_tool_users",
    visualStyle: "cyberpunk",
    colorPalette: "dark_neon",
    typographyStyle: "mono",
    techStack: "react_vite_typescript",
    motion: 54,
    selectedComponents: ["hero", "sticky_navigation", "feature_grid", "pricing", "faq", "footer_cta"],
    selectedGuardrails: ["wcag_aa", "semantic_html", "visible_focus", "keyboard_navigation", "fast_render"]
  },
  {
    projectName: "Harbor Metrics",
    websiteBrief:
      "Build an analytics-focused landing site for operations leaders with KPI storytelling, persuasive use-cases, and a strong enterprise demo conversion path.",
    stage: "expansion",
    audience: "operations_leads",
    visualStyle: "corporate",
    colorPalette: "corporate_blue",
    typographyStyle: "sans_serif",
    techStack: "vue_nuxt",
    motion: 58,
    selectedComponents: ["hero", "sticky_navigation", "feature_grid", "social_proof", "pricing", "footer_cta"],
    selectedGuardrails: ["wcag_aa", "semantic_html", "visible_focus", "reduced_motion", "fast_render"]
  },
  {
    projectName: "Nimbus Cart",
    websiteBrief:
      "Create a conversion-heavy commerce website for a direct-to-consumer brand with elevated product storytelling, social proof loops, and urgency-based CTAs.",
    stage: "from_scratch",
    audience: "ecommerce_brands",
    visualStyle: "playful",
    colorPalette: "vibrant",
    typographyStyle: "mixed",
    techStack: "svelte_sveltekit",
    motion: 72,
    selectedComponents: ["hero", "feature_grid", "social_proof", "pricing", "faq", "footer_cta"],
    selectedGuardrails: ["wcag_aa", "semantic_html", "visible_focus", "keyboard_navigation", "reduced_motion"]
  },
  {
    projectName: "Foundry Ledger",
    websiteBrief:
      "Build a fintech product website for startup teams with clear trust architecture, compliance-friendly messaging, and a polished onboarding CTA system.",
    stage: "migration",
    audience: "fintech_teams",
    visualStyle: "corporate",
    colorPalette: "luxury",
    typographyStyle: "serif",
    techStack: "nextjs_tailwind",
    motion: 46,
    selectedComponents: ["hero", "sticky_navigation", "feature_grid", "social_proof", "faq", "footer_cta"],
    selectedGuardrails: ["wcag_aa", "semantic_html", "visible_focus", "keyboard_navigation", "reduced_motion"]
  }
];

const DEFAULT_COMPONENTS: string[] = ["hero", "sticky_navigation", "feature_grid", "footer_cta"];
const DEFAULT_GUARDRAILS: string[] = ["wcag_aa", "semantic_html", "visible_focus", "reduced_motion"];

const INITIAL_FORM: FormState = {
  projectName: "",
  websiteBrief: "",
  stage: STAGE_OPTIONS[0].value,
  audience: AUDIENCE_OPTIONS[0].value,
  visualStyle: VISUAL_STYLE_OPTIONS[0].value,
  colorPalette: COLOR_PALETTE_OPTIONS[0].value,
  typographyStyle: TYPOGRAPHY_STYLE_OPTIONS[0].value,
  techStack: TECH_STACK_OPTIONS[0].value,
  motion: 64
};

const INITIAL_OUTPUT =
  "Enter Project Name and Website Brief, tune the selectable controls, and click Generate with Gemini.";

function optionLabel(options: SelectOption[], value: string): string {
  return options.find((option) => option.value === value)?.label || value;
}

function toggleSelection(values: string[], selectedValue: string, fallbackValues: string[]): string[] {
  const hasValue = values.includes(selectedValue);
  if (!hasValue) {
    return [...values, selectedValue];
  }

  const next = values.filter((value) => value !== selectedValue);
  return next.length ? next : fallbackValues;
}

function shortErrorMessage(message: string | undefined): string {
  const compact = (message || "Unable to generate right now.").replace(/\s+/g, " ").trim();
  if (compact.length <= 160) {
    return compact;
  }
  return `${compact.slice(0, 157)}...`;
}

function motionProfile(motion: number): string {
  if (motion <= 20) {
    return "very subtle motion with calm transitions";
  }
  if (motion <= 45) {
    return "gentle motion with light transforms";
  }
  if (motion <= 70) {
    return "moderate motion with layered reveals";
  }
  return "high-energy motion with strong choreography";
}

function buildFallbackPrompt(payload: BuilderPayload): string {
  const components = payload.components.map((entry) => `- ${entry}`).join("\n");
  const constraints = payload.constraints.map((entry) => `- ${entry}`).join("\n");

  return [
    "Gemini was unavailable, so this fallback prompt was generated locally:",
    "",
    "You are a senior UI-building agent focused on distinctive, production-grade interfaces.",
    `Project: ${payload.projectName}`,
    `Website brief: ${payload.websiteBrief}`,
    `Project stage: ${payload.stage}`,
    `Audience: ${payload.audience}`,
    `Visual style: ${payload.visualStyle}`,
    `Color palette: ${payload.colorPalette}`,
    `Typography style: ${payload.typographyStyle}`,
    `Tech stack: ${payload.techStack}`,
    "",
    "Color strategy:",
    "- Build from the selected color palette while preserving strong readability and hierarchy.",
    `Motion intensity: ${payload.motion}/100 (${motionProfile(payload.motion)})`,
    "",
    "Required components:",
    components,
    "",
    "Accessibility and engineering guardrails:",
    constraints,
    "",
    "Return a complete implementation-ready prompt with sections for objective, visual direction, color strategy, motion, and accessibility/engineering guardrails."
  ].join("\n");
}

function messageFromUnknown(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

function revealDelayStyle(delay: string): CSSProperties {
  return { "--delay": delay } as CSSProperties;
}

export default function HomePage() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [selectedComponents, setSelectedComponents] = useState<string[]>(DEFAULT_COMPONENTS);
  const [selectedGuardrails, setSelectedGuardrails] = useState<string[]>(DEFAULT_GUARDRAILS);
  const [status, setStatus] = useState("Ready to generate with Gemini");
  const [output, setOutput] = useState(INITIAL_OUTPUT);
  const [isGenerating, setIsGenerating] = useState(false);
  const [outputPulse, setOutputPulse] = useState(false);
  const requestIdRef = useRef(0);

  const cssVars = {
    "--primary": "#d0d0d0",
    "--accent": "#7b7b7b",
    "--surface": "#131313"
  } as CSSProperties;

  function pulseOutput() {
    setOutputPulse(false);
    requestAnimationFrame(() => setOutputPulse(true));
    setTimeout(() => setOutputPulse(false), 280);
  }

  function applyPresetScene() {
    if (isGenerating) {
      return;
    }

    const scene = PRESET_SCENES[Math.floor(Math.random() * PRESET_SCENES.length)];
    setForm({
      projectName: scene.projectName,
      websiteBrief: scene.websiteBrief,
      stage: scene.stage,
      audience: scene.audience,
      visualStyle: scene.visualStyle,
      colorPalette: scene.colorPalette,
      typographyStyle: scene.typographyStyle,
      techStack: scene.techStack,
      motion: scene.motion
    });
    setSelectedComponents(scene.selectedComponents);
    setSelectedGuardrails(scene.selectedGuardrails);
    setStatus("Preset applied. Generate with Gemini when ready.");
  }

  function payloadFromState(): BuilderPayload {
    return {
      projectName: form.projectName.trim(),
      websiteBrief: form.websiteBrief.trim(),
      stage: optionLabel(STAGE_OPTIONS, form.stage),
      audience: optionLabel(AUDIENCE_OPTIONS, form.audience),
      visualStyle: optionLabel(VISUAL_STYLE_OPTIONS, form.visualStyle),
      colorPalette: optionLabel(COLOR_PALETTE_OPTIONS, form.colorPalette),
      typographyStyle: optionLabel(TYPOGRAPHY_STYLE_OPTIONS, form.typographyStyle),
      techStack: optionLabel(TECH_STACK_OPTIONS, form.techStack),
      components: selectedComponents.map((value) => optionLabel(COMPONENT_OPTIONS, value)),
      constraints: selectedGuardrails.map((value) => optionLabel(GUARDRAIL_OPTIONS, value)),
      motion: Number(form.motion)
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.projectName.trim()) {
      setStatus("Project Name is required.");
      return;
    }

    if (!form.websiteBrief.trim()) {
      setStatus("Website Brief is required.");
      return;
    }

    const payload = payloadFromState();
    const requestId = ++requestIdRef.current;

    setIsGenerating(true);
    setStatus("Generating with Gemini...");
    setOutput("Gemini is drafting your UI-agent prompt...");
    pulseOutput();

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      let data: GenerateResponse = {};
      try {
        data = (await response.json()) as GenerateResponse;
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(data.error || "Generation request failed.");
      }

      if (requestId !== requestIdRef.current) {
        return;
      }

      const prompt = typeof data.prompt === "string" ? data.prompt.trim() : "";
      if (!prompt) {
        throw new Error("Gemini response did not include prompt text.");
      }

      setOutput(prompt);
      setStatus(`Generated with ${data.model || "Gemini"}`);
      pulseOutput();
    } catch (error: unknown) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setOutput(buildFallbackPrompt(payload));
      setStatus(`Gemini request failed. ${shortErrorMessage(messageFromUnknown(error, ""))} Using local fallback prompt.`);
      pulseOutput();
    } finally {
      if (requestId === requestIdRef.current) {
        setIsGenerating(false);
      }
    }
  }

  async function handleCopy() {
    if (!output) {
      return;
    }

    try {
      await navigator.clipboard.writeText(output);
      setStatus("Copied to clipboard");
    } catch {
      setStatus("Clipboard blocked: copy manually from output panel");
    }
  }

  return (
    <>
      <main className="page-shell" style={cssVars}>
        <header className="hero reveal" style={revealDelayStyle("0.05s")}>
          <p className="kicker">Prompt Atelier</p>
          <h1>Build richer prompts for UI-building agents.</h1>
          <p className="hero-copy">
            Next.js app for Vercel deployment. Only Project Name and Website Brief require typing, while the rest of the design system is
            configured through selections.
          </p>
        </header>

        <div className="workspace">
          <section className="panel controls reveal" style={revealDelayStyle("0.15s")} aria-labelledby="controls-title">
            <div className="panel-title-row">
              <h2 id="controls-title">Design Inputs</h2>
              <button type="button" className="ghost-button" onClick={applyPresetScene} disabled={isGenerating}>
                Surprise Me
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <fieldset>
                <legend>Project Core</legend>
                <div className="grid two-col project-core-grid">
                  <label className="full-span">
                    Project Name
                    <input
                      name="projectName"
                      type="text"
                      value={form.projectName}
                      onChange={(event) => setForm((previous) => ({ ...previous, projectName: event.target.value }))}
                      placeholder="Orbit Canvas"
                      required
                    />
                  </label>

                  <label className="full-span">
                    Website Brief
                    <textarea
                      name="websiteBrief"
                      rows={4}
                      value={form.websiteBrief}
                      onChange={(event) => setForm((previous) => ({ ...previous, websiteBrief: event.target.value }))}
                      placeholder="Build a conversion-focused website for an AI workflow product with premium editorial styling and clear trust signals."
                      required
                    />
                  </label>

                  <label>
                    Stage
                    <select value={form.stage} onChange={(event) => setForm((previous) => ({ ...previous, stage: event.target.value }))}>
                      {STAGE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Audience
                    <select
                      value={form.audience}
                      onChange={(event) => setForm((previous) => ({ ...previous, audience: event.target.value }))}
                    >
                      {AUDIENCE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Tech Stack
                    <select
                      value={form.techStack}
                      onChange={(event) => setForm((previous) => ({ ...previous, techStack: event.target.value }))}
                    >
                      {TECH_STACK_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Visual Style
                    <select
                      value={form.visualStyle}
                      onChange={(event) => setForm((previous) => ({ ...previous, visualStyle: event.target.value }))}
                    >
                      {VISUAL_STYLE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Color Palette
                    <select
                      value={form.colorPalette}
                      onChange={(event) => setForm((previous) => ({ ...previous, colorPalette: event.target.value }))}
                    >
                      {COLOR_PALETTE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Typography
                    <select
                      value={form.typographyStyle}
                      onChange={(event) => setForm((previous) => ({ ...previous, typographyStyle: event.target.value }))}
                    >
                      {TYPOGRAPHY_STYLE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </fieldset>

              <fieldset>
                <legend>Motion</legend>
                <label>
                  Motion Intensity
                  <div className="range-wrap">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={form.motion}
                      onChange={(event) => setForm((previous) => ({ ...previous, motion: Number(event.target.value) }))}
                    />
                    <span id="motionValue">{form.motion}</span>
                  </div>
                </label>
              </fieldset>

              <fieldset>
                <legend>Components & Guardrails</legend>
                <label className="stacked">
                  Required Components
                  <span className="hint">Selectable multi-choice.</span>
                </label>
                <div className="chip-group">
                  {COMPONENT_OPTIONS.map((option) => (
                    <button
                      type="button"
                      key={option.value}
                      className={`chip ${selectedComponents.includes(option.value) ? "active" : ""}`}
                      onClick={() => setSelectedComponents((previous) => toggleSelection(previous, option.value, DEFAULT_COMPONENTS))}
                      disabled={isGenerating}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                <label className="stacked">
                  Accessibility & Engineering Guardrails
                  <span className="hint">Selectable multi-choice.</span>
                </label>
                <div className="chip-group">
                  {GUARDRAIL_OPTIONS.map((option) => (
                    <button
                      type="button"
                      key={option.value}
                      className={`chip ${selectedGuardrails.includes(option.value) ? "active" : ""}`}
                      onClick={() => setSelectedGuardrails((previous) => toggleSelection(previous, option.value, DEFAULT_GUARDRAILS))}
                      disabled={isGenerating}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <button type="submit" className={`primary-button ${isGenerating ? "is-loading" : ""}`} disabled={isGenerating}>
                {isGenerating ? "Generating..." : "Generate with Gemini"}
              </button>
            </form>
          </section>

          <section className="panel output reveal" style={revealDelayStyle("0.25s")} aria-labelledby="output-title">
            <div className="panel-title-row">
              <h2 id="output-title">Generated Prompt</h2>
              <button type="button" className="ghost-button" onClick={handleCopy}>
                Copy
              </button>
            </div>
            <p className="status">{status}</p>
            <pre className={`prompt-output ${outputPulse ? "updating" : ""}`} aria-live="polite">
              {output}
            </pre>
          </section>
        </div>

      </main>
    </>
  );
}
