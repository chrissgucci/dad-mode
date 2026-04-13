import { useState, useEffect, useCallback } from "react";

/* ───────── DESIGN TOKENS ───────── */
const T = {
  bg: "#0F1117",
  card: "#1A1D27",
  border: "#2A2D37",
  his: "#4CAF50",
  hers: "#E091C9",
  text: "#F5F3EF",
  textSecondary: "#7B8794",
  textMuted: "#5A6170",
  textBody: "#C8C4BC",
  textCaption: "#9B978F",
  font: "'Avenir Next', 'Segoe UI', system-ui, sans-serif",
  maxW: 520,
};

const typeColors = {
  baby: "#F4A940",
  exercise: "#4CAF50",
  food: "#FFB300",
  you: "#5C6BC0",
  wife: "#E091C9",
};

/* ───────── LOCALSTORAGE HOOK ───────── */
function useLocalStorage(key, init) {
  const [val, setVal] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : init;
    } catch {
      return init;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch {}
  }, [key, val]);
  return [val, setVal];
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

/* ───────── DAILY SCHEDULE DATA ───────── */
const schedule = [
  // --- Morning ---
  { time: "5:15 AM", activity: "Wife wakes — Peloton class (20–30 min)", icon: "💪", type: "wife" },
  { time: "5:45 AM", activity: "Wife showers, pumps, gets ready for work", icon: "🚿", type: "wife" },
  { time: "6:00 AM", activity: "You wake up, black coffee or espresso", icon: "☕", type: "you" },
  { time: "6:45 AM", activity: "Wife eats Meal 1 (grab-and-go), heads to work", icon: "🚗", type: "wife" },
  { time: "7:00 AM", activity: "Baby wakes — diaper, 6oz bottle/nurse, burp, tummy time", icon: "👶", type: "baby" },
  { time: "7:00 AM", activity: "You eat Meal 1 — Breakfast (while baby feeds)", icon: "🍳", type: "food" },
  { time: "7:30 AM", activity: "Baby play — activity mat, reading, sensory toys", icon: "🧸", type: "baby" },
  // --- Nap 1 (1 hr) ---
  { time: "8:30 AM", activity: "Nap 1 starts — put baby down drowsy but awake", icon: "😴", type: "baby" },
  { time: "8:40 AM", activity: "Walk #1 — stroller walk, 45–60 min, brisk pace", icon: "🚶", type: "exercise" },
  // --- Wake window 2 ---
  { time: "9:30 AM", activity: "Baby wakes — diaper, 6oz bottle, burp", icon: "👶", type: "baby" },
  { time: "9:45 AM", activity: "Meal 2 — Mid-morning snack", icon: "🥤", type: "food" },
  { time: "10:00 AM", activity: "Baby play — jumper, songs, walks around the house", icon: "🧸", type: "baby" },
  { time: "11:00 AM", activity: "Baby shows sleep cues — wind down routine", icon: "👶", type: "baby" },
  // --- Nap 2 (1 hr) ---
  { time: "11:30 AM", activity: "Nap 2 starts — put baby down", icon: "😴", type: "baby" },
  { time: "11:30 AM", activity: "Meal 3 — Lunch", icon: "🥗", type: "food" },
  { time: "11:45 AM", activity: "LIFT (Mon/Tue/Thu/Fri) or rest — 25 min", icon: "🏋️", type: "exercise" },
  { time: "12:15 PM", activity: "Quick shower, stretch", icon: "🚿", type: "you" },
  // --- Wake window 3 ---
  { time: "12:30 PM", activity: "Baby wakes — diaper, 6oz bottle, burp", icon: "👶", type: "baby" },
  { time: "1:00 PM", activity: "Baby play — outdoor blanket time, stroller errand", icon: "🧸", type: "baby" },
  { time: "2:00 PM", activity: "Meal 4 — Afternoon snack", icon: "🍎", type: "food" },
  { time: "2:30 PM", activity: "Baby shows sleep cues — wind down", icon: "👶", type: "baby" },
  // --- Nap 3 (40 min) ---
  { time: "3:00 PM", activity: "Nap 3 starts — put baby down (shorter nap)", icon: "😴", type: "baby" },
  { time: "3:00 PM", activity: "Meal 5 — Snack, prep bottles, light chores", icon: "🥤", type: "food" },
  // --- Wake window 4 ---
  { time: "3:40 PM", activity: "Baby wakes — diaper, 6oz bottle, burp", icon: "👶", type: "baby" },
  { time: "4:00 PM", activity: "Baby play — walk, carrier time, sensory play", icon: "🧸", type: "baby" },
  { time: "4:10 PM", activity: "Walk #2 — stroller or carrier walk, 45–60 min", icon: "🚶", type: "exercise" },
  { time: "4:30 PM", activity: "Baby shows sleep cues — wind down", icon: "👶", type: "baby" },
  // --- Nap 4 (40 min) ---
  { time: "5:00 PM", activity: "Nap 4 starts — put baby down (catnap)", icon: "😴", type: "baby" },
  { time: "5:00 PM", activity: "Start dinner prep", icon: "🔪", type: "food" },
  // --- Evening ---
  { time: "5:40 PM", activity: "Baby wakes — diaper, bottle/nurse", icon: "👶", type: "baby" },
  { time: "5:45 PM", activity: "Wife home — nurse baby, change, family time", icon: "👨‍👩‍👦", type: "wife" },
  { time: "6:00 PM", activity: "Family walk — 20–30 min, wife's daily walk", icon: "🚶‍♀️", type: "exercise" },
  { time: "6:30 PM", activity: "Meal 6 — Dinner together (same meal, different portions)", icon: "🍽️", type: "food" },
  { time: "6:45 PM", activity: "Baby bath, lotion, pajamas, nurse/final bottle", icon: "🛁", type: "baby" },
  { time: "7:00 PM", activity: "Baby bedtime — dark room, sound machine, put down", icon: "🌙", type: "baby" },
  { time: "7:15 PM", activity: "Wife pumps for next day's bottles", icon: "🍼", type: "wife" },
  { time: "7:30 PM", activity: "Evening snack (both), relax, partner time", icon: "✨", type: "you" },
  { time: "9:30 PM", activity: "Sleep — recovery is everything", icon: "💤", type: "you" },
];

/* ───────── HIS LIFTING PROGRAM ───────── */
const hisProgram = {
  "Monday — Upper Push": {
    focus: "Chest, Shoulders, Triceps",
    exercises: [
      { name: "DB Floor Press", sets: "4×10", weight: "40–50 lb", rest: "60s", notes: "Slow eccentric, squeeze at top" },
      { name: "Incline DB Press (bench)", sets: "3×12", weight: "35–45 lb", rest: "60s", notes: "30° incline on foldable bench" },
      { name: "Push-ups → Pike Push-ups", sets: "3×12 + 8", weight: "BW", rest: "45s", notes: "Superset — no rest between" },
      { name: "DB Lateral Raise", sets: "3×15", weight: "15–20 lb", rest: "45s", notes: "Control the negative" },
      { name: "TRX Tricep Extension", sets: "3×15", weight: "BW", rest: "45s", notes: "Elbows locked in place" },
      { name: "Diamond Push-ups", sets: "2×AMRAP", weight: "BW", rest: "—", notes: "Finisher — go to failure" },
    ],
  },
  "Tuesday — Lower Body": {
    focus: "Quads, Glutes, Hamstrings, Calves",
    exercises: [
      { name: "DB Goblet Squat", sets: "4×12", weight: "50 lb", rest: "60s", notes: "Pause at bottom 1 sec" },
      { name: "DB Romanian Deadlift", sets: "4×10", weight: "45–50 lb each", rest: "60s", notes: "Hinge deep, feel hamstrings" },
      { name: "DB Walking Lunge", sets: "3×10/leg", weight: "35 lb each", rest: "60s", notes: "Long stride, upright torso" },
      { name: "Single-leg DB Hip Thrust", sets: "3×12/leg", weight: "40 lb", rest: "45s", notes: "Bench-supported, squeeze glute" },
      { name: "DB Calf Raise (single leg)", sets: "3×20/leg", weight: "50 lb", rest: "30s", notes: "Full ROM, hold at top" },
      { name: "TRX Hamstring Curl", sets: "2×15", weight: "BW", rest: "—", notes: "Finisher — slow and controlled" },
    ],
  },
  "Thursday — Upper Pull": {
    focus: "Back, Biceps, Rear Delts",
    exercises: [
      { name: "Pull-ups (weighted if able)", sets: "4×8", weight: "BW or +15 lb", rest: "90s", notes: "Full dead hang, no kipping" },
      { name: "DB Bent-over Row", sets: "4×10", weight: "45–50 lb each", rest: "60s", notes: "Chest-supported on bench if preferred" },
      { name: "TRX Face Pull", sets: "3×15", weight: "BW", rest: "45s", notes: "Squeeze rear delts 2 sec" },
      { name: "DB Hammer Curl", sets: "3×12", weight: "25–30 lb", rest: "45s", notes: "No swing, strict form" },
      { name: "DB Reverse Fly (bent)", sets: "3×15", weight: "15–20 lb", rest: "45s", notes: "Pinch shoulder blades" },
      { name: "Chin-up Hold", sets: "2×max hold", weight: "BW", rest: "—", notes: "Hold chin above bar as long as possible" },
    ],
  },
  "Friday — Full Body + Core": {
    focus: "Compounds + Ab Focus",
    exercises: [
      { name: "DB Thruster", sets: "3×10", weight: "35–40 lb each", rest: "60s", notes: "Squat to overhead press, explosive" },
      { name: "Pull-up → Hanging Leg Raise", sets: "3×6 + 10", weight: "BW", rest: "60s", notes: "Superset — pull-up then legs up" },
      { name: "DB Single-arm Row", sets: "3×10/arm", weight: "50 lb", rest: "45s", notes: "Bench-supported" },
      { name: "TRX Body Saw Plank", sets: "3×30s", weight: "BW", rest: "30s", notes: "Rock forward and back slowly" },
      { name: "Ab Wheel / TRX Fallout", sets: "3×12", weight: "BW", rest: "45s", notes: "Fully extend, control return" },
      { name: "Dead Bug", sets: "2×10/side", weight: "—", rest: "—", notes: "Lower back glued to floor" },
    ],
  },
};

/* ───────── HER PELOTON SPRING RESET PROGRAM ───────── */
const herPeloton = {
  "Monday — Strength": {
    focus: "Peloton Spring Reset · Full body strength",
    exercises: [
      { name: "Peloton Strength Class", sets: "30 min", notes: "Follow along on Peloton — Spring Reset program" },
    ],
  },
  "Tuesday — Bike": {
    focus: "Peloton Spring Reset · Cycling",
    exercises: [
      { name: "Peloton Bike Class", sets: "30 min", notes: "Follow along on Peloton — Spring Reset program" },
    ],
  },
  "Wednesday — Core": {
    focus: "Peloton Spring Reset · Core strength",
    exercises: [
      { name: "Peloton Core Class", sets: "20 min", notes: "Follow along on Peloton — Spring Reset program" },
    ],
  },
  "Thursday — Strength": {
    focus: "Peloton Spring Reset · Full body strength",
    exercises: [
      { name: "Peloton Strength Class", sets: "30 min", notes: "Follow along on Peloton — Spring Reset program" },
    ],
  },
  "Friday — Bike": {
    focus: "Peloton Spring Reset · Cycling",
    exercises: [
      { name: "Peloton Bike Class", sets: "30 min", notes: "Follow along on Peloton — Spring Reset program" },
    ],
  },
  "Saturday — Pilates or Yoga": {
    focus: "Weekend recovery · Your choice",
    exercises: [
      { name: "Peloton Pilates or Yoga", sets: "20–30 min", notes: "Pick whichever feels right — follow along on Peloton" },
    ],
  },
  "Sunday — Pilates or Yoga": {
    focus: "Weekend recovery · Your choice",
    exercises: [
      { name: "Peloton Pilates or Yoga", sets: "20–30 min", notes: "Pick whichever feels right — follow along on Peloton" },
    ],
  },
};

/* ───────── HIS MEAL PLAN ───────── */
const hisMealPlan = {
  summary: { calories: "~1,950", protein: "~190g", carbs: "~155g", fat: "~65g", rationale: "Moderate deficit (~300–500 cal below maintenance). High protein preserves muscle while cutting. Target: ~0.75–1 lb/week loss, 4.5–6 lbs over 6 weeks to break sub-15% BF." },
  meals: [
    { num: 1, name: "Breakfast — 7:00 AM", cals: 400, protein: 40, options: [
      { name: "Egg White Scramble", details: "6 egg whites + 1 whole egg, 100g Fire Roasted Bell Peppers & Onions, 1 Turkey Sausage patty, 1 slice Sprouted Wheat bread" },
      { name: "Protein Oats", details: "40g oats, 1 scoop whey, 80g frozen blueberries, 10g almond butter" },
      { name: "Greek Yogurt Bowl", details: "200g nonfat Greek yogurt, 30g Maple Pecan Granola, 80g strawberries, 10g honey" },
    ]},
    { num: 2, name: "Mid-Morning — 9:15 AM", cals: 200, protein: 30, options: [
      { name: "Protein Shake", details: "1 scoop whey + 1 banana" },
      { name: "Cottage Cheese Cup", details: "170g lowfat cottage cheese + dried mango" },
    ]},
    { num: 3, name: "Lunch — 11:00 AM", cals: 450, protein: 45, options: [
      { name: "Chicken Salad Plate", details: "150g Grilled Chicken Strips, Cruciferous Crunch (half bag), 1/2 avocado, 2 tbsp Green Goddess" },
      { name: "Turkey Wrap", details: "1 tortilla, 120g turkey breast, 30g Unexpected Cheddar, lettuce, mustard, 1 cup Tomato Bisque" },
      { name: "Beef & Rice Bowl", details: "130g 85/15 ground beef (drained), 120g jasmine rice, 50g tomato, 30g Mexican Blend, 2 tbsp salsa, lime" },
    ]},
    { num: 4, name: "Post-Workout — 12:40 PM", cals: 250, protein: 35, options: [
      { name: "Whey + Rice Cake", details: "1 scoop whey, 2 brown rice cakes, 10g PB" },
      { name: "Chicken Bites", details: "100g leftover chicken breast, 1 small apple" },
    ]},
    { num: 5, name: "Afternoon — 3:00 PM", cals: 180, protein: 15, options: [
      { name: "TJ's Snack Plate", details: "2 Turkey Jerky sticks + 15 Inner Peas" },
      { name: "Hard Boiled Eggs", details: "2 hard boiled eggs + everything bagel seasoning" },
    ]},
    { num: 6, name: "Dinner — 6:45 PM", cals: 450, protein: 45, options: [
      { name: "Salmon & Veggies", details: "150g salmon, 200g roasted broccoli, 100g steamed lentils" },
      { name: "Turkey Stir-fry", details: "150g ground turkey, 200g stir fry veggies, 2 tbsp Soyaki, 100g jasmine rice" },
      { name: "Chicken & Sweet Potato", details: "150g chicken breast (21 Seasoning Salute), 150g sweet potato, 150g green beans" },
    ]},
    { num: 7, name: "Evening — 8:00 PM", cals: 120, protein: 20, options: [
      { name: "Greek Yogurt", details: "150g nonfat Greek yogurt + cinnamon" },
      { name: "Cottage Cheese", details: "120g lowfat cottage cheese — skip if protein target hit" },
    ]},
  ],
};

/* ───────── HER MEAL PLAN (100% DAIRY-FREE) ───────── */
const herMealPlan = {
  summary: { calories: "~2,050–2,100", protein: "~140g", carbs: "~210g", fat: "~72g", rationale: "Nursing burns ~400–500 cal/day. Gentle deficit (~200–300 cal) to protect milk supply while losing ~0.5 lb/week. All meals are dairy-free for baby's potential allergy." },
  meals: [
    { num: 1, name: "Breakfast — 6:45 AM", cals: 420, protein: 28, options: [
      { name: "Overnight Oats (grab-and-go)", details: "50g oats, 200ml oat milk, 80g frozen blueberries, 15g almond butter, 10g honey, 15g hemp seeds — prep night before" },
      { name: "Egg & Avocado Toast", details: "2 whole eggs scrambled, 1/2 avocado (60g) on 1 slice Sprouted Wheat bread, everything bagel seasoning" },
      { name: "Protein Smoothie", details: "1 scoop plant-based protein (pea/rice blend), 1 banana, 100g frozen blueberries, 1 tbsp almond butter, 200ml oat milk" },
    ]},
    { num: 2, name: "Mid-Morning — 10:00 AM", cals: 250, protein: 18, options: [
      { name: "Apple + Almond Butter", details: "1 medium apple, 20g almond butter" },
      { name: "Trail Mix + Turkey Jerky", details: "30g Trek Mix, 1 Turkey Jerky stick" },
    ]},
    { num: 3, name: "Lunch — 12:30 PM", cals: 500, protein: 38, options: [
      { name: "Chicken Salad Plate", details: "150g Grilled Chicken Strips, Cruciferous Crunch (half bag), 1/2 avocado, 2 tbsp Green Goddess, 1 slice Sprouted Wheat bread" },
      { name: "Turkey Wrap", details: "1 tortilla, 120g turkey breast, 1/2 avocado (60g), lettuce, mustard, 1 cup Tomato Bisque (dairy-free), 1 small apple" },
      { name: "Beef & Rice Bowl", details: "130g 85/15 ground beef, 150g jasmine rice, 50g tomato, 1/2 avocado (60g), 2 tbsp salsa, lime" },
    ]},
    { num: 4, name: "Afternoon — 3:00 PM", cals: 230, protein: 18, options: [
      { name: "Chicken & Fruit", details: "80g leftover chicken breast, 80g strawberries, 10g sunflower seeds" },
      { name: "Protein Bar (dairy-free)", details: "1 dairy-free protein bar (RXBAR, GoMacro, etc. ~200 cal, 12g+ protein) + handful of berries" },
    ]},
    { num: 5, name: "Dinner — 6:45 PM", cals: 500, protein: 38, options: [
      { name: "Salmon & Veggies", details: "130g salmon, 200g roasted broccoli, 150g steamed lentils, 1 tsp olive oil" },
      { name: "Turkey Stir-fry", details: "130g ground turkey, 200g stir fry veggies, 2 tbsp Soyaki, 150g jasmine rice" },
      { name: "Chicken & Sweet Potato", details: "130g chicken breast, 180g baked sweet potato, 150g green beans" },
    ]},
    { num: 6, name: "Evening — 8:00 PM", cals: 200, protein: 14, options: [
      { name: "Lactation Oat Bites", details: "2 homemade bites: 60g oats, 30g almond butter, 15g brewer's yeast, 20g honey, 15g flaxseed, 10g dairy-free dark chocolate chips" },
      { name: "Banana + Almond Butter", details: "1 small banana, 15g almond butter, sprinkle of cinnamon and hemp seeds" },
    ]},
  ],
};

/* ───────── COMBINED GROCERY LIST ───────── */
const groceryList = {
  "Proteins": [
    "Grilled Chicken Strips — 3 bags/week (shared)",
    "Fresh chicken breasts — 3 lbs/week (shared)",
    "Fresh Atlantic Salmon — 5–6 fillets/week (shared)",
    "Ground Turkey 93/7 — 1.5 lbs/week (shared)",
    "Ground Beef 85/15 — 1 lb/week (shared)",
    "Oven Roasted Turkey Breast deli — 1 pack (shared)",
    "Turkey Breakfast Sausage patties (his)",
    "Turkey Jerky sticks (shared)",
    "Cage-free eggs — 3 dozen/week (shared)",
    "Whey protein powder (his)",
    "Plant-based protein powder — pea/rice blend (her, dairy-free)",
  ],
  "Dairy (his) & Eggs": [
    "Nonfat Plain Greek Yogurt — 1× 32oz tub (his only)",
    "Lowfat Cottage Cheese — 1× 16oz (his only)",
    "Unexpected Cheddar — 1 block (his only)",
    "Shredded Mexican Blend Cheese — 1 bag (his only)",
    "Cage-free Hard Boiled Eggs — 2 packs (his)",
  ],
  "Dairy-Free (her)": [
    "Oat milk — 1 carton (her smoothies/oats)",
    "Hemp seeds (her breakfast/snacks)",
    "Dairy-free dark chocolate chips (her lactation bites)",
    "Dairy-free protein bars — RXBAR or GoMacro (her snacks)",
    "Sunflower seeds (her snacks)",
  ],
  "Carbs & Grains": [
    "Jasmine Rice — 1 large bag (shared)",
    "Rolled Oats — 1 canister (shared, she uses more)",
    "Sprouted Wheat Bread (shared)",
    "Brown Rice Cakes (his snacks)",
    "Flour Tortillas, small (shared)",
    "Steamed Lentils — 3–4 packs (shared)",
    "Maple Pecan Granola (shared — measure portions)",
  ],
  "Fruits & Veggies": [
    "Frozen Wild Blueberries — 2 bags (shared)",
    "Bananas (shared)",
    "Strawberries (shared)",
    "Apples (shared)",
    "Avocados (shared)",
    "Sweet potatoes (shared)",
    "Cruciferous Crunch salad kit — 2 bags (shared)",
    "Frozen Broccoli Florets — 2 bags (shared)",
    "Frozen Green Beans — 1 bag (shared)",
    "Frozen Stir Fry Vegetables — 2 bags (shared)",
    "Fire Roasted Bell Peppers & Onions, frozen (his)",
    "Cucumber (shared)",
    "Tomatoes (shared)",
    "Lettuce (shared)",
  ],
  "Sauces & Seasonings": [
    "Green Goddess Dressing (shared)",
    "Toasted Sesame Dressing (shared)",
    "Soyaki Sauce (shared)",
    "Everything But The Bagel Seasoning (shared)",
    "21 Seasoning Salute (shared)",
    "Mustard (shared)",
    "Honey (shared)",
    "Chunky Salsa — 1 jar (shared)",
    "Limes (shared)",
    "Olive oil (shared)",
  ],
  "Snacks & Extras": [
    "Inner Peas — 1 bag (his)",
    "Dried Mango (his)",
    "Almond Butter — 1 jar (shared)",
    "Peanut Butter — 1 jar (shared)",
    "Trek Mix (her snacks)",
    "Brewer's yeast (her lactation bites)",
    "Ground flaxseed (her lactation bites)",
    "Protein bars — 1 box (her afternoon snack)",
  ],
  "Other": [
    "Black coffee / espresso (shared)",
    "Tomato Bisque soup, canned (shared)",
  ],
};

/* ───────── SPARKLINE COMPONENT ───────── */
function Sparkline({ data, color, width = 180, height = 40 }) {
  if (!data || data.length < 2) return null;
  const vals = data.map((d) => d.w);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const points = vals
    .map(
      (v, i) =>
        `${(i / (vals.length - 1)) * width},${height - ((v - min) / range) * (height - 8) - 4}`
    )
    .join(" ");
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

/* ───────── CHECKBOX COMPONENT ───────── */
function Check({ checked, onToggle, color = T.his }) {
  return (
    <div
      onClick={onToggle}
      style={{
        width: 26,
        height: 26,
        minWidth: 26,
        borderRadius: 6,
        border: `2px solid ${checked ? color : T.border}`,
        background: checked ? color : "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        WebkitTapHighlightColor: "transparent",
        transition: "all 0.15s ease",
      }}
    >
      {checked && (
        <span style={{ color: "#fff", fontSize: 14, fontWeight: 700, lineHeight: 1 }}>✓</span>
      )}
    </div>
  );
}

/* ───────── TABS ───────── */
const TABS = [
  { label: "Schedule", icon: "📅" },
  { label: "His", icon: "💪" },
  { label: "Hers", icon: "🧘‍♀️" },
  { label: "Meals", icon: "🍽️" },
  { label: "Grocery", icon: "🛒" },
  { label: "Progress", icon: "📊" },
];

/* ───────── HELPERS ───────── */
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function dateAdd(dateStr, days) {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function formatDateShort(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

/* ═══════════════════════════════════════════ */
/*               MAIN APP                      */
/* ═══════════════════════════════════════════ */
export default function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [filters, setFilters] = useState(new Set(["baby", "exercise", "food", "you", "wife"]));
  const [expandedDay, setExpandedDay] = useState(null);
  const [expandedHerDay, setExpandedHerDay] = useState(null);
  const [herSubTab, setHerSubTab] = useState("strength");
  const [mealPerson, setMealPerson] = useState("his");
  const [expandedMeal, setExpandedMeal] = useState(null);

  // localStorage state
  const [startDate, setStartDate] = useLocalStorage("dadmode_start_date", "");
  const [workouts, setWorkouts] = useLocalStorage("dadmode_workouts", {});
  const [meals, setMeals] = useLocalStorage("dadmode_meals", {});
  const [weightHis, setWeightHis] = useLocalStorage("dadmode_weight_his", []);
  const [weightHers, setWeightHers] = useLocalStorage("dadmode_weight_hers", []);
  const [grocery, setGrocery] = useLocalStorage("dadmode_grocery", {});
  const [weightInput, setWeightInput] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Week counter
  const programStarted = startDate !== "";
  const daysSince = programStarted
    ? Math.floor((Date.now() - new Date(startDate + "T00:00:00").getTime()) / 86400000)
    : 0;
  const rawWeek = programStarted ? Math.floor(daysSince / 7) + 1 : 0;
  const weekNum = Math.min(6, Math.max(1, rawWeek));
  const programComplete = programStarted && rawWeek > 6;

  // Workout toggle
  const toggleExercise = (person, dayName, exIdx) => {
    const today = todayStr();
    setWorkouts((prev) => {
      const copy = { ...prev };
      if (!copy[today]) copy[today] = {};
      const key = `${person}_${dayName}`;
      if (!copy[today][key]) copy[today][key] = [];
      const arr = [...(copy[today][key] || [])];
      arr[exIdx] = !arr[exIdx];
      copy[today] = { ...copy[today], [key]: arr };
      return copy;
    });
  };

  const getExChecked = (person, dayName, exIdx) => {
    const today = todayStr();
    const key = `${person}_${dayName}`;
    return !!(workouts[today] && workouts[today][key] && workouts[today][key][exIdx]);
  };

  const getDayCompletion = (person, dayName, total) => {
    const today = todayStr();
    const key = `${person}_${dayName}`;
    if (!workouts[today] || !workouts[today][key]) return 0;
    return workouts[today][key].filter(Boolean).length;
  };

  // Meal toggle
  const toggleMeal = (person, mealIdx) => {
    const today = todayStr();
    setMeals((prev) => {
      const copy = { ...prev };
      if (!copy[today]) copy[today] = {};
      const key = `${person}_${mealIdx}`;
      copy[today] = { ...copy[today], [key]: !copy[today][key] };
      return copy;
    });
  };

  const getMealChecked = (person, mealIdx) => {
    const today = todayStr();
    const key = `${person}_${mealIdx}`;
    return !!(meals[today] && meals[today][key]);
  };

  const getMealProgress = (person, totalMeals) => {
    const today = todayStr();
    let count = 0;
    for (let i = 0; i < totalMeals; i++) {
      const key = `${person}_${i}`;
      if (meals[today] && meals[today][key]) count++;
    }
    return count;
  };

  // Weight log
  const logWeight = (person) => {
    const w = parseFloat(weightInput);
    if (isNaN(w) || w <= 0) return;
    const setter = person === "his" ? setWeightHis : setWeightHers;
    const today = todayStr();
    setter((prev) => {
      const filtered = prev.filter((e) => e.d !== today);
      return [...filtered, { d: today, w }].slice(-30);
    });
    setWeightInput("");
  };

  // Grocery toggle
  const toggleGroceryItem = (item) => {
    setGrocery((prev) => ({ ...prev, [item]: !prev[item] }));
  };

  const resetGrocery = () => {
    if (window.confirm("Reset all grocery checkboxes?")) {
      setGrocery({});
    }
  };

  const totalGroceryItems = Object.values(groceryList).flat().length;
  const checkedGroceryItems = Object.values(grocery).filter(Boolean).length;

  // ─────── STYLES ───────
  const containerStyle = {
    fontFamily: T.font,
    background: T.bg,
    color: T.text,
    minHeight: "100vh",
    maxWidth: T.maxW,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    position: "relative",
  };

  const headerStyle = {
    padding: "16px 20px 12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  };

  const tabBarStyle = {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    background: T.card,
    borderTop: `1px solid ${T.border}`,
    display: "flex",
    justifyContent: "center",
    paddingBottom: "env(safe-area-inset-bottom, 0px)",
    zIndex: 100,
  };

  const tabBarInnerStyle = {
    display: "flex",
    maxWidth: T.maxW,
    width: "100%",
  };

  const contentStyle = {
    flex: 1,
    overflowY: "auto",
    paddingBottom: 90,
    paddingLeft: 16,
    paddingRight: 16,
  };

  // ─────── RENDER HELPERS ───────
  const filterTypes = ["all", "baby", "exercise", "food", "you", "wife"];

  const allTypes = ["baby", "exercise", "food", "you", "wife"];
  const allSelected = allTypes.every((t) => filters.has(t));

  const toggleFilter = (f) => {
    if (f === "all") {
      setFilters(new Set(allSelected ? [] : allTypes));
    } else {
      setFilters((prev) => {
        const next = new Set(prev);
        if (next.has(f)) next.delete(f);
        else next.add(f);
        return next;
      });
    }
  };

  const renderScheduleTab = () => {
    const filtered = allSelected ? schedule : schedule.filter((s) => filters.has(s.type));
    return (
      <div>
        <div style={{ display: "flex", flexWrap: "wrap", marginBottom: 16 }}>
          {["all", ...allTypes].map((f) => {
            const isActive = f === "all" ? allSelected : filters.has(f);
            return (
              <button
                key={f}
                onClick={() => toggleFilter(f)}
                style={{
                  padding: "6px 14px",
                  marginRight: 8,
                  marginBottom: 8,
                  borderRadius: 20,
                  border: "none",
                  background: isActive ? (typeColors[f] || "#5C6BC0") : T.card,
                  color: isActive ? "#fff" : T.textSecondary,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  WebkitTapHighlightColor: "transparent",
                  textTransform: "capitalize",
                }}
              >
                {f === "all" ? "All" : f}
              </button>
            );
          })}
        </div>
        {filtered.map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "flex-start",
              marginBottom: 12,
              padding: "12px 14px",
              background: T.card,
              borderRadius: 10,
              borderLeft: `3px solid ${typeColors[item.type] || T.border}`,
            }}
          >
            <span style={{ fontSize: 20, marginRight: 12, minWidth: 28 }}>{item.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: T.textMuted, fontWeight: 600, marginBottom: 2 }}>
                {item.time}
              </div>
              <div style={{ fontSize: 14, color: T.textBody, lineHeight: 1.4 }}>
                {item.activity}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderExerciseList = (exercises, person, dayName, accentColor) => (
    <div style={{ padding: "8px 0" }}>
      {exercises.map((ex, i) => {
        const checked = getExChecked(person, dayName, i);
        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "flex-start",
              padding: "10px 0",
              borderBottom: i < exercises.length - 1 ? `1px solid ${T.border}` : "none",
              opacity: checked ? 0.5 : 1,
              transition: "opacity 0.15s ease",
            }}
          >
            <div style={{ marginRight: 12, marginTop: 2 }}>
              <Check
                checked={checked}
                onToggle={() => toggleExercise(person, dayName, i)}
                color={accentColor}
              />
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: T.text,
                  textDecoration: checked ? "line-through" : "none",
                  marginBottom: 4,
                }}
              >
                {ex.name}
              </div>
              <div style={{ fontSize: 12, color: T.textCaption, display: "flex", flexWrap: "wrap" }}>
                <span style={{ marginRight: 12 }}>{ex.sets}</span>
                {ex.weight && <span style={{ marginRight: 12 }}>{ex.weight}</span>}
                {ex.rest && ex.rest !== "—" && <span style={{ marginRight: 12 }}>Rest: {ex.rest}</span>}
              </div>
              {ex.notes && (
                <div style={{ fontSize: 11, color: T.textMuted, marginTop: 4, fontStyle: "italic" }}>
                  {ex.notes}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderWorkoutProgram = (program, person, accentColor) => (
    <div>
      {Object.entries(program).map(([dayName, day]) => {
        const isExpanded = person === "his" ? expandedDay === dayName : expandedHerDay === dayName;
        const setExpanded = person === "his" ? setExpandedDay : setExpandedHerDay;
        const completed = getDayCompletion(person, dayName, day.exercises.length);
        const total = day.exercises.length;
        const allDone = completed === total;

        return (
          <div
            key={dayName}
            style={{
              background: T.card,
              borderRadius: 10,
              marginBottom: 12,
              overflow: "hidden",
              border: `1px solid ${T.border}`,
            }}
          >
            <div
              onClick={() => setExpanded(isExpanded ? null : dayName)}
              style={{
                padding: "14px 16px",
                cursor: "pointer",
                WebkitTapHighlightColor: "transparent",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>
                  {dayName}
                  {allDone && (
                    <span
                      style={{
                        marginLeft: 10,
                        fontSize: 11,
                        background: accentColor,
                        color: "#fff",
                        padding: "2px 8px",
                        borderRadius: 10,
                        fontWeight: 600,
                      }}
                    >
                      ✓ Done
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: T.textCaption, marginTop: 4 }}>{day.focus}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                {completed > 0 && (
                  <span style={{ fontSize: 12, color: accentColor, marginRight: 10, fontWeight: 600 }}>
                    {completed}/{total}
                  </span>
                )}
                <span style={{ color: T.textMuted, fontSize: 18, transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "rotate(0)" }}>
                  ▾
                </span>
              </div>
            </div>
            {isExpanded && (
              <div style={{ padding: "0 16px 14px" }}>
                {renderExerciseList(day.exercises, person, dayName, accentColor)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderHisTab = () => (
    <div>{renderWorkoutProgram(hisProgram, "his", T.his)}</div>
  );

  const renderHerTab = () => (
    <div>
      <div style={{ fontSize: 13, color: T.textCaption, marginBottom: 12, fontWeight: 600 }}>
        Peloton Spring Reset
      </div>
      {renderWorkoutProgram(herPeloton, "hers", T.hers)}
    </div>
  );

  const renderWeightSection = (person) => {
    const weightData = person === "his" ? weightHis : weightHers;
    const accentColor = person === "his" ? T.his : T.hers;
    const last = weightData.length > 0 ? weightData[weightData.length - 1] : null;
    return (
      <div
        style={{
          background: T.card,
          borderRadius: 10,
          padding: 16,
          marginBottom: 16,
          border: `1px solid ${T.border}`,
        }}
      >
        <div style={{ fontSize: 13, color: T.textCaption, fontWeight: 600, marginBottom: 10 }}>
          Weight Log
          {last && (
            <span style={{ color: accentColor, marginLeft: 8 }}>
              Current: {last.w} lbs
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
          <input
            type="number"
            step="0.1"
            placeholder="lbs"
            value={weightInput}
            onChange={(e) => setWeightInput(e.target.value)}
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: 8,
              border: `1px solid ${T.border}`,
              background: T.bg,
              color: T.text,
              fontSize: 15,
              fontFamily: T.font,
              outline: "none",
              marginRight: 10,
            }}
          />
          <button
            onClick={() => logWeight(person)}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: "none",
              background: accentColor,
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            Log
          </button>
        </div>
        <Sparkline data={weightData.slice(-14)} color={accentColor} />
      </div>
    );
  };

  const renderMealsTab = () => {
    const plan = mealPerson === "his" ? hisMealPlan : herMealPlan;
    const accentColor = mealPerson === "his" ? T.his : T.hers;
    const progress = getMealProgress(mealPerson, plan.meals.length);

    return (
      <div>
        {/* Person toggle */}
        <div style={{ display: "flex", marginBottom: 16 }}>
          {["his", "hers"].map((p) => (
            <button
              key={p}
              onClick={() => {
                setMealPerson(p);
                setExpandedMeal(null);
              }}
              style={{
                flex: 1,
                padding: "10px 0",
                border: "none",
                borderRadius: p === "his" ? "8px 0 0 8px" : "0 8px 8px 0",
                background: mealPerson === p ? (p === "his" ? T.his : T.hers) : T.card,
                color: mealPerson === p ? "#fff" : T.textSecondary,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {p === "his" ? "His Plan" : "Her Plan"}
            </button>
          ))}
        </div>

        {/* Weight section */}
        {renderWeightSection(mealPerson === "his" ? "his" : "hers")}

        {/* Macros summary */}
        <div
          style={{
            background: T.card,
            borderRadius: 10,
            padding: "12px 16px",
            marginBottom: 16,
            border: `1px solid ${T.border}`,
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <div style={{ textAlign: "center", minWidth: 60, marginBottom: 4 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: accentColor }}>{plan.summary.calories}</div>
            <div style={{ fontSize: 10, color: T.textMuted }}>Calories</div>
          </div>
          <div style={{ textAlign: "center", minWidth: 60, marginBottom: 4 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>{plan.summary.protein}</div>
            <div style={{ fontSize: 10, color: T.textMuted }}>Protein</div>
          </div>
          <div style={{ textAlign: "center", minWidth: 60, marginBottom: 4 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>{plan.summary.carbs}</div>
            <div style={{ fontSize: 10, color: T.textMuted }}>Carbs</div>
          </div>
          <div style={{ textAlign: "center", minWidth: 60, marginBottom: 4 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>{plan.summary.fat}</div>
            <div style={{ fontSize: 10, color: T.textMuted }}>Fat</div>
          </div>
          <div style={{ textAlign: "center", minWidth: 60, marginBottom: 4 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: accentColor }}>
              {progress}/{plan.meals.length}
            </div>
            <div style={{ fontSize: 10, color: T.textMuted }}>Meals</div>
          </div>
        </div>

        {/* Rationale */}
        <div
          style={{
            fontSize: 12,
            color: T.textMuted,
            lineHeight: 1.5,
            marginBottom: 16,
            padding: "0 4px",
            fontStyle: "italic",
          }}
        >
          {plan.summary.rationale}
        </div>

        {/* Meal cards */}
        {plan.meals.map((meal, mIdx) => {
          const checked = getMealChecked(mealPerson, mIdx);
          const isExpanded = expandedMeal === mIdx;
          return (
            <div
              key={mIdx}
              style={{
                background: T.card,
                borderRadius: 10,
                marginBottom: 12,
                overflow: "hidden",
                border: `1px solid ${T.border}`,
                opacity: checked ? 0.6 : 1,
                transition: "opacity 0.15s ease",
              }}
            >
              <div
                style={{
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                <div style={{ marginRight: 12 }}>
                  <Check
                    checked={checked}
                    onToggle={() => toggleMeal(mealPerson, mIdx)}
                    color={accentColor}
                  />
                </div>
                <div style={{ flex: 1 }} onClick={() => setExpandedMeal(isExpanded ? null : mIdx)}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: T.text,
                      textDecoration: checked ? "line-through" : "none",
                    }}
                  >
                    {meal.name}
                  </div>
                  <div style={{ fontSize: 12, color: T.textCaption, marginTop: 2 }}>
                    {meal.cals} cal · {meal.protein}g protein
                  </div>
                </div>
                <span
                  onClick={() => setExpandedMeal(isExpanded ? null : mIdx)}
                  style={{
                    color: T.textMuted,
                    fontSize: 18,
                    cursor: "pointer",
                    transition: "transform 0.2s",
                    transform: isExpanded ? "rotate(180deg)" : "rotate(0)",
                  }}
                >
                  ▾
                </span>
              </div>
              {isExpanded && (
                <div style={{ padding: "0 16px 14px" }}>
                  {meal.options.map((opt, oIdx) => (
                    <div
                      key={oIdx}
                      style={{
                        padding: "10px 0",
                        borderTop: `1px solid ${T.border}`,
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 600, color: accentColor, marginBottom: 4 }}>
                        {opt.name}
                      </div>
                      <div style={{ fontSize: 12, color: T.textBody, lineHeight: 1.5 }}>
                        {opt.details}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderGroceryTab = () => (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>
          {checkedGroceryItems}/{totalGroceryItems} items
        </div>
        <button
          onClick={resetGrocery}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: `1px solid ${T.border}`,
            background: "transparent",
            color: T.textSecondary,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          Reset All
        </button>
      </div>
      {Object.entries(groceryList).map(([category, items]) => {
        const catChecked = items.filter((item) => grocery[item]).length;
        return (
          <div key={category} style={{ marginBottom: 20 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: T.textCaption,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginBottom: 8,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>{category}</span>
              <span style={{ fontSize: 12, fontWeight: 400, color: T.textMuted }}>
                {catChecked}/{items.length}
              </span>
            </div>
            {items.map((item, i) => {
              const checked = !!grocery[item];
              return (
                <div
                  key={i}
                  onClick={() => toggleGroceryItem(item)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "10px 14px",
                    background: T.card,
                    borderRadius: i === 0 ? "10px 10px 0 0" : i === items.length - 1 ? "0 0 10px 10px" : 0,
                    borderBottom: i < items.length - 1 ? `1px solid ${T.border}` : "none",
                    cursor: "pointer",
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  <Check checked={checked} onToggle={() => {}} color={T.his} />
                  <span
                    style={{
                      marginLeft: 12,
                      fontSize: 14,
                      color: checked ? T.textMuted : T.textBody,
                      textDecoration: checked ? "line-through" : "none",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {item}
                  </span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );

  // ─────── PROGRESS TAB ───────
  const renderProgressTab = () => {
    if (!programStarted) {
      return (
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>📊</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: T.text, marginBottom: 8 }}>
            Set your start date to begin tracking
          </div>
          <div style={{ fontSize: 13, color: T.textMuted }}>
            Tap the header badge above to pick a date.
          </div>
        </div>
      );
    }

    const today = todayStr();
    const programEndDate = dateAdd(startDate, 42); // 6 weeks

    // His workout days mapped to day-of-week
    const hisWorkoutDays = Object.keys(hisProgram);
    const herPelotonDays = Object.keys(herPeloton);

    // Compute daily stats for a given date
    const getDayStats = (dateStr) => {
      const dayWorkouts = workouts[dateStr] || {};
      const dayMeals = meals[dateStr] || {};

      // His workout completion
      let hisCompleted = 0;
      let hisTotal = 0;
      hisWorkoutDays.forEach((dayName) => {
        const key = `his_${dayName}`;
        const exCount = hisProgram[dayName].exercises.length;
        hisTotal += exCount;
        const arr = dayWorkouts[key] || [];
        hisCompleted += arr.filter(Boolean).length;
      });

      // Her workout completion
      let hersCompleted = 0;
      let hersTotal = 0;
      herPelotonDays.forEach((dayName) => {
        const key = `hers_${dayName}`;
        const exCount = herPeloton[dayName].exercises.length;
        hersTotal += exCount;
        const arr = dayWorkouts[key] || [];
        hersCompleted += arr.filter(Boolean).length;
      });

      // Meal completion
      let hisMealsChecked = 0;
      const hisMealsTotal = hisMealPlan.meals.length;
      for (let i = 0; i < hisMealsTotal; i++) {
        if (dayMeals[`his_${i}`]) hisMealsChecked++;
      }
      let herMealsChecked = 0;
      const herMealsTotal = herMealPlan.meals.length;
      for (let i = 0; i < herMealsTotal; i++) {
        if (dayMeals[`hers_${i}`]) herMealsChecked++;
      }

      return {
        hisWorkout: { done: hisCompleted, total: hisTotal },
        hersWorkout: { done: hersCompleted, total: hersTotal },
        hisMeals: { done: hisMealsChecked, total: hisMealsTotal },
        herMeals: { done: herMealsChecked, total: herMealsTotal },
      };
    };

    // Current week view data
    const currentWeekStart = dateAdd(startDate, (weekNum - 1) * 7);
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      weekDays.push(dateAdd(currentWeekStart, i));
    }

    // Weekly aggregates
    let weekHisWorkout = 0, weekHisWorkoutTotal = 0;
    let weekHersWorkout = 0, weekHersWorkoutTotal = 0;
    let weekHisMeals = 0, weekHisMealsTotal = 0;
    let weekHerMeals = 0, weekHerMealsTotal = 0;
    const dailyStats = weekDays.map((d) => {
      const s = getDayStats(d);
      weekHisWorkout += s.hisWorkout.done;
      weekHisWorkoutTotal += s.hisWorkout.total;
      weekHersWorkout += s.hersWorkout.done;
      weekHersWorkoutTotal += s.hersWorkout.total;
      weekHisMeals += s.hisMeals.done;
      weekHisMealsTotal += s.hisMeals.total;
      weekHerMeals += s.herMeals.done;
      weekHerMealsTotal += s.herMeals.total;
      return s;
    });

    // Full program aggregates (all 42 days)
    let progHisWorkout = 0, progHisWorkoutTotal = 0;
    let progHersWorkout = 0, progHersWorkoutTotal = 0;
    let progHisMeals = 0, progHisMealsTotal = 0;
    let progHerMeals = 0, progHerMealsTotal = 0;
    let daysWithActivity = 0;
    for (let i = 0; i < 42; i++) {
      const d = dateAdd(startDate, i);
      const s = getDayStats(d);
      progHisWorkout += s.hisWorkout.done;
      progHisWorkoutTotal += s.hisWorkout.total;
      progHersWorkout += s.hersWorkout.done;
      progHersWorkoutTotal += s.hersWorkout.total;
      progHisMeals += s.hisMeals.done;
      progHisMealsTotal += s.hisMeals.total;
      progHerMeals += s.herMeals.done;
      progHerMealsTotal += s.herMeals.total;
      if (s.hisWorkout.done > 0 || s.hersWorkout.done > 0 || s.hisMeals.done > 0 || s.herMeals.done > 0) {
        daysWithActivity++;
      }
    }

    const pct = (done, total) => (total === 0 ? 0 : Math.round((done / total) * 100));

    const ProgressBar = ({ done, total, color }) => {
      const p = pct(done, total);
      return (
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              flex: 1,
              height: 6,
              background: T.border,
              borderRadius: 3,
              overflow: "hidden",
              marginRight: 10,
            }}
          >
            <div
              style={{
                width: `${p}%`,
                height: "100%",
                background: color,
                borderRadius: 3,
                transition: "width 0.3s ease",
              }}
            />
          </div>
          <span style={{ fontSize: 12, color: T.textCaption, minWidth: 36, textAlign: "right" }}>
            {p}%
          </span>
        </div>
      );
    };

    const StatCard = ({ label, done, total, color }) => (
      <div
        style={{
          background: T.card,
          borderRadius: 10,
          padding: "14px 16px",
          border: `1px solid ${T.border}`,
          marginBottom: 10,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{label}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color }}>
            {done}/{total}
          </span>
        </div>
        <ProgressBar done={done} total={total} color={color} />
      </div>
    );

    // Start New Cycle handler
    const startNewCycle = () => {
      if (window.confirm("Start a new 6-week cycle? Your previous data will be kept but the week counter resets.")) {
        setStartDate(todayStr());
      }
    };

    // ─── COMPLETION VIEW ───
    if (programComplete) {
      const weightStart = weightHis.length > 0 ? weightHis[0] : null;
      const weightEnd = weightHis.length > 0 ? weightHis[weightHis.length - 1] : null;
      const weightStartHer = weightHers.length > 0 ? weightHers[0] : null;
      const weightEndHer = weightHers.length > 0 ? weightHers[weightHers.length - 1] : null;

      return (
        <div>
          {/* Celebration header */}
          <div style={{ textAlign: "center", padding: "20px 0 30px" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#FFB300", marginBottom: 6 }}>
              6 Weeks Complete!
            </div>
            <div style={{ fontSize: 14, color: T.textBody, lineHeight: 1.5 }}>
              {formatDateShort(startDate)} – {formatDateShort(programEndDate)}
            </div>
            <div style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>
              {daysWithActivity} days with logged activity
            </div>
          </div>

          {/* Program totals */}
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: T.textCaption,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginBottom: 10,
              }}
            >
              Program Totals
            </div>
            <StatCard label="His Workouts" done={progHisWorkout} total={progHisWorkoutTotal} color={T.his} />
            <StatCard label="Her Workouts" done={progHersWorkout} total={progHersWorkoutTotal} color={T.hers} />
            <StatCard label="His Meals" done={progHisMeals} total={progHisMealsTotal} color={T.his} />
            <StatCard label="Her Meals" done={progHerMeals} total={progHerMealsTotal} color={T.hers} />
          </div>

          {/* Weight journey */}
          {(weightStart || weightStartHer) && (
            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: T.textCaption,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  marginBottom: 10,
                }}
              >
                Weight Journey
              </div>
              {weightStart && weightEnd && (
                <div
                  style={{
                    background: T.card,
                    borderRadius: 10,
                    padding: 16,
                    border: `1px solid ${T.border}`,
                    marginBottom: 10,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>His Weight</span>
                    <span style={{ fontSize: 13, color: T.his, fontWeight: 700 }}>
                      {weightStart.w} → {weightEnd.w} lbs
                      <span style={{ color: weightEnd.w <= weightStart.w ? T.his : "#FF6B6B", marginLeft: 6 }}>
                        ({weightEnd.w <= weightStart.w ? "" : "+"}{(weightEnd.w - weightStart.w).toFixed(1)})
                      </span>
                    </span>
                  </div>
                  <Sparkline data={weightHis} color={T.his} width={280} height={50} />
                </div>
              )}
              {weightStartHer && weightEndHer && (
                <div
                  style={{
                    background: T.card,
                    borderRadius: 10,
                    padding: 16,
                    border: `1px solid ${T.border}`,
                    marginBottom: 10,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Her Weight</span>
                    <span style={{ fontSize: 13, color: T.hers, fontWeight: 700 }}>
                      {weightStartHer.w} → {weightEndHer.w} lbs
                      <span style={{ color: weightEndHer.w <= weightStartHer.w ? T.hers : "#FF6B6B", marginLeft: 6 }}>
                        ({weightEndHer.w <= weightStartHer.w ? "" : "+"}{(weightEndHer.w - weightStartHer.w).toFixed(1)})
                      </span>
                    </span>
                  </div>
                  <Sparkline data={weightHers} color={T.hers} width={280} height={50} />
                </div>
              )}
            </div>
          )}

          {/* Start new cycle */}
          <button
            onClick={startNewCycle}
            style={{
              width: "100%",
              padding: "16px 0",
              borderRadius: 12,
              border: "none",
              background: T.his,
              color: "#fff",
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
              marginBottom: 20,
            }}
          >
            Start New 6-Week Cycle
          </button>
        </div>
      );
    }

    // ─── ACTIVE PROGRAM VIEW ───
    return (
      <div>
        {/* Week selector */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <span style={{ fontSize: 18, fontWeight: 700, color: T.text }}>
            Week {weekNum} of 6
          </span>
          <span style={{ fontSize: 12, color: T.textMuted, marginLeft: 12 }}>
            {formatDateShort(currentWeekStart)} – {formatDateShort(dateAdd(currentWeekStart, 6))}
          </span>
        </div>

        {/* Weekly summary */}
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: T.textCaption,
              textTransform: "uppercase",
              letterSpacing: 0.5,
              marginBottom: 10,
            }}
          >
            Weekly Summary
          </div>
          <StatCard
            label="His Workouts"
            done={weekHisWorkout}
            total={weekHisWorkoutTotal}
            color={T.his}
          />
          <StatCard
            label="Her Workouts"
            done={weekHersWorkout}
            total={weekHersWorkoutTotal}
            color={T.hers}
          />
          <StatCard
            label="His Meals"
            done={weekHisMeals}
            total={weekHisMealsTotal}
            color={T.his}
          />
          <StatCard
            label="Her Meals"
            done={weekHerMeals}
            total={weekHerMealsTotal}
            color={T.hers}
          />
        </div>

        {/* Daily breakdown */}
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: T.textCaption,
              textTransform: "uppercase",
              letterSpacing: 0.5,
              marginBottom: 10,
            }}
          >
            Daily Breakdown
          </div>
          {weekDays.map((dateStr, i) => {
            const s = dailyStats[i];
            const d = new Date(dateStr + "T12:00:00");
            const dayLabel = DAY_NAMES[d.getDay()];
            const isToday = dateStr === today;
            const isFuture = dateStr > today;
            const hasAnyActivity =
              s.hisWorkout.done > 0 ||
              s.hersWorkout.done > 0 ||
              s.hisMeals.done > 0 ||
              s.herMeals.done > 0;

            return (
              <div
                key={dateStr}
                style={{
                  background: isToday ? "#1E2233" : T.card,
                  borderRadius: 10,
                  padding: "12px 16px",
                  marginBottom: 8,
                  border: `1px solid ${isToday ? T.his : T.border}`,
                  opacity: isFuture ? 0.4 : 1,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: hasAnyActivity && !isFuture ? 10 : 0,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: isToday ? T.his : T.text,
                        minWidth: 36,
                      }}
                    >
                      {dayLabel}
                    </span>
                    <span style={{ fontSize: 12, color: T.textMuted, marginLeft: 8 }}>
                      {formatDateShort(dateStr)}
                    </span>
                    {isToday && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: T.his,
                          marginLeft: 8,
                          textTransform: "uppercase",
                        }}
                      >
                        Today
                      </span>
                    )}
                  </div>
                  {!isFuture && !hasAnyActivity && (
                    <span style={{ fontSize: 11, color: T.textMuted }}>No activity</span>
                  )}
                </div>
                {!isFuture && hasAnyActivity && (
                  <div style={{ display: "flex", flexWrap: "wrap" }}>
                    {s.hisWorkout.done > 0 && (
                      <span
                        style={{
                          fontSize: 11,
                          color: T.his,
                          background: "rgba(76,175,80,0.15)",
                          padding: "3px 8px",
                          borderRadius: 6,
                          marginRight: 6,
                          marginBottom: 4,
                          fontWeight: 600,
                        }}
                      >
                        His Lift {s.hisWorkout.done}/{s.hisWorkout.total}
                      </span>
                    )}
                    {s.hersWorkout.done > 0 && (
                      <span
                        style={{
                          fontSize: 11,
                          color: T.hers,
                          background: "rgba(224,145,201,0.15)",
                          padding: "3px 8px",
                          borderRadius: 6,
                          marginRight: 6,
                          marginBottom: 4,
                          fontWeight: 600,
                        }}
                      >
                        Her Workout {s.hersWorkout.done}/{s.hersWorkout.total}
                      </span>
                    )}
                    {s.hisMeals.done > 0 && (
                      <span
                        style={{
                          fontSize: 11,
                          color: T.his,
                          background: "rgba(76,175,80,0.1)",
                          padding: "3px 8px",
                          borderRadius: 6,
                          marginRight: 6,
                          marginBottom: 4,
                        }}
                      >
                        His Meals {s.hisMeals.done}/{s.hisMeals.total}
                      </span>
                    )}
                    {s.herMeals.done > 0 && (
                      <span
                        style={{
                          fontSize: 11,
                          color: T.hers,
                          background: "rgba(224,145,201,0.1)",
                          padding: "3px 8px",
                          borderRadius: 6,
                          marginRight: 6,
                          marginBottom: 4,
                        }}
                      >
                        Her Meals {s.herMeals.done}/{s.herMeals.total}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Weight trends */}
        {(weightHis.length > 1 || weightHers.length > 1) && (
          <div style={{ marginTop: 20 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: T.textCaption,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginBottom: 10,
              }}
            >
              Weight Trends
            </div>
            {weightHis.length > 1 && (
              <div
                style={{
                  background: T.card,
                  borderRadius: 10,
                  padding: 16,
                  border: `1px solid ${T.border}`,
                  marginBottom: 10,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>His Weight</span>
                  <span style={{ fontSize: 13, color: T.his, fontWeight: 700 }}>
                    {weightHis[weightHis.length - 1].w} lbs
                  </span>
                </div>
                <Sparkline data={weightHis.slice(-14)} color={T.his} width={280} height={50} />
              </div>
            )}
            {weightHers.length > 1 && (
              <div
                style={{
                  background: T.card,
                  borderRadius: 10,
                  padding: 16,
                  border: `1px solid ${T.border}`,
                  marginBottom: 10,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Her Weight</span>
                  <span style={{ fontSize: 13, color: T.hers, fontWeight: 700 }}>
                    {weightHers[weightHers.length - 1].w} lbs
                  </span>
                </div>
                <Sparkline data={weightHers.slice(-14)} color={T.hers} width={280} height={50} />
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // ─────── MAIN RENDER ───────
  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: T.text, letterSpacing: -0.5 }}>
            Dad Mode
          </div>
          <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>Activated</div>
        </div>
        <div
          onClick={() => setShowDatePicker(true)}
          style={{
            background: programComplete ? "#FFB300" : programStarted ? T.his : T.card,
            color: programComplete ? "#0F1117" : programStarted ? "#fff" : T.textSecondary,
            padding: "6px 14px",
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            WebkitTapHighlightColor: "transparent",
            border: programStarted ? "none" : `1px dashed ${T.textMuted}`,
          }}
        >
          {programComplete ? "Complete!" : programStarted ? `Week ${weekNum} of 6` : "Set Start Date"}
        </div>
      </div>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <div
          onClick={() => setShowDatePicker(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: T.card,
              borderRadius: 16,
              padding: 24,
              width: 300,
              border: `1px solid ${T.border}`,
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 4 }}>
              Program Start Date
            </div>
            <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 16 }}>
              When does your 6-week program begin?
            </div>
            <input
              type="date"
              value={startDate || todayStr()}
              onChange={(e) => setStartDate(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 8,
                border: `1px solid ${T.border}`,
                background: T.bg,
                color: T.text,
                fontSize: 16,
                fontFamily: T.font,
                outline: "none",
                marginBottom: 16,
                colorScheme: "dark",
              }}
            />
            <div style={{ display: "flex" }}>
              <button
                onClick={() => {
                  setStartDate("");
                  setShowDatePicker(false);
                }}
                style={{
                  flex: 1,
                  padding: "12px 0",
                  borderRadius: 8,
                  border: `1px solid ${T.border}`,
                  background: "transparent",
                  color: T.textSecondary,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  marginRight: 8,
                }}
              >
                Clear
              </button>
              <button
                onClick={() => {
                  if (!startDate) setStartDate(todayStr());
                  setShowDatePicker(false);
                }}
                style={{
                  flex: 1,
                  padding: "12px 0",
                  borderRadius: 8,
                  border: "none",
                  background: T.his,
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div style={contentStyle}>
        {activeTab === 0 && renderScheduleTab()}
        {activeTab === 1 && renderHisTab()}
        {activeTab === 2 && renderHerTab()}
        {activeTab === 3 && renderMealsTab()}
        {activeTab === 4 && renderGroceryTab()}
        {activeTab === 5 && renderProgressTab()}
      </div>

      {/* Tab Bar */}
      <div style={tabBarStyle}>
        <div style={tabBarInnerStyle}>
          {TABS.map((tab, i) => {
            const isActive = activeTab === i;
            let activeColor = T.text;
            if (isActive) {
              if (i === 1 || i === 3) activeColor = T.his;
              else if (i === 2) activeColor = T.hers;
              else if (i === 5) activeColor = "#5C6BC0";
            }
            return (
              <div
                key={i}
                onClick={() => setActiveTab(i)}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "10px 0 8px",
                  cursor: "pointer",
                  WebkitTapHighlightColor: "transparent",
                  opacity: isActive ? 1 : 0.5,
                  transition: "opacity 0.15s ease",
                }}
              >
                <span style={{ fontSize: 20, marginBottom: 4 }}>{tab.icon}</span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: isActive ? activeColor : T.textMuted,
                  }}
                >
                  {tab.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
