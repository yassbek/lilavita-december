import { NextRequest, NextResponse } from "next/server";
import { ElevenLabsClient } from "elevenlabs";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const agentKey = searchParams.get("agentKey");

  const candidateKeys = (() => {
    if (!agentKey) return ["AGENT_ID", "agent_id"];
    if (agentKey === "distribution") {
      return [
        "DISTRIBUTION_AGENT_ID",
        "DISTRUBITION_AGENT_ID", // common typo fallback
        "distribution_agent_id",
        "distrubition_agent_id"
      ];
    }
    if (agentKey === "finance") {
      return ["FINANCE_AGENT_ID", "finance_agent_id"];
    }
    if (agentKey === "impact") {
      return ["IMPACT_AGENT_ID", "impact_agent_id"];
    }
    if (agentKey === "marketing") {
      return ["MARKETING_AGENT_ID", "marketing_agent_id"];
    }
    return ["AGENT_ID", "agent_id"];
  })();

  const agentId = candidateKeys.map(k => process.env[k as keyof NodeJS.ProcessEnv]).find(Boolean);
  if (!agentId) {
    throw Error(`${candidateKeys.join("/")} is not set`);
  }
  try {
    const client = new ElevenLabsClient();
    const response = await client.conversationalAi.getSignedUrl({
      agent_id: agentId,
    });
    return NextResponse.json({ signedUrl: response.signed_url });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to get signed URL" },
      { status: 500 }
    );
  }
}
