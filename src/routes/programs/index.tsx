import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Section, PageHero } from "@/components/Primitives";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { bi, useLang, type Bi } from "@/lib/i18n";
import { programMessage } from "@/lib/whatsapp";
import { Search, IndianRupee, DollarSign } from "lucide-react";
import { fetchAllPrograms, type ProgramItem } from "@/lib/programs-api";
import { listPublicPrograms } from "@/lib/programs.functions";
import { ProgramCard } from "@/components/ProgramCard";

export const Route = createFileRoute("/programs/")({
  staticData: { sitemap: true },
  loader: async () => {
    return await listPublicPrograms();
  },
  head: () => ({
    meta: [
      { title: "Programs | THE KRIYA LAB" },
      {
        name: "description",
        content:
          "Online and offline Kriya Yoga initiation programs in English and Tamil.",
      },
      { property: "og:title", content: "Programs — THE KRIYA LAB" },
    ],
  }),
  component: ProgramsPage,
});

const filters = [
  { key: "all", label: bi("All Programs", "அனைத்து பயிற்சிகள்") },
  { key: "online", label: bi("Online", "ஆன்லைன்") },
  { key: "offline", label: bi("Offline", "நேரடி (ஆஃப்லைன்)") },
] as const;

function ProgramsPage() {
  const { t, lang } = useLang();
  const initialData = Route.useLoaderData();
  const [filter, setFilter] = useState<(typeof filters)[number]["key"]>("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data } = useQuery({
    queryKey: ["programs"],
    queryFn: () => fetchAllPrograms(),
    initialData,
  });

  const rows = data ?? [];

  const filteredRows = rows.filter((p) => {
    if (filter !== "all" && p.program_type !== filter) return false;
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const ta = lang === "ta";
      const title = ta ? p.title_ta : p.title_en;
      const instructor = ta ? p.instructor_ta : p.instructor_en;
      
      if (!title?.toLowerCase().includes(q) && !instructor?.toLowerCase().includes(q)) {
        return false;
      }
    }
    
    return true;
  });

  return (
    <>
      <PageHero
        eyebrow={t(bi("Initiations & Trainings", "தீட்சை மற்றும் பயிற்சிகள்"))}
        title={t(bi("Programs", "பயிற்சிகள்"))}
        intro={t(
          bi(
            "Discover our comprehensive Kriya Yoga programs available online and offline.",
            "ஆன்லைன் மற்றும் நேரடி கிரியா யோகா பயிற்சிகளை இங்கே கண்டறியவும்."
          )
        )}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2 mb-4">
        <div className="flex flex-col sm:flex-row w-full gap-5 justify-between items-start sm:items-center">
          {/* Category Filters Bottom */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 sm:pb-0 scrollbar-none w-full sm:w-auto">
            {filters.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                aria-pressed={filter === f.key}
                className={`rounded-full border px-6 py-2 text-sm font-medium transition-all ${
                  filter === f.key
                    ? "border-gold bg-gold text-velvet-deep shadow-md scale-105"
                    : "border-border text-muted-foreground hover:border-gold hover:text-gold hover:bg-gold/5"
                }`}
              >
                {t(f.label)}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t(bi("Search programs or instructors...", "பயிற்சிகள் அல்லது ஆசிரியரை தேடவும்..."))}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-border bg-background py-2.5 pl-10 pr-4 text-sm focus:border-gold focus:outline-hidden focus:ring-1 focus:ring-gold"
            />
          </div>
        </div>
      </div>

      <Section>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRows.length > 0 ? (
            filteredRows.map((p) => <ProgramCard key={p.id} program={p} lang={lang} />)
          ) : (
            <p className="text-sm text-muted-foreground text-center col-span-full">
              {t(bi("No programs found.", "பயிற்சிகள் ஏதுமில்லை."))}
            </p>
          )}
        </div>
      </Section>
    </>
  );
}
