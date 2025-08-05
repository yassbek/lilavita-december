// route.ts

import { NextRequest, NextResponse } from 'next/server';
import { teamReifePrompt } from './prompts/readiness';
import { impactPrompt } from './prompts/impact';
import { finanzierungPrompt } from './prompts/financing';
import { marketingPrompt } from './prompts/marketing';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// Define the configurations for different interview types
const INTERVIEW_CONFIGS = {
    "team-reife": {
        directusCollection: "applications",
        prompt: teamReifePrompt,
        fields: [
            "team_kompetenz", "team_dynamik", "organisation", "fuehrung", "prozesse", "kultur",
            "ai_staerken", "ai_verbesserungsbereiche", "ai_empfehlungen"
        ],
    },
    "impact": {
        directusCollection: "impact",
        prompt: impactPrompt,
        fields: [
            "mission_sdg_fit", "theory_of_change", "kpi_and_data",
            "imm_process", "reporting_communication", "continuous_improvement",
            "ai_staerken", "ai_verbesserungsbereiche", "ai_empfehlungen"
        ],
    },
    "finanzierung": {
        directusCollection: "financing",
        prompt: finanzierungPrompt,
        fields: [
            "financing_strategy_score", "capital_mix_score", "financial_kpis_score",
            "impact_kpis_score", "cap_table_score", "investor_alignment_score", "risk_strategy_score",
            "ai_staerken", "ai_verbesserungsbereiche", "ai_empfehlungen"
        ],
    },
    "marketing": {
        directusCollection: "marketing",
        prompt: marketingPrompt,
        fields: [
            "purpose_communication_score", "market_positioning_score", "growth_strategy_score",
            "marketing_mix_score", "competitive_differentiation_score", "data_analytics_score",
            "brand_authenticity_score",
            "ai_staerken", "ai_verbesserungsbereiche", "ai_empfehlungen"
        ],
    },
};

// --- START: TYPE-SAFE FIX ---

// 1. Create a type representing the valid keys of the config object.
type InterviewType = keyof typeof INTERVIEW_CONFIGS;

// 2. Create a "type guard" function to check if a string is a valid key.
function isValidInterviewType(type: string): type is InterviewType {
  return type in INTERVIEW_CONFIGS;
}

// --- END: TYPE-SAFE FIX ---


export async function POST(request: NextRequest) {
    try {
        const { transcript, applicationId } = await request.json();
        if (!transcript || !applicationId) {
            return NextResponse.json({ error: 'Missing transcript or applicationId' }, { status: 400 });
        }

        const { searchParams } = new URL(request.url);
        const interviewTypeParam = searchParams.get("type") || "team-reife";

        // 3. Use the type guard to validate the key before using it.
        if (!isValidInterviewType(interviewTypeParam)) {
            return NextResponse.json({ error: 'Invalid interview type provided' }, { status: 400 });
        }
        
        // TypeScript now knows `interviewTypeParam` is a valid key, so no more error.
        const config = INTERVIEW_CONFIGS[interviewTypeParam];
        const interviewType = interviewTypeParam; // Use the validated param

        // Dynamic prompt creation
        const finalPrompt = config.prompt(transcript);

        // Gemini API call
        const geminiRes = await fetch(GEMINI_API_URL + `?key=${process.env.GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: finalPrompt }] }]
                })
            }
        );
        const geminiData = await geminiRes.json();
        console.log('Gemini raw response:', geminiData);

        // Extract JSON from Gemini response
        let scores: { [key: string]: unknown } = {};
        try {
            const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const jsonString = text.match(/\{[\s\S]*\}/)?.[0] || '{}';
            scores = JSON.parse(jsonString);
        } catch (e) {
            console.error('Failed to parse Gemini response:', geminiData, e);
            return NextResponse.json({ error: 'Failed to parse Gemini response' }, { status: 500 });
        }

        // Prepare the payload for Directus dynamically
        const directusPayload: { [key: string]: unknown } = {
            transcript: transcript
        };
        config.fields.forEach(field => {
            if (scores[field] !== undefined) {
                directusPayload[field] = scores[field];
            }
        });

        // Add applications_id to the payload if it's a new collection
        if (interviewType === "impact" || interviewType === "finanzierung" || interviewType === "marketing") {
             directusPayload.applications_id = applicationId;
        }

        const directusToken = process.env.NEXT_PUBLIC_DIRECTUS_TOKEN || process.env.DIRECTUS_STATIC_TOKEN;

        // Depending on the interview type, either update an existing application (PATCH)
        // or create a new entry in the specific collection (POST)
        let directusRes;
        if (interviewType === "impact" || interviewType === "finanzierung" || interviewType === "marketing") {
            const directusUrl = `${process.env.NEXT_PUBLIC_DIRECTUS_URL || process.env.DIRECTUS_URL}/items/${config.directusCollection}`;
            directusRes = await fetch(directusUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${directusToken}`
                },
                body: JSON.stringify(directusPayload)
            });
        } else {
            const directusUrl = `${process.env.NEXT_PUBLIC_DIRECTUS_URL || process.env.DIRECTUS_URL}/items/applications/${applicationId}`;
            directusRes = await fetch(directusUrl, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${directusToken}`
                },
                body: JSON.stringify(directusPayload)
            });
        }

        const directusData = await directusRes.json();
        console.log('Directus response:', directusData);

        if (!directusRes.ok) {
            return NextResponse.json({ error: 'Failed to write to Directus', directusData }, { status: directusRes.status });
        }

        return NextResponse.json({ scores, directus: directusData, gemini: geminiData });
    } catch (error) {
        console.error('Error in /api/analyze-transcript:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}
