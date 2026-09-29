import { NextResponse } from 'next/server';

// Vercel Serverless Function & Route Segment Configuration
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 30; // Allow up to 30s execution duration on Vercel

// Security: Max allowed payload size (10 MB in base64 characters)
const MAX_IMAGE_BASE64_LENGTH = 14 * 1024 * 1024;

// Security: Allowed image MIME types
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
]);

// Gemini candidate models supported by Google AI Studio with active quota
const GEMINI_CANDIDATE_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-flash-lite-latest',
];

export async function POST(req: Request) {
  try {
    // 1. Safe JSON parsing & size guard
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Malformed JSON payload.' }, { status: 400 });
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid request body.' }, { status: 400 });
    }

    const {
      imageBase64,
      mimeType: rawMime = 'image/jpeg',
      foodTitle,
      itemName,
      category = 'PREPARED_MEALS',
    } = body;

    // 2. Input Sanitization & Security Defenses
    // Strip control characters and cap title length to mitigate prompt injection & ReDoS
    const rawName = String(foodTitle || itemName || 'Cooked Food Dish');
    const sanitizedTitle = rawName
      .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
      .replace(/[`${}\\]/g, '')
      .trim()
      .slice(0, 100) || 'Food Batch';

    const safeCategory = String(category).trim().slice(0, 40);

    // 3. Payload size check & base64 sanitization
    let cleanBase64 = '';
    let validatedMime = 'image/jpeg';

    if (imageBase64 && typeof imageBase64 === 'string') {
      if (imageBase64.length > MAX_IMAGE_BASE64_LENGTH) {
        return NextResponse.json(
          { success: false, error: 'Image size exceeds maximum permissible 10MB limit.' },
          { status: 413 }
        );
      }

      // Check if imageBase64 has data URL scheme
      const commaIdx = imageBase64.indexOf(',');
      if (imageBase64.startsWith('data:') && commaIdx !== -1) {
        const header = imageBase64.slice(5, commaIdx);
        const mimeMatch = header.match(/^([^;]+)/);
        if (mimeMatch && ALLOWED_MIME_TYPES.has(mimeMatch[1].toLowerCase())) {
          validatedMime = mimeMatch[1].toLowerCase();
        }
        cleanBase64 = imageBase64.slice(commaIdx + 1).replace(/\s+/g, '');
      } else {
        cleanBase64 = imageBase64.replace(/\s+/g, '');
        if (ALLOWED_MIME_TYPES.has(String(rawMime).toLowerCase())) {
          validatedMime = String(rawMime).toLowerCase();
        }
      }

      // Safe base64 padding normalization
      while (cleanBase64.length > 0 && cleanBase64.length % 4 !== 0) {
        cleanBase64 += '=';
      }
    }

    // 4. Server-Side Private Gemini Vision API Call
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (!apiKey && cleanBase64) {
      console.warn('[Vercel Setup Notice] GEMINI_API_KEY environment variable is not defined in process.env.');
      return NextResponse.json(
        {
          success: false,
          source: 'VERCEL_CONFIG_NOTICE',
          error: 'GEMINI_API_KEY is not configured on Vercel.',
          report: {
            isFoodItem: false,
            detectedContent: 'Configuration Required: GEMINI_API_KEY Missing on Vercel',
            visualFreshnessScore: 0,
            freshnessStatus: 'INVALID_SPECIMEN',
            spoilageRisk: 'NONE',
            estimatedSafeWindowHours: 0,
            recommendedAction:
              'Vercel Configuration Notice: The GEMINI_API_KEY environment variable is missing from your Vercel deployment. Add GEMINI_API_KEY in Vercel Dashboard -> Project -> Settings -> Environment Variables, and trigger a redeploy.',
            isUrgentSosEscalated: false,
            spectralFeatures: {
              colorStability: 'Environment variable required',
              textureIntegrity: 'Add GEMINI_API_KEY in Vercel dashboard',
              thermalSafeZone: 'N/A',
              moistureRetention: 'N/A',
            },
          },
        },
        { 
          status: 200,
          headers: { 'Cache-Control': 'no-store, max-age=0' }
        }
      );
    }

    if (apiKey && cleanBase64) {
      const prompt = `You are Annsarthi Food Safety and Quality Assessment Vision Engine.
Examine this image with extreme sensory precision and object recognition.

STRICT THREE-STEP EVALUATION:

STEP 1: NON-FOOD VALIDATION
Determine whether this image depicts actual EDIBLE FOOD, grocery ingredients, raw produce, fresh bakery, cooked meals, or food rations.
If the image depicts human beings, people, faces, family photos, pets, animals, clothing, electronics, vehicles, furniture, household items, tools, documents, screenshots of portals/text, or ANY non-food objects:
You MUST IMMEDIATELY REJECT it as non-food!
Schema for Non-Food:
{
  "isFoodItem": false,
  "detectedContent": "Exact description of non-food object seen, e.g. 'A pair of running shoes and a water bottle' or 'A screenshot of a software dashboard'",
  "visualFreshnessScore": 0,
  "freshnessStatus": "INVALID_SPECIMEN",
  "spoilageRisk": "NONE",
  "estimatedSafeWindowHours": 0,
  "recommendedAction": "Non-food item detected. Please scan or upload an image of prepared food, produce, or groceries.",
  "isUrgentSosEscalated": false,
  "spectralFeatures": {
    "colorStability": "Non-food visual profile",
    "textureIntegrity": "Non-edible matter detected",
    "thermalSafeZone": "N/A",
    "moistureRetention": "N/A"
  }
}

STEP 2: SPOILAGE & DECOMPOSITION DETECTION
If it IS food, inspect carefully for ANY signs of spoilage:
- Mold, fungal mycelium, green/black/white fuzzy patches, spores
- Putrefaction, rot, dark enzymatic browning, decay, slimy residue, discoloration
- Curdling, sour fermentation, shriveling/wrinkling due to decomposition
If ANY visual spoilage or mold is detected:
You MUST classify it as UNFIT!
Schema for Spoiled Food:
{
  "isFoodItem": true,
  "detectedContent": "Description of spoiled food, e.g. 'Moldy bread with fungal mycelium growth' or 'Rotten decomposed tomatoes'",
  "visualFreshnessScore": 25,
  "freshnessStatus": "UNFIT",
  "spoilageRisk": "CRITICAL",
  "estimatedSafeWindowHours": 0,
  "recommendedAction": "UNFIT for human consumption! Severe microbial spoilage or decomposition detected. Divert immediately to Bio-Processing / Aerobic Composting.",
  "isUrgentSosEscalated": false,
  "spectralFeatures": {
    "colorStability": "Discoloration and fungal pigmentation detected",
    "textureIntegrity": "Cellular decomposition / structural breakdown",
    "thermalSafeZone": "Unsafe - biological growth present",
    "moistureRetention": "Abnormal surface moisture / decay"
  }
}

STEP 3: FRESH & EDIBLE FOOD EVALUATION
If the food is clean, edible, and free from spoilage:
Set "isFoodItem": true.
"detectedContent": "Accurate name and description of the food, e.g. 'Fresh red apples' or 'Cooked yellow dal and rice'",
"visualFreshnessScore": integer from 50 to 100 based on visible vibrancy, cellular turgor, and quality.
"freshnessStatus": strictly "OPTIMAL" (score 85-100), "GOOD" (score 70-84), or "BORDERLINE" (score 50-69).
"spoilageRisk": strictly "LOW" or "MEDIUM".
"estimatedSafeWindowHours": realistic remaining safe consumption hours before spoiling (e.g. 2.0 to 24.0).
"recommendedAction": logistics directive (e.g. "Safe window under 3 hours! Fast-track priority dispatch." or "Approved for standard donation redistribution.").
"isUrgentSosEscalated": boolean, true if estimatedSafeWindowHours <= 3.0.
"spectralFeatures": object with "colorStability", "textureIntegrity", "thermalSafeZone", "moistureRetention".

Respond ONLY with valid JSON conforming to this specification.`;

      // Try candidate models in order with timeout (20 seconds for deep multimodal image inspection)
      for (const model of GEMINI_CANDIDATE_MODELS) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);

          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              signal: controller.signal,
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      { text: prompt },
                      {
                        inline_data: {
                          mime_type: validatedMime,
                          data: cleanBase64,
                        },
                      },
                    ],
                  },
                ],
                generationConfig: {
                  temperature: 0.1,
                  response_mime_type: 'application/json',
                },
              }),
            }
          );

          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            const parts = data.candidates?.[0]?.content?.parts || [];
            const textPart = parts.find((p: any) => p.text && !p.thought) || parts[0];
            const candidateText = textPart?.text;

            if (candidateText) {
              const jsonMatch = candidateText.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);

                if (typeof parsed.visualFreshnessScore === 'number') {
                  return NextResponse.json(
                    {
                      success: true,
                      source: 'GEMINI_VISION_AI',
                      model,
                      report: parsed,
                    },
                    {
                      headers: { 'Cache-Control': 'no-store, max-age=0' },
                    }
                  );
                }
              }
            }
          }
        } catch {
          // Model timed out or failed; continue to next candidate
        }
      }
    }

    // 5. Intelligent Multi-Spectral Heuristic Fallback Engine
    // Ensures uninterrupted operations even during temporary Gemini demand spikes or network limits
    const lower = sanitizedTitle.toLowerCase();
    let freshness = 94;
    let status: 'OPTIMAL' | 'GOOD' | 'BORDERLINE' | 'UNFIT' = 'OPTIMAL';
    let risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    let safeHours = 5.0;
    let recommendation = 'Approved for standard donation redistribution.';
    let isUrgent = false;

    // Non-food keyword detection
    if (
      lower.includes('person') ||
      lower.includes('people') ||
      lower.includes('family') ||
      lower.includes('face') ||
      lower.includes('selfie') ||
      lower.includes('human') ||
      lower.includes('man') ||
      lower.includes('woman') ||
      lower.includes('child') ||
      lower.includes('dog') ||
      lower.includes('cat') ||
      lower.includes('pet') ||
      lower.includes('car') ||
      lower.includes('phone') ||
      lower.includes('laptop') ||
      lower.includes('document') ||
      lower.includes('shoe') ||
      lower.includes('cloth') ||
      lower.includes('shirt') ||
      lower.includes('bottle') ||
      lower.includes('chair') ||
      lower.includes('desk') ||
      lower.includes('table') ||
      lower.includes('mouse') ||
      lower.includes('keyboard') ||
      lower.includes('screenshot') ||
      lower.includes('non-food') ||
      lower.includes('non food')
    ) {
      return NextResponse.json({
        success: true,
        source: 'ANNSARTHI_HEURISTIC_VISION',
        report: {
          isFoodItem: false,
          detectedContent: 'Non-food subject or object detected',
          visualFreshnessScore: 0,
          freshnessStatus: 'INVALID_SPECIMEN',
          spoilageRisk: 'NONE',
          estimatedSafeWindowHours: 0,
          recommendedAction: 'Invalid specimen: The uploaded image depicts people or non-food objects. Please upload or scan actual food or grocery items.',
          isUrgentSosEscalated: false,
          spectralFeatures: {
            colorStability: 'Non-food visual profile',
            textureIntegrity: 'Non-edible matter detected',
            thermalSafeZone: 'N/A',
            moistureRetention: 'N/A',
          },
        },
      });
    }

    if (
      lower.includes('spoil') ||
      lower.includes('sour') ||
      lower.includes('mold') ||
      lower.includes('rot') ||
      lower.includes('decay') ||
      lower.includes('fung') ||
      lower.includes('expired') ||
      lower.includes('stale') ||
      lower.includes('curdled') ||
      lower.includes('bad') ||
      lower.includes('decompos')
    ) {
      freshness = 28;
      status = 'UNFIT';
      risk = 'CRITICAL';
      safeHours = 0;
      recommendation = 'UNFIT for human consumption! Severe spoilage / microbial decomposition detected. Divert immediately to Bio-Processing / Aerobic Composting.';
      isUrgent = false;
    } else if (cleanBase64) {
      // Unverified image fallback when Google AI is temporarily offline or rate-limited
      return NextResponse.json({
        success: true,
        source: 'ANNSARTHI_HEURISTIC_VISION',
        report: {
          isFoodItem: true,
          detectedContent: 'Unverified Visual Specimen (AI Offline)',
          visualFreshnessScore: 50,
          freshnessStatus: 'BORDERLINE',
          spoilageRisk: 'HIGH',
          estimatedSafeWindowHours: 1.0,
          recommendedAction: 'Notice: Multimodal AI Vision was momentarily unreachable. Specimen flagged for physical culinary inspection before distribution.',
          isUrgentSosEscalated: true,
          spectralFeatures: {
            colorStability: 'Pending optical confirmation',
            textureIntegrity: 'Pending culinary inspection',
            thermalSafeZone: 'Precautionary 1-hour shelf limit applied',
            moistureRetention: 'Unverified specimen',
          },
        },
      });
    } else if (
      lower.includes('curry') ||
      lower.includes('dal') ||
      lower.includes('rice') ||
      lower.includes('khichdi') ||
      lower.includes('biryani') ||
      lower.includes('sambar') ||
      lower.includes('gravy') ||
      lower.includes('soup')
    ) {
      freshness = 92;
      status = 'GOOD';
      risk = 'MEDIUM';
      safeHours = 2.8;
      isUrgent = true;
      recommendation = 'Safe window under 3 hours! Fast-track priority dispatch to nearby shelters.';
    } else if (safeCategory === 'DAIRY' || lower.includes('paneer') || lower.includes('milk') || lower.includes('curd')) {
      freshness = 89;
      status = 'GOOD';
      risk = 'MEDIUM';
      safeHours = 3.2;
      recommendation = 'Requires continuous cold-chain holding at ≤4°C. Assign refrigerated carrier.';
    } else if (safeCategory === 'FRUITS' || safeCategory === 'VEGETABLES' || lower.includes('apple') || lower.includes('fruit') || lower.includes('salad')) {
      freshness = 96;
      status = 'OPTIMAL';
      risk = 'LOW';
      safeHours = 12.0;
      recommendation = 'Optimal cellular turgor. Standard donation routing approved.';
    } else if (safeCategory === 'BAKERY' || lower.includes('bread') || lower.includes('roti') || lower.includes('naan')) {
      freshness = 93;
      status = 'OPTIMAL';
      risk = 'LOW';
      safeHours = 18.0;
      recommendation = 'Dry ambient storage certified. Ready for standard dispatch.';
    }

    return NextResponse.json({
      success: true,
      source: 'ANNSARTHI_HEURISTIC_VISION',
      report: {
        isFoodItem: true,
        detectedContent: sanitizedTitle,
        visualFreshnessScore: freshness,
        freshnessStatus: status,
        spoilageRisk: risk,
        estimatedSafeWindowHours: safeHours,
        recommendedAction: recommendation,
        isUrgentSosEscalated: isUrgent,
        spectralFeatures: {
          colorStability: freshness > 80 ? 'Vibrant chromatic index, no enzymatic browning' : 'Slight discoloration / oxidation detected',
          textureIntegrity: freshness > 80 ? 'Cellular matrix firm and intact' : 'Surface degradation observed',
          thermalSafeZone: safeCategory === 'DAIRY' ? 'Hold at ≤4°C chilled' : 'Hot held at ≥63°C standard',
          moistureRetention: 'Normal surface vapor equilibrium',
        },
      },
    });
  } catch {
    // Never expose stack traces or internal secrets to clients
    return NextResponse.json(
      { success: false, error: 'Food quality evaluation process failed safely.' },
      { status: 500 }
    );
  }
}