import { CookieBanner } from "@/components/site/CookieBanner";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { loadSettings } from "@/lib/data/public";
import { splitAddress } from "@/lib/domain/home";
import { scheduleLink } from "@/lib/domain/site-settings";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const settings = await loadSettings();
  return (
    <>
      <SiteHeader scheduleHref={scheduleLink(settings)} />
      <div className="flex flex-1 flex-col">{children}</div>
      <SiteFooter instagram={settings.instagram} area={splitAddress(settings.address).area} />
      <CookieBanner />
    </>
  );
}
