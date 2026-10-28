import type { Metadata } from "next";
import { HomeBrands } from "@/components/site/home/HomeBrands";
import { HomeCoupon } from "@/components/site/home/HomeCoupon";
import { HomeFeatured } from "@/components/site/home/HomeFeatured";
import { HomeHero } from "@/components/site/home/HomeHero";
import { HomeServices } from "@/components/site/home/HomeServices";
import { HomeWhy } from "@/components/site/home/HomeWhy";
import { loadHomeData, loadSettings } from "@/lib/data/public";
import { featuredProducts, splitAddress } from "@/lib/domain/home";
import { budgetLink, scheduleLink } from "@/lib/domain/site-settings";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "FAC LUB | Troca de óleo e filtros no Parque Novo Mundo",
  description: "Troca de óleo e filtros com as principais marcas. Agende pelo WhatsApp e retire ou faça a troca na loja.",
};

export default async function Home() {
  const [settings, { hero, brands, coupon, items }] = await Promise.all([loadSettings(), loadHomeData()]);
  const address = splitAddress(settings.address);
  return (
    <main className="flex flex-col">
      <HomeHero
        hero={hero}
        coupon={coupon}
        settings={settings}
        scheduleHref={scheduleLink(settings)}
        street={address.shortStreet}
      />
      <HomeBrands brands={brands} />
      <HomeServices budgetHref={budgetLink(settings)} />
      <HomeWhy />
      <HomeFeatured items={featuredProducts(items)} />
      <HomeCoupon coupon={coupon} groupLink={settings.groupLink} />
    </main>
  );
}
