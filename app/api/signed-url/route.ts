// Speicherort: src/app/api/signed-url/route.ts

import { NextRequest, NextResponse } from "next/server";
import { ElevenLabsClient } from "elevenlabs";

export async function GET(request: NextRequest) {
  console.log("═══════════════════════════════════════════════════════════");
  console.log("🔑 SIGNED URL REQUEST");
  console.log("═══════════════════════════════════════════════════════════");

  const { searchParams } = new URL(request.url);
  const agentKey = searchParams.get("agentKey");

  console.log("📋 Request details:");
  console.log("  - Agent Key:", agentKey || "(none - using default)");
  console.log("  - Full URL:", request.url);
  console.log("  - Timestamp:", new Date().toISOString());

  // Mapping von agentKey zu Umgebungsvariablen-Namen
  const candidateKeys = (() => {
    if (!agentKey) return ["AGENT_ID", "agent_id"];

    // ═══════════════════════════════════════════════════════════════
    // BESTEHENDE AGENTS
    // ═══════════════════════════════════════════════════════════════
    if (agentKey === "distribution") {
      return [
        "DISTRIBUTION_AGENT_ID",
        "DISTRUBITION_AGENT_ID",
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

    // ═══════════════════════════════════════════════════════════════
    // NEU: PHARMAZIE-TRAINING AGENTS
    // ═══════════════════════════════════════════════════════════════

    // B-Vitamine & Energie
    if (agentKey === "pharmacy_b_vitamins") {
      return [
        "PHARMACY_B_VITAMINS_AGENT_ID",
        "pharmacy_b_vitamins_agent_id",
        "B_VITAMINS_AGENT_ID"
      ];
    }

    // Magnesiumcitrat 130
    if (agentKey === "pharmacy_magnesium") {
      return [
        "PHARMACY_MAGNESIUM_AGENT_ID",
        "pharmacy_magnesium_agent_id",
        "MAGNESIUM_AGENT_ID"
      ];
    }

    // Perenterol forte
    if (agentKey === "pharmacy_perenterol") {
      return [
        "PHARMACY_PERENTEROL_AGENT_ID",
        "pharmacy_perenterol_agent_id",
        "PERENTEROL_AGENT_ID"
      ];
    }

    // Generischer Pharmacy-Agent (Fallback)
    if (agentKey === "pharmacy") {
      return [
        "PHARMACY_AGENT_ID",
        "pharmacy_agent_id"
      ];
    }

    // ═══════════════════════════════════════════════════════════════
    // DEFAULT FALLBACK
    // ═══════════════════════════════════════════════════════════════
    return ["AGENT_ID", "agent_id"];
  })();

  console.log("🔍 Searching for agent ID in environment variables:");
  console.log("  - Candidate keys:", candidateKeys.join(", "));

  // Debug: Alle verfügbaren ENV-Variablen mit "AGENT" anzeigen
  const allAgentEnvVars = Object.keys(process.env).filter(k =>
    k.toUpperCase().includes('AGENT')
  );
  console.log("  - Available AGENT env vars:", allAgentEnvVars.join(", "));

  const agentId = candidateKeys
    .map(k => {
      const value = process.env[k as keyof NodeJS.ProcessEnv];
      if (value) {
        console.log(`  ✅ Found: ${k} = ${value.substring(0, 10)}...`);
      }
      return value;
    })
    .find(Boolean);

  if (!agentId) {
    console.error("❌ NO AGENT ID FOUND!");
    console.error("  - Requested key:", agentKey);
    console.error("  - Searched variables:", candidateKeys.join(", "));
    console.error("  - Available variables:", allAgentEnvVars.join(", "));
    throw Error(`${candidateKeys.join("/")} is not set`);
  }

  console.log("✅ Agent ID found:", agentId.substring(0, 15) + "...");

  try {
    console.log("🔌 Initializing ElevenLabs client...");
    const client = new ElevenLabsClient();

    console.log("📡 Requesting signed URL from ElevenLabs API...");
    console.log("  - Agent ID:", agentId);

    const response = await client.conversationalAi.getSignedUrl({
      agent_id: agentId,
    });

    console.log("✅ Signed URL received successfully");
    console.log("  - URL preview:", response.signed_url.substring(0, 50) + "...");
    console.log("  - URL length:", response.signed_url.length);
    console.log("═══════════════════════════════════════════════════════════");

    return NextResponse.json({ signedUrl: response.signed_url });

  } catch (error) {
    console.error("═══════════════════════════════════════════════════════════");
    console.error("🚨 ERROR GETTING SIGNED URL");
    console.error("═══════════════════════════════════════════════════════════");
    console.error("Error object:", error);
    console.error("Error type:", typeof error);

    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    console.error("═══════════════════════════════════════════════════════════");

    return NextResponse.json(
      { error: "Failed to get signed URL", details: String(error) },
      { status: 500 }
    );
  }
}