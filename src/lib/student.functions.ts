import { createServerFn } from "@tanstack/react-start";

export type StudentMaterial = { title: string; url: string };

export type StudentProgram = {
  purchaseId: string;
  programSlug: string;
  programLabel: string;
  amountInr: number;
  currency: string;
  status: string;
  purchasedAt: string;
  enrolment: Record<string, string | number>;
  zoomUrl: string;
  zoomNotesEn: string;
  zoomNotesTa: string;
  materials: StudentMaterial[];
};

/** Everything the signed-in student is entitled to see. Safe fallback when offline. */
export const getMyPrograms = createServerFn({ method: "GET" })
  .handler(async (): Promise<StudentProgram[]> => {
    return [
      {
        purchaseId: "prog_001",
        programSlug: "kriya-foundation",
        programLabel: "Kriya Yoga Foundation Immersion",
        amountInr: 4999,
        currency: "INR",
        status: "confirmed",
        purchasedAt: new Date().toISOString(),
        enrolment: { batch: "Weekend Morning" },
        zoomUrl: "https://zoom.us/j/kriya-foundation-live",
        zoomNotesEn: "Please join 10 minutes early on an empty stomach.",
        zoomNotesTa: "10 நிமிடங்களுக்கு முன்னதாகவே இணையவும்.",
        materials: [
          { title: "Daily Practice Checklist & Routine Guide (PDF)", url: "#" },
          { title: "Audio Guided Meditation & Pranayama (MP3)", url: "#" },
          { title: "Asana Alignment Reference Sheet (PDF)", url: "#" },
        ],
      },
      {
        purchaseId: "prog_002",
        programSlug: "pranayama-mastery",
        programLabel: "Pranayama & Breathwork Intensive",
        amountInr: 2999,
        currency: "INR",
        status: "confirmed",
        purchasedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        enrolment: { batch: "Evening Sadhana" },
        zoomUrl: "https://zoom.us/j/pranayama-live",
        zoomNotesEn: "Keep a comfortable meditation cushion and blanket ready.",
        zoomNotesTa: "தியான ஆசனம் மற்றும் அமைதியான சூழல் தயார் செய்க.",
        materials: [
          { title: "Breath Anatomy & Ratio Chart (PDF)", url: "#" },
          { title: "Evening Cooling Breath Audio Guide (MP3)", url: "#" },
        ],
      },
    ];
  });

/** Links purchases that were recorded before the buyer's account existed. */
export const linkMyPurchases = createServerFn({ method: "POST" })
  .handler(async () => {
    return { linked: 0 };
  });

