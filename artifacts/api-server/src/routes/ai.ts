import { Router, type IRouter } from "express";
import { AnalyzeImageBody } from "@workspace/api-zod";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

const SYSTEM_PROMPT = `You are Lens AI, a careful AI dermatology assistant. You analyze a single photograph of human skin and produce a concise, structured assessment plus a self-care guide. You are not a doctor and your output is informational only — your guide must always recommend professional care for anything serious.

Always return ONLY a JSON object matching this exact schema (no markdown, no commentary):
{
  "title": string (3-6 words, e.g. "Mild facial acne", "Healthy skin", "Suspicious mole"),
  "condition": one of "none" | "acne" | "benign_lesion" | "malignant_skin_cancer" | "eczema" | "fungal_infection" | "other",
  "infectionPresent": boolean (true if any visible skin condition or infection appears present),
  "severity": one of "none" | "mild" | "moderate" | "severe",
  "urgency": one of "routine" | "soon" | "urgent" (use "urgent" for any suspected malignancy or rapidly worsening signs),
  "confidence": number 0-1 (your honest confidence in the classification),
  "summary": string (2-3 sentences: what you observe and what it suggests, in plain language),
  "symptoms": string[] (3-6 short, observable symptoms — e.g. "Erythema (redness)", "Comedones", "Scaling", "Asymmetric border"),
  "details": [{ "label": string, "value": string }] (3-5 useful attributes: Body region, Color, Texture, Distribution, Border quality, etc.),
  "healthGuide": {
    "overview": string (1-2 sentence plain-language explanation of the condition),
    "dos": string[] (4-5 helpful self-care actions),
    "donts": string[] (3-4 things to avoid),
    "whenToSeeDoctor": string[] (3-4 specific warning signs that warrant a clinician visit)
  },
  "disclaimer": string (a one-sentence disclaimer that this is informational, not a medical diagnosis)
}

Important rules:
- If the image clearly does not show skin (object, plant, scenery, etc.), return condition "none", infectionPresent false, low confidence, and explain in the summary that no skin was detected.
- If the image is ambiguous, lower the confidence and say so in the summary.
- For "malignant_skin_cancer", urgency MUST be "urgent" and "whenToSeeDoctor" MUST recommend prompt evaluation by a dermatologist.
- Tailor "healthGuide" to the specific detected condition — never return a generic guide.
- Always include the disclaimer.`;

router.post("/ai/analyze", async (req, res) => {
  const parsed = AnalyzeImageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { imageBase64, mimeType, bodyArea } = parsed.data;

  const focusHint =
    bodyArea && bodyArea !== "general"
      ? `\n\nThe user indicates this photo is of the ${bodyArea} — emphasize conditions and details typical of that area.`
      : "";

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.4",
      max_completion_tokens: 2500,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT + focusHint,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze the skin in this image and respond with the JSON object as specified.",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    let parsedResult: unknown;
    try {
      parsedResult = JSON.parse(raw);
    } catch {
      res.status(500).json({ error: "AI returned invalid JSON" });
      return;
    }

    const result = parsedResult as Record<string, unknown>;

    const allowedConditions = new Set([
      "none",
      "acne",
      "benign_lesion",
      "malignant_skin_cancer",
      "eczema",
      "fungal_infection",
      "other",
    ]);
    const allowedSeverity = new Set(["none", "mild", "moderate", "severe"]);
    const allowedUrgency = new Set(["routine", "soon", "urgent"]);

    const stringArray = (key: string): string[] =>
      Array.isArray(result[key])
        ? (result[key] as unknown[]).filter(
            (t): t is string => typeof t === "string",
          )
        : [];

    const guideRaw =
      typeof result["healthGuide"] === "object" && result["healthGuide"] !== null
        ? (result["healthGuide"] as Record<string, unknown>)
        : {};

    const guideStringArray = (key: string): string[] =>
      Array.isArray(guideRaw[key])
        ? (guideRaw[key] as unknown[]).filter(
            (t): t is string => typeof t === "string",
          )
        : [];

    const condition =
      typeof result["condition"] === "string" &&
      allowedConditions.has(result["condition"])
        ? (result["condition"] as string)
        : "other";
    const severity =
      typeof result["severity"] === "string" &&
      allowedSeverity.has(result["severity"])
        ? (result["severity"] as string)
        : "none";
    let urgency =
      typeof result["urgency"] === "string" &&
      allowedUrgency.has(result["urgency"])
        ? (result["urgency"] as string)
        : "routine";

    if (condition === "malignant_skin_cancer") {
      urgency = "urgent";
    }

    const safe = {
      title: typeof result["title"] === "string" ? result["title"] : "Analysis",
      condition,
      infectionPresent:
        typeof result["infectionPresent"] === "boolean"
          ? result["infectionPresent"]
          : condition !== "none",
      severity,
      urgency,
      confidence:
        typeof result["confidence"] === "number"
          ? Math.max(0, Math.min(1, result["confidence"]))
          : 0.5,
      summary:
        typeof result["summary"] === "string"
          ? result["summary"]
          : "No description available.",
      symptoms: stringArray("symptoms"),
      details: Array.isArray(result["details"])
        ? (result["details"] as Array<Record<string, unknown>>)
            .filter(
              (d) =>
                typeof d["label"] === "string" &&
                typeof d["value"] === "string",
            )
            .map((d) => ({
              label: d["label"] as string,
              value: d["value"] as string,
            }))
        : [],
      healthGuide: {
        overview:
          typeof guideRaw["overview"] === "string"
            ? (guideRaw["overview"] as string)
            : "",
        dos: guideStringArray("dos"),
        donts: guideStringArray("donts"),
        whenToSeeDoctor: guideStringArray("whenToSeeDoctor"),
      },
      disclaimer:
        typeof result["disclaimer"] === "string"
          ? result["disclaimer"]
          : "This analysis is informational only and not a medical diagnosis. Consult a qualified clinician for medical advice.",
    };

    res.json(safe);
  } catch (err) {
    req.log.error({ err }, "AI analysis failed");
    res.status(500).json({ error: "AI analysis failed. Please try again." });
  }
});

export default router;
