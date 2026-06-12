import type { Track } from "../types";

/**
 * Seed curriculum.
 *
 * Right now both the web pages and the API read straight from this array. When
 * you add a database, this becomes your seed data and the API starts reading
 * from the DB instead — but the `Track` shape stays the same, so nothing else
 * has to change.
 */
export const TRACKS: Track[] = [
  {
    id: "money",
    slug: "money",
    title: "Money Basics",
    description: "Budgeting, saving, and not fearing your bank app.",
    color: "emerald",
    emoji: "💰",
    lessons: [
      {
        id: "money-1",
        title: "What is a budget?",
        xp: 10,
        exercises: [
          {
            id: "money-1-1",
            type: "multiple-choice",
            prompt: "A budget is mainly a plan for…",
            options: [
              "Spending money you don't have",
              "How your income is split across spending and saving",
              "Avoiding money entirely",
              "Improving your credit score",
            ],
            correctIndex: 1,
            explanation:
              "A budget maps your income onto categories so every dollar has a job.",
          },
          {
            id: "money-1-2",
            type: "true-false",
            prompt: "The 50/30/20 rule puts 20% of income toward savings & debt.",
            answer: true,
            explanation: "50% needs, 30% wants, 20% savings & debt repayment.",
          },
        ],
      },
      {
        id: "money-2",
        title: "Needs vs. wants",
        xp: 10,
        exercises: [
          {
            id: "money-2-1",
            type: "multiple-choice",
            prompt: "Which of these is usually a 'need'?",
            options: [
              "A streaming subscription",
              "Rent",
              "A new phone every year",
              "Concert tickets",
            ],
            correctIndex: 1,
          },
        ],
      },
    ],
  },
  {
    id: "cooking",
    slug: "cooking",
    title: "Kitchen Confidence",
    description: "Feed yourself without setting off the smoke alarm.",
    color: "orange",
    emoji: "🍳",
    lessons: [
      {
        id: "cooking-1",
        title: "Pantry staples",
        xp: 10,
        exercises: [
          {
            id: "cooking-1-1",
            type: "multiple-choice",
            prompt: "Which oil has a high smoke point, good for frying?",
            options: [
              "Extra-virgin olive oil",
              "Butter",
              "Avocado oil",
              "Flaxseed oil",
            ],
            correctIndex: 2,
            explanation:
              "Avocado oil tolerates high heat; olive oil and butter burn sooner.",
          },
        ],
      },
    ],
  },
  {
    id: "adulting",
    slug: "adulting",
    title: "Adulting 101",
    description: "Appointments, emails, and grown-up paperwork.",
    color: "sky",
    emoji: "🧾",
    lessons: [
      {
        id: "adulting-1",
        title: "Writing a clear email",
        xp: 10,
        exercises: [
          {
            id: "adulting-1-1",
            type: "true-false",
            prompt: "A good subject line summarizes the email in a few words.",
            answer: true,
          },
        ],
      },
    ],
  },
];

export function getTrack(slug: string): Track | undefined {
  return TRACKS.find((track) => track.slug === slug);
}

export function getLesson(lessonId: string) {
  for (const track of TRACKS) {
    const lesson = track.lessons.find((l) => l.id === lessonId);
    if (lesson) return { track, lesson };
  }
  return undefined;
}
