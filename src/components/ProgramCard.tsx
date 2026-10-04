import { Link } from "@tanstack/react-router";
import { type ProgramItem } from "@/lib/programs-api";

export function ProgramCard({ program: p, lang }: { program: ProgramItem; lang: "en" | "ta" }) {
  const ta = lang === "ta";
  const title = (ta ? p.title_ta : p.title_en) || p.title_en;

  return (
    <article className="rounded-2xl border border-border overflow-hidden bg-background shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">
      {p.image_url && (
        <div className="w-full h-48 sm:h-56 bg-gray-50 flex items-center justify-center overflow-hidden border-b border-border shrink-0">
          <img src={p.image_url} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        </div>
      )}
      <div className="p-5 sm:p-6 flex flex-col flex-1">
        <h2 className="font-serif text-[1.15rem] sm:text-xl leading-snug text-gray-900 group-hover:text-[#522938] transition-colors line-clamp-2">{title}</h2>
        
        <div className="mt-auto pt-6">
          <Link
            to="/programs/$id"
            params={{ id: String(p.id) }}
            className="inline-flex w-full items-center justify-center rounded-full bg-[#334d84] px-6 py-2 sm:py-2.5 text-[0.8rem] sm:text-sm font-semibold text-white hover:bg-[#253861] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
          >
            {ta ? "மேலும் காண்க" : "View Details"}
          </Link>
        </div>
      </div>
    </article>
  );
}
