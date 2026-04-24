import { Feather } from "@expo/vector-icons";

import type {
  Severity,
  SkinCondition,
  Urgency,
} from "@/contexts/HistoryContext";

type IconName = keyof typeof Feather.glyphMap;

export const CONDITION_LABEL: Record<SkinCondition, string> = {
  none: "No infection detected",
  acne: "Acne",
  benign_lesion: "Benign lesion",
  malignant_skin_cancer: "Suspicious — possible skin cancer",
  eczema: "Eczema",
  fungal_infection: "Fungal infection",
  other: "Other condition",
};

export const CONDITION_SHORT: Record<SkinCondition, string> = {
  none: "Clear",
  acne: "Acne",
  benign_lesion: "Benign",
  malignant_skin_cancer: "Suspicious",
  eczema: "Eczema",
  fungal_infection: "Fungal",
  other: "Other",
};

export const CONDITION_ICON: Record<SkinCondition, IconName> = {
  none: "check-circle",
  acne: "droplet",
  benign_lesion: "circle",
  malignant_skin_cancer: "alert-octagon",
  eczema: "wind",
  fungal_infection: "cloud-drizzle",
  other: "help-circle",
};

export function severityLabel(s: Severity): string {
  switch (s) {
    case "none":
      return "No findings";
    case "mild":
      return "Mild";
    case "moderate":
      return "Moderate";
    case "severe":
      return "Severe";
  }
}

export function urgencyLabel(u: Urgency): string {
  switch (u) {
    case "routine":
      return "Routine — self-care";
    case "soon":
      return "See a doctor soon";
    case "urgent":
      return "See a doctor promptly";
  }
}

export function severityColor(
  s: Severity,
  colors: { success: string; warning: string; destructive: string; mutedForeground: string },
): string {
  switch (s) {
    case "none":
      return colors.success;
    case "mild":
      return colors.success;
    case "moderate":
      return colors.warning;
    case "severe":
      return colors.destructive;
  }
}

export function urgencyColor(
  u: Urgency,
  colors: { success: string; warning: string; destructive: string },
): string {
  switch (u) {
    case "routine":
      return colors.success;
    case "soon":
      return colors.warning;
    case "urgent":
      return colors.destructive;
  }
}

export type ConditionGuide = {
  key: SkinCondition;
  name: string;
  tagline: string;
  overview: string;
  signs: string[];
  causes: string[];
  selfCare: string[];
  seeDoctor: string[];
  accent: string;
};

export const CONDITION_GUIDE: ConditionGuide[] = [
  {
    key: "acne",
    name: "Acne",
    tagline: "Clogged pores, pimples and breakouts",
    overview:
      "Acne happens when hair follicles become blocked with oil (sebum) and dead skin cells, often inflamed by bacteria. It usually shows up on the face, chest, back and shoulders, and is most common from the teen years into early adulthood — but it can happen at any age.",
    signs: [
      "Whiteheads, blackheads and small red bumps (papules)",
      "Pus-filled spots (pustules) and tender deeper nodules",
      "Oily skin and enlarged pores",
      "Post-acne marks or pitted scars after lesions heal",
    ],
    causes: [
      "Excess sebum production, often hormone-driven",
      "Hormonal shifts (puberty, menstrual cycle, PCOS, stress)",
      "Pore-clogging skincare or makeup",
      "Friction from masks, helmets, phones; high-glycemic diet for some people",
    ],
    selfCare: [
      "Cleanse twice daily with a gentle, non-stripping cleanser",
      "Use over-the-counter benzoyl peroxide, salicylic acid or adapalene",
      "Stick with one routine for 6–8 weeks before judging results",
      "Choose non-comedogenic moisturizer and broad-spectrum SPF daily",
    ],
    seeDoctor: [
      "Painful, deep cysts or nodules that scar",
      "Acne not improving after 8–12 weeks of consistent OTC care",
      "Sudden severe breakouts in adulthood",
      "Acne that's seriously affecting your mood or self-esteem",
    ],
    accent: "#ec4899",
  },
  {
    key: "benign_lesion",
    name: "Benign lesion",
    tagline: "Moles, skin tags and other harmless growths",
    overview:
      "Benign lesions are non-cancerous growths on or just under the skin. They include common moles, seborrheic keratoses, cherry angiomas, dermatofibromas and skin tags. Most are harmless, but any new or changing spot should still be watched.",
    signs: [
      "Stable shape, color and size over months or years",
      "Symmetric, with smooth and well-defined edges",
      "Usually a single, even color (brown, pink, flesh-toned)",
      "Generally smaller than a pencil eraser (about 6 mm)",
    ],
    causes: [
      "Genetics — many people inherit a tendency to develop moles",
      "Cumulative sun exposure can trigger sun-related lesions",
      "Aging (seborrheic keratoses become more common over 40)",
      "Hormonal changes during pregnancy",
    ],
    selfCare: [
      "Use the ABCDE rule monthly to check moles (Asymmetry, Border, Color, Diameter, Evolving)",
      "Photograph spots you want to track and re-check every few months",
      "Apply broad-spectrum SPF 30+ daily and reapply outdoors",
      "Avoid picking, shaving over, or trying to remove lesions yourself",
    ],
    seeDoctor: [
      "A spot that's changing in size, color or shape",
      "Bleeding, itching or pain that doesn't resolve",
      "A lesion that looks different from your others (\"ugly duckling\")",
      "Any new pigmented spot appearing after age 40",
    ],
    accent: "#14b8a6",
  },
  {
    key: "malignant_skin_cancer",
    name: "Malignant skin cancer",
    tagline: "Melanoma, basal cell and squamous cell carcinoma",
    overview:
      "Skin cancer is the abnormal growth of skin cells, most often triggered by UV damage. The three main types are basal cell carcinoma (most common, slow-growing), squamous cell carcinoma (can grow faster), and melanoma (less common but the most serious). Early detection dramatically improves outcomes.",
    signs: [
      "A new spot, or a mole that's changing in size, color or shape",
      "Asymmetric outline, irregular borders, more than one color",
      "A sore that won't heal, or scabs and re-bleeds",
      "A pearly, waxy, or shiny bump; or a rough, scaly, red patch",
    ],
    causes: [
      "Cumulative UV exposure from the sun and tanning beds",
      "Fair skin, light eyes, easy sunburns and many moles",
      "Personal or family history of skin cancer",
      "Weakened immune system or prior radiation exposure",
    ],
    selfCare: [
      "Do a head-to-toe self-check every month — including scalp, soles and between toes",
      "Wear SPF 30+ daily and reapply every 2 hours outdoors",
      "Seek shade between 10 a.m. and 4 p.m.; wear protective clothing and a hat",
      "Avoid tanning beds entirely",
    ],
    seeDoctor: [
      "Any spot that fits one or more ABCDE warning signs",
      "A sore that hasn't healed in 4 weeks",
      "A mole that itches, hurts, bleeds, or oozes",
      "Don't wait — book a dermatologist promptly for any of the above",
    ],
    accent: "#ef4444",
  },
  {
    key: "eczema",
    name: "Eczema",
    tagline: "Itchy, dry, inflamed skin (atopic dermatitis)",
    overview:
      "Eczema is a chronic inflammatory skin condition where the skin barrier doesn't hold moisture well and overreacts to triggers. It causes itchy, dry, red or discolored patches, often on the hands, elbows, knees, neck and face. It typically flares and settles in cycles.",
    signs: [
      "Persistent itch — often worse at night",
      "Dry, scaly or cracked patches",
      "Red, brown or grayish discoloration depending on skin tone",
      "Small fluid-filled bumps that can ooze and crust over",
    ],
    causes: [
      "Genetic skin barrier issues (often with asthma or hay fever)",
      "Triggers: soap, detergents, fragrances, wool, sweat, stress",
      "Dry, cold air or sudden temperature changes",
      "Allergens like dust mites, pet dander, certain foods",
    ],
    selfCare: [
      "Moisturize at least twice a day with a thick, fragrance-free cream or ointment",
      "Take short, lukewarm showers and pat skin dry — don't rub",
      "Use mild, fragrance-free cleansers and laundry detergent",
      "Identify and avoid your personal triggers; manage stress",
    ],
    seeDoctor: [
      "Patches that are spreading, very painful or oozing yellow crust",
      "Eczema that's interfering with sleep or daily life",
      "Signs of skin infection: warmth, swelling, fever, red streaks",
      "Symptoms not improving with consistent moisturizing and OTC hydrocortisone",
    ],
    accent: "#a855f7",
  },
  {
    key: "fungal_infection",
    name: "Fungal infection",
    tagline: "Ringworm, athlete's foot, jock itch and yeast infections",
    overview:
      "Skin fungal infections are caused by fungi (dermatophytes or yeasts) that thrive in warm, moist areas. Common forms include tinea corporis (ringworm), tinea pedis (athlete's foot), tinea cruris (jock itch), and candida (yeast). They're contagious but usually treatable with topical antifungals.",
    signs: [
      "Red or discolored, often ring-shaped patches with a clearer center",
      "Itching, burning or stinging — especially in skin folds",
      "Scaling, peeling or cracked skin, sometimes with small blisters",
      "On feet: itchiness between toes, soggy white skin, odor",
    ],
    causes: [
      "Warm, sweaty environments (gyms, locker rooms, tight shoes)",
      "Sharing towels, combs, razors or athletic equipment",
      "Direct contact with infected people, pets or contaminated surfaces",
      "Diabetes, weakened immune system or prolonged antibiotic use",
    ],
    selfCare: [
      "Apply an OTC antifungal cream (clotrimazole, miconazole, terbinafine) for 2–4 weeks",
      "Keep affected areas clean and thoroughly dry, especially skin folds and between toes",
      "Wear breathable cotton clothing and change socks daily",
      "Don't share personal items; wash bedding and towels in hot water",
    ],
    seeDoctor: [
      "No improvement after 2 weeks of consistent OTC treatment",
      "Infection of the scalp, beard or nails (these usually need oral medication)",
      "Spreading rash, severe pain, or signs of bacterial infection",
      "Recurrent infections, or you have diabetes or a weakened immune system",
    ],
    accent: "#f59e0b",
  },
];

export const BODY_AREAS: {
  key: "general" | "face" | "scalp" | "body" | "hands" | "feet";
  label: string;
  icon: IconName;
  color: string;
}[] = [
  { key: "general", label: "General", icon: "search", color: "#5b5bff" },
  { key: "face", label: "Face", icon: "smile", color: "#ec4899" },
  { key: "scalp", label: "Scalp", icon: "user", color: "#a855f7" },
  { key: "body", label: "Body", icon: "user-check", color: "#14b8a6" },
  { key: "hands", label: "Hands", icon: "thumbs-up", color: "#f59e0b" },
  { key: "feet", label: "Feet", icon: "navigation", color: "#10b981" },
];
