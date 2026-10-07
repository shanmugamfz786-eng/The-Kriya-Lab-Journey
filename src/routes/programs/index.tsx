import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Section } from "@/components/Primitives";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { bi, useLang, type Bi } from "@/lib/i18n";
import { programMessage } from "@/lib/whatsapp";
import { Search, IndianRupee, DollarSign } from "lucide-react";
import { fetchAllPrograms, type ProgramItem } from "@/lib/programs-api";
import { ProgramCard } from "@/components/ProgramCard";

export const Route = createFileRoute("/programs/")({
  staticData: { sitemap: true },
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
  const [filter, setFilter] = useState<(typeof filters)[number]["key"]>("all");
  const { data } = useQuery({
    queryKey: ["programs"],
    queryFn: () => fetchAllPrograms(),
  });

  const rows = data ?? [];

  const filteredRows = rows.filter((p) => {
    if (filter === "all") return true;
    return p.program_type === filter;
  });

  return (
    <>      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-4">
        
        <div className="flex w-full flex-col gap-5">
          {/* Category Filters Bottom */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
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
