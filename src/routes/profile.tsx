import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-store";
import { PageHero, Section, Eyebrow } from "@/components/Primitives";
import { bi, useLang } from "@/lib/i18n";
import { PlayCircle, Clock, Award, BookOpen, User, Check } from "lucide-react";
import heroImage from "@/assets/hero-breath.jpg";

export const Route = createFileRoute("/profile")({
  staticData: { sitemap: false },
  component: ProfilePage,
});

function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { t, lang } = useLang();
  const ta = lang === "ta";

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAvatar, setEditAvatar] = useState("");

  const handleEditInit = () => {
    if (user) {
      setEditName(user.full_name);
      setEditAvatar(user.avatar || "");
      setIsEditingProfile(true);
    }
  };

  const handleSaveProfile = () => {
    if (user) {
      const updatedUser = { ...user, full_name: editName, avatar: editAvatar };
      localStorage.setItem("the_kriya_lab_user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("kriya_auth_changed"));
      setIsEditingProfile(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate({ to: "/auth", search: { redirect: "/dashboard" }, replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3f3f9] p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  const firstName = user.full_name?.split(" ")[0] || "Seeker";

  return (
    <>
      <div className="pt-8" />


      
      <Section tone="muted" id="profile" className="scroll-mt-20">
        <div className="max-w-md mx-auto bg-background p-8 rounded-[2rem] shadow-sm border border-border relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-velvet/10 to-transparent pointer-events-none" />
           <h2 className="font-serif text-2xl mb-6 text-center relative z-10">{t(bi("Profile Settings", "பயனர் அமைப்புகள்"))}</h2>
           
           <div className="flex flex-col items-center relative z-10">
             <div className="relative mb-4">
               {isEditingProfile ? (
                 <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-dashed border-border relative group">
                   {editAvatar ? <img src={editAvatar} alt="Avatar Preview" className="w-full h-full object-cover" /> : <User className="w-8 h-8 text-muted-foreground" />}
                 </div>
               ) : (
                 <div className="w-24 h-24 rounded-full bg-gold/10 flex items-center justify-center overflow-hidden border-2 border-gold/30 text-gold shadow-inner">
                   {user.avatar ? <img src={user.avatar} alt={user.full_name} className="w-full h-full object-cover" /> : <User className="w-10 h-10" />}
                 </div>
               )}
             </div>

             {isEditingProfile ? (
               <div className="w-full space-y-4 mt-2">
                 <div>
                   <label className="block text-[0.65rem] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider pl-1">{t(bi("Full Name", "முழு பெயர்"))}</label>
                   <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full rounded-xl border border-border bg-background/50 px-4 py-2.5 text-sm focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all" />
                 </div>
                 <div>
                   <label className="block text-[0.65rem] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider pl-1">{t(bi("Avatar URL", "படம் URL"))}</label>
                   <input type="text" placeholder="https://example.com/avatar.jpg" value={editAvatar} onChange={e => setEditAvatar(e.target.value)} className="w-full rounded-xl border border-border bg-background/50 px-4 py-2.5 text-sm focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all" />
                 </div>
                 <div className="flex gap-3 pt-4">
                   <button onClick={() => setIsEditingProfile(false)} className="flex-1 rounded-full border border-border bg-background py-2.5 text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
                   <button onClick={handleSaveProfile} className="flex-1 rounded-full bg-gold text-velvet-deep py-2.5 text-sm font-medium hover:bg-gold/90 transition-colors flex items-center justify-center gap-2">
                     <Check className="w-4 h-4" /> Save
                   </button>
                 </div>
               </div>
             ) : (
               <div className="text-center w-full mt-2">
                 <h3 className="font-serif text-xl mb-1">{user.full_name}</h3>
                 <p className="text-sm text-muted-foreground mb-8 bg-muted/30 py-1.5 px-4 rounded-full inline-block">{user.email}</p>
                 <div className="flex justify-center gap-3 w-full">
                   <button onClick={handleEditInit} className="flex-1 rounded-full border border-border bg-background py-2.5 text-sm font-medium hover:bg-muted transition-colors">
                     {t(bi("Edit Profile", "மாற்றுக"))}
                   </button>
                   <button onClick={() => { logout(); navigate({to: '/'}); }} className="flex-1 rounded-full border border-red-200 bg-red-50/50 text-red-600 hover:bg-red-50 py-2.5 text-sm font-medium transition-colors">
                     {t(bi("Sign Out", "வெளியேறு"))}
                   </button>
                 </div>
               </div>
             )}
           </div>
        </div>
      </Section>
    </>
  );
}
