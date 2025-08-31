// route.ts

import { NextRequest, NextResponse } from "next/server";
import { teamReifePrompt } from "./prompts/readiness";
import { impactPrompt } from "./prompts/impact";
import { finanzierungPrompt } from "./prompts/financing";
import { marketingPrompt } from "./prompts/marketing";
import { distributionPrompt } from "./prompts/distribution";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

// ---- Config ----
const INTERVIEW_CONFIGS = {
  "team-reife": {
    directusCollection: "applications",
    prompt: teamReifePrompt,
    fields: [
      "team_kompetenz",
      "team_dynamik",
      "organisation",
      "fuehrung",
      "prozesse",
      "kultur",
      "ai_staerken",
      "ai_verbesserungsbereiche",
      "ai_empfehlungen",
    ],
    nextStage: "impact",
  },
  impact: {
    directusCollection: "impact",
    prompt: impactPrompt,
    fields: [
      "mission_sdg_fit",
      "theory_of_change",
      "kpi_and_data",
      "imm_process",
      "reporting_communication",
      "continuous_improvement",
      "ai_staerken",
      "ai_verbesserungsbereiche",
      "ai_empfehlungen",
    ],
    nextStage: "marketing",
  },
  finanzierung: {
    directusCollection: "financing",
    prompt: finanzierungPrompt,
    fields: [
      "financing_strategy_score",
      "capital_mix_score",
      "financial_kpis_score",
      "impact_kpis_score",
      "cap_table_score",
      "investor_alignment_score",
      "risk_strategy_score",
      "ai_staerken",
      "ai_verbesserungsbereiche",
      "ai_empfehlungen",
    ],
    nextStage: "distribution",
  },
  marketing: {
    directusCollection: "marketing",
    prompt: marketingPrompt,
    fields: [
      "purpose_communication_score",
      "market_positioning_score",
      "growth_strategy_score",
      "marketing_mix_score",
      "competitive_differentiation_score",
      "data_analytics_score",
      "brand_authenticity_score",
      "ai_staerken",
      "ai_verbesserungsbereiche",
      "ai_empfehlungen",
    ],
    nextStage: "finanzierung",
  },
  distribution: {
    directusCollection: "distribution",
    prompt: distributionPrompt,
    fields: [
      "growth_strategy_score",
      "customer_acquisition_score",
      "sales_funnel_score",
      "sales_approach_score",
      "partnership_network_score",
      "organization_scalability_score",
      "ai_staerken",
      "ai_verbesserungsbereiche",
      "ai_empfehlungen",
    ],
    nextStage: "completed",
  },
} as const;

// ---- Types & guards ----
type InterviewType = keyof typeof INTERVIEW_CONFIGS;
function isValidInterviewType(type: string): type is InterviewType {
  return type in INTERVIEW_CONFIGS;
}

// Build a structured-output schema for Gemini, based on the fields
function buildResponseSchema(fields: string[]) {
  const schemaProps: Record<
    string,
    { type: string; items?: { type: string } }
  > = {};

  for (const f of fields) {
    if (
      f === "ai_staerken" ||
      f === "ai_verbesserungsbereiche" ||
      f === "ai_empfehlungen"
    ) {
      schemaProps[f] = { type: "ARRAY", items: { type: "STRING" } };
    } else {
      schemaProps[f] = { type: "NUMBER" };
    }
  }

  return {
    type: "OBJECT",
    properties: schemaProps,
    // Optional but nice to keep a consistent property order in responses:
    propertyOrdering: fields,
    // If you want to force all properties to be present:
    // required: fields,
  };
}

export async function POST(request: NextRequest) {
  try {
    const { transcript, applicationId } = await request.json();

    if (!transcript || !applicationId) {
      return NextResponse.json(
        { error: "Missing transcript or applicationId" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const interviewTypeParam = searchParams.get("type") || "team-reife";

    if (!isValidInterviewType(interviewTypeParam)) {
      return NextResponse.json(
        { error: "Invalid interview type provided" },
        { status: 400 }
      );
    }

    const config = INTERVIEW_CONFIGS[interviewTypeParam];
    const interviewType = interviewTypeParam;

    // ---- Build prompt
    const finalPrompt = config.prompt(transcript);

    // ---- Structured output schema
    const responseSchema = buildResponseSchema(config.fields);

    // ---- Gemini API call (structured JSON output)
    const body = {
      contents: [{ role: "user", parts: [{ text: finalPrompt }] }],
      generationConfig: {
        temperature: 0.2,
        response_mime_type: "application/json",
        response_schema: responseSchema,
      },
    };

    const geminiRes = await fetch(
      `${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text().catch(() => "");
      console.error("Gemini request failed:", geminiRes.status, errText);
      return NextResponse.json(
        {
          error: "Gemini request failed",
          status: geminiRes.status,
          body: errText,
        },
        { status: 502 }
      );
    }

    const geminiData = await geminiRes.json();
    console.log("Gemini raw response:", geminiData);

    // Gemini should now return strictly the JSON matching the schema in text:
    const text: string =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    if (!text) {
      return NextResponse.json(
        { error: "Empty Gemini response", gemini: geminiData },
        { status: 502 }
      );
    }

    // This should parse cleanly thanks to response_schema:
    let scores: Record<string, unknown>;
    try {
      scores = JSON.parse(text);
    } catch (e) {
      console.error("JSON parse failed despite schema:", e, {
        snippet: text.slice(0, 600),
      });
      return NextResponse.json(
        {
          error: "Failed to parse JSON from Gemini",
          snippet: text.slice(0, 600),
          gemini: geminiData,
        },
        { status: 500 }
      );
    }

    // ---- Prepare Directus payload
    const directusPayload: Record<string, unknown> = { transcript };

    for (const field of config.fields) {
      if (scores[field] !== undefined) {
        directusPayload[field] = scores[field];
      }
    }

    // For non-applications collections, include FK
    if (
      interviewType === "impact" ||
      interviewType === "finanzierung" ||
      interviewType === "marketing" ||
      interviewType === "distribution"
    ) {
      directusPayload.applications_id = applicationId;
    }

    const directusToken =
      process.env.NEXT_PUBLIC_DIRECTUS_TOKEN || process.env.DIRECTUS_STATIC_TOKEN;

    // ---- Write to Directus
    let directusRes: Response;
    if (
      interviewType === "impact" ||
      interviewType === "finanzierung" ||
      interviewType === "marketing" ||
      interviewType === "distribution"
    ) {
      const directusUrl = `${
        process.env.NEXT_PUBLIC_DIRECTUS_URL || process.env.DIRECTUS_URL
      }/items/${config.directusCollection}`;
      directusRes = await fetch(directusUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${directusToken}`,
        },
        body: JSON.stringify(directusPayload),
      });
    } else {
      const directusUrl = `${
        process.env.NEXT_PUBLIC_DIRECTUS_URL || process.env.DIRECTUS_URL
      }/items/applications/${applicationId}`;
      directusRes = await fetch(directusUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${directusToken}`,
        },
        body: JSON.stringify(directusPayload),
      });
    }

    const directusData = await directusRes.json().catch(() => ({}));
    console.log("Directus response:", directusData);

    if (!directusRes.ok) {
      return NextResponse.json(
        { error: "Failed to write to Directus", directusData },
        { status: directusRes.status }
      );
    }

    // ---- Update stage on applications
    const nextStageToUpdate = config.nextStage;
    if (nextStageToUpdate) {
      const updateProgressUrl = `${
        process.env.NEXT_PUBLIC_DIRECTUS_URL || process.env.DIRECTUS_URL
      }/items/applications/${applicationId}`;
      const updateProgressPayload = {
        current_interview_stage: nextStageToUpdate,
      };

      const updateProgressRes = await fetch(updateProgressUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${directusToken}`,
        },
        body: JSON.stringify(updateProgressPayload),
      });

      if (!updateProgressRes.ok) {
        const updateErrorData = await updateProgressRes.json().catch(() => ({}));
        console.error("Failed to update user progress in Directus:", updateErrorData);
        // Primary write succeeded; we don't fail the whole request here.
      } else {
        console.log(
          `User progress for ${applicationId} updated to: ${nextStageToUpdate}`
        );
      }
    }

    return NextResponse.json({
      scores,
      directus: directusData,
      gemini: geminiData,
    });
  } catch (error) {
    console.error("Error in /api/analyze-transcript:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
