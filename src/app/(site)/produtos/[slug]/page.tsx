import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/site/ProductCard";
import { ProductGallery } from "@/components/site/ProductGallery";
import { PurchaseBox } from "@/components/site/PurchaseBox";
import { TrackViewItem } from "@/components/site/TrackViewItem";
import { loadCoupon, loadProductBySlug, loadVisibleProducts } from "@/lib/data/public";
import { productTitle } from "@/lib/domain/admin-products";
import { couponStoreNote } from "@/lib/domain/home";
import { relatedProducts, specRows } from "@/lib/domain/product-page";
import { pageMetadata } from "@/lib/seo";
import { publicImageUrl } from "@/lib/storage";

export const revalidate = 60;

/** Pré-gera os produtos visíveis; um produto novo é gerado na primeira visita. */
export async function generateStaticParams() {
  const items = await loadVisibleProducts();
  return items.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: PageProps<"/produtos/[slug]">) {
  const { slug } = await params;
  const product = await loadProductBySlug(slug);
  if (!product) return { title: "Produto não encontrado | FAC LUB" };
  const title = productTitle(product.brandName, product.name);
  const variant = product.variants[0]?.label;
  return pageMetadata({
    title: `${title} | FAC LUB`,
    description:
      product.description ||
      `${title}${variant ? ` em ${variant.toLowerCase()}` : ""} a pronta entrega na FAC LUB. Peça pelo WhatsApp e retire ou faça a troca na loja.`,
    // sem foto, o logo da loja
    image: product.images[0] ? publicImageUrl(product.images[0]) : "/brand/logo-faclub.png",
    path: `/produtos/${product.slug}`,
  });
}

export default async function ProductPage({ params }: PageProps<"/produtos/[slug]">) {
  const { slug } = await params;
  const [product, items, coupon] = await Promise.all([loadProductBySlug(slug), loadVisibleProducts(), loadCoupon()]);
  if (!product) notFound();

  const title = productTitle(product.brandName, product.name);
  const related = relatedProducts(product, items);

  return (
    <main className="mx-auto w-full max-w-[1312px] px-4 pb-[100px] max-md:pb-16">
      <TrackViewItem product={product} />
      <nav aria-label="Trilha" className="pt-[26px] text-[14px]">
        <ol className="flex flex-wrap gap-1.5 text-muted">
          <li>
            <Link href="/" className="hover:text-ink">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/produtos" className="hover:text-ink">
              Produtos
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-ink">
            {title}
          </li>
        </ol>
      </nav>

      <div className="mt-5 grid gap-10 lg:grid-cols-[minmax(0,686px)_minmax(0,1fr)] lg:gap-12">
        <ProductGallery images={product.images} alt={title} promo={product.isPromo} />

        <div className="pt-1">
          <p className="text-[14px] text-muted">
            {product.brandName} · {product.categoryName}
          </p>
          <h1 className="mt-2 font-display text-[40px] font-semibold leading-[1.05] tracking-[-0.045em] text-ink sm:text-[56px]">
            {product.name}
          </h1>
          {product.description && <p className="mt-4 text-[17px] leading-relaxed text-muted">{product.description}</p>}

          <PurchaseBox
            product={{ id: product.id, slug: product.slug, title }}
            variants={product.variants}
            isPromo={product.isPromo}
          />

          {coupon && (
            <p className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-[16px] bg-gold-soft/60 px-[18px] py-[14px]">
              <span className="font-display text-[18px] font-semibold tracking-tight text-gold-ink">{coupon.code}</span>
              <span className="text-[14px] text-ink">{couponStoreNote(coupon)}</span>
            </p>
          )}

          <dl aria-label="Ficha técnica" className="mt-6 border-b border-line-soft">
            {specRows(product).map((row) => (
              <div key={row.label} className="flex min-h-12 items-center justify-between gap-4 border-t border-line-soft py-3">
                <dt className="text-[15px] text-muted">{row.label}</dt>
                <dd className="text-right text-[15px] font-medium text-ink">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="combine-titulo" className="pt-[100px] max-md:pt-16">
          <h2
            id="combine-titulo"
            className="text-center font-display text-[36px] font-semibold tracking-[-0.045em] text-ink sm:text-[52px]"
          >
            Combine com
          </h2>
          <ul aria-label="Combine com" className="mt-[18px] grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
            {related.map((item) => (
              <li key={item.id}>
                <ProductCard item={item} layout="related" />
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
