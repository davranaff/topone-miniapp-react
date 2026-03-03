import { CreditCard, CheckCircle2, ChevronRight } from "lucide-react";
import { MobileScreen, MobileScreenSection } from "@/shared/ui/mobile-screen";
import { PageHeader } from "@/shared/ui/page-header";
import { GlassCard } from "@/shared/ui/glass-card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";

type Plan = { id: string; title: string; price: string; duration: string; perks: string[] };

const PLANS: Plan[] = [
  {
    id: "monthly",
    title: "1 oy",
    price: "99 000",
    duration: "so'm / oy",
    perks: ["Barcha kurslar", "Challenjlar", "Mini ilovalar"],
  },
  {
    id: "6months",
    title: "6 oy",
    price: "490 000",
    duration: "so'm / 6 oy",
    perks: ["Barcha kurslar", "Challenjlar", "Mini ilovalar", "20% chegirma"],
  },
  {
    id: "annual",
    title: "12 oy",
    price: "890 000",
    duration: "so'm / yil",
    perks: ["Barcha kurslar", "Challenjlar", "Mini ilovalar", "40% chegirma", "Premium badge"],
  },
];

const PlanCard = ({ plan, recommended }: { plan: Plan; recommended?: boolean }) => (
  <GlassCard goldBorder={recommended}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-base font-bold text-t-primary">{plan.title}</p>
        <p className="mt-1">
          <span className="text-xl font-bold text-gold">{plan.price}</span>{" "}
          <span className="text-xs text-t-muted">{plan.duration}</span>
        </p>
      </div>
      {recommended && <Badge variant="gold" size="sm">Tavsiya</Badge>}
    </div>

    <ul className="mt-3 space-y-1.5">
      {plan.perks.map((perk) => (
        <li key={perk} className="flex items-center gap-2 text-xs text-t-secondary">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-gold" />
          {perk}
        </li>
      ))}
    </ul>

    <Button fullWidth variant={recommended ? "primary" : "outline"} className="mt-4">
      <CreditCard className="h-4 w-4" />
      To'lash
    </Button>
  </GlassCard>
);

export const SubscriptionPage = () => (
  <MobileScreen>
    <PageHeader title="Obuna" subtitle="Premium imkoniyatlarga ega bo'ling" backButton />

    <MobileScreenSection className="mt-4">
      {PLANS.map((plan, i) => (
        <PlanCard key={plan.id} plan={plan} recommended={i === 1} />
      ))}
    </MobileScreenSection>
  </MobileScreen>
);
