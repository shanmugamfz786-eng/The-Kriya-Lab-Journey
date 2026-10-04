import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Section } from "@/components/Primitives";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { bi, useLang, type Bi } from "@/lib/i18n";
import { programMessage } from "@/lib/whatsapp";
import { Search, IndianRupee, DollarSign } from "lucide-react";
import { listPublicPrograms } from "@/lib/programs.functions";
import { type ProgramItem } from "@/lib/programs-api";

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
  const [searchTerm, setSearchTerm] = useState("");

  const fetchPrograms = useServerFn(listPublicPrograms);
  const { data } = useQuery({
    queryKey: ["programs"],
    queryFn: () => fetchPrograms() as Promise<ProgramItem[]>,
  });

  const rows = data ?? [];

  const searchedRows = rows.filter((p) => {
    const titleEn = p.title_en?.toLowerCase() || "";
    const titleTa = p.title_ta?.toLowerCase() || "";
    const locEn = p.location_en?.toLowerCase() || "";
    const locTa = p.location_ta?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();

    return (
      titleEn.includes(search) ||
      titleTa.includes(search) ||
      locEn.includes(search) ||
      locTa.includes(search)
    );
  });

  const filteredRows = searchedRows.filter((p) => {
    if (filter === "all") return true;
    return p.program_type === filter;
  });

  return (
    <>      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-4">
        
        <div className="flex w-full flex-col gap-5">
          <div className="relative w-full max-w-[320px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
            <input
              type="text"
              placeholder={t(bi("Search programs...", "பயிற்சிகளை தேடுக..."))}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-full border border-border bg-background py-2.5 pl-12 pr-6 text-sm text-foreground shadow-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold transition-all"
            />
          </div>

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

function ProgramCard({ program: p, lang }: { program: ProgramItem; lang: "en" | "ta" }) {
  const { t } = useLang();
  const [currency, setCurrency] = useState<"INR" | "USD">("INR");
  const ta = lang === "ta";
  const title = (ta ? p.title_ta : p.title_en) || p.title_en;
  const description = (ta ? p.description_ta : p.description_en) || p.description_en;
  const instructor = (ta ? p.instructor_ta : p.instructor_en) || p.instructor_en;
  const location = (ta ? p.location_ta : p.location_en) || p.location_en;
  const language = (ta ? p.language_ta : p.language_en) || p.language_en;

  return (
    <article className="rounded-2xl border border-border overflow-hidden bg-background shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">
      {p.image_url && (
        <div className="w-full h-48 sm:h-56 bg-gray-50 flex items-center justify-center overflow-hidden border-b border-border">
          <img src={p.image_url} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        </div>
      )}
      <div className="p-6 flex flex-col flex-1">
        <h2 className="font-serif text-2xl leading-snug text-gray-900 group-hover:text-[#522938] transition-colors line-clamp-2">{title}</h2>
        
        <div className="mt-auto pt-6">
          <Link
            to="/programs/$id"
            params={{ id: String(p.id) }}
            className="inline-flex w-full items-center justify-center rounded-full bg-[#334d84] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#253861] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
          >
            {ta ? "மேலும் காண்க" : "View Details"}
          </Link>
        </div>
      </div>
    </article>
  );

}
