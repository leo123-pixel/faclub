import { SiteHeader } from "@/components/site/SiteHeader";
import { loadSettings } from "@/lib/data/public";
import { scheduleLink } from "@/lib/domain/site-settings";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const settings = await loadSettings();
  return (
    <>
      <SiteHeader scheduleHref={scheduleLink(settings)} />
      <div className="flex flex-1 flex-col">{children}</div>
    </>
  );
}
