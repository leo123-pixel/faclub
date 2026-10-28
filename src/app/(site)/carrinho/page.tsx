import { CartView } from "@/components/site/CartView";
import { loadCoupon, loadSettings } from "@/lib/data/public";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 60;

export const metadata = {
  ...pageMetadata({
    title: "Carrinho | FAC LUB",
    description: "Monte o pedido e envie pelo WhatsApp da FAC LUB.",
    image: "/brand/logo-faclub.png",
    path: "/carrinho",
  }),
  robots: { index: false },
};

export default async function CartPage() {
  const [settings, coupon] = await Promise.all([loadSettings(), loadCoupon()]);
  return (
    <main className="mx-auto w-full max-w-[1312px] px-4 pb-[120px] pt-16 max-md:pt-10">
      <h1 className="font-display text-[44px] font-semibold leading-none tracking-[-0.05em] text-ink sm:text-[60px]">Carrinho</h1>
      <CartView whatsapp={settings.whatsapp} coupon={coupon} />
    </main>
  );
}
