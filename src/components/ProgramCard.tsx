import { Link } from "@tanstack/react-router";
import { type ProgramItem } from "@/lib/programs-api";
import { useAuth } from "@/lib/auth-store";
import { useEnrollments } from "@/lib/enrollment-store";

export function ProgramCard({ program: p, lang }: { program: ProgramItem; lang: "en" | "ta" }) {
  const ta = lang === "ta";
  const title = (ta ? p.title_ta : p.title_en) || p.title_en;
  
  const { user } = useAuth();
  const { enrolledIds } = useEnrollments(user?.id);
  const isEnrolled = enrolledIds.includes(p.id);

  return (
    <article className="rounded-2xl border border-border overflow-hidden bg-background shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">
      {p.image_url && (
        <div className="w-full h-48 sm:h-56 bg-gray-50 flex items-center justify-center overflow-hidden border-b border-border shrink-0 relative">
          <img src={p.image_url} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          
          {isEnrolled && (
            <div className="absolute top-3 right-3 bg-green-50 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full border border-green-200 shadow-sm flex items-center gap-1.5 z-10 backdrop-blur-md">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
              {ta ? "சேர்க்கப்பட்டது" : "Collected"}
            </div>
          )}
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
