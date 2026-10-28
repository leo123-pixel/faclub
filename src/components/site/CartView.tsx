"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { Coupon } from "@/lib/domain/home";
import { formatBRL } from "@/lib/domain/money";
import { applyQuote, ORDER_MESSAGES, orderMessage, orderWhatsappLink, validateOrderInput, type CartQuote } from "@/lib/domain/order";
import { useCart } from "./CartProvider";
import { IconMinus, IconPlus } from "./icons";

export const PRICE_NOTICE = "Preço e disponibilidade são confirmados no atendimento pelo WhatsApp.";
export const EMPTY_CART_TEXT = "Seu carrinho está vazio.";

const EMPTY_QUOTE: CartQuote = { items: [], unavailable: [], total: 0 };
const noop = () => () => {};

/** `/carrinho` (CART-01 AC 5, 6, 9 e 11; CART-04 AC 1 e 13). */
type OrderResponse = { number: number; items: CartQuote["items"]; total: number; unavailable: unknown[]; coupon: string | null };
type Sent = { url: string; unavailable: number };

export function CartView({ whatsapp, coupon }: { whatsapp: string; coupon: Coupon | null }) {
  const { cart, setQty, remove, clear } = useCart();
  // o HTML pré-gerado não conhece o carrinho; espera o navegador para não piscar "vazio"
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const [quote, setQuote] = useState<CartQuote>(EMPTY_QUOTE);
  const [quoteFailed, setQuoteFailed] = useState(false);
  const [withCoupon, setWithCoupon] = useState(false);
  const [name, setName] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState<Sent | null>(null);
  // dois cliques seguidos gravam um pedido só (spec, Edge Cases)
  const busy = useRef(false);

  // nova cotação quando entra ou sai uma linha; mudar quantidade usa a última (applyQuote)
  const linesKey = cart.lines.map((l) => `${l.productId}|${l.label}`).join(",");
  useEffect(() => {
    if (!linesKey) return;
    let alive = true;
    fetch("/api/carrinho", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ lines: cart.lines }),
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((q: CartQuote) => {
        if (!alive) return;
        setQuote(q);
        setQuoteFailed(false);
      })
      .catch(() => alive && setQuoteFailed(true));
    return () => {
      alive = false;
    };
    // a cotação depende só de quais linhas existem
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linesKey]);

  const view = useMemo(() => applyQuote(cart.lines, quote), [cart.lines, quote]);

  if (!hydrated) return <div className="min-h-[320px]" aria-busy="true" />;

  if (sent) {
    return (
      <div className="py-20 text-center" role="status">
        <p className="font-display text-[28px] font-semibold tracking-tight text-ink">{ORDER_MESSAGES.sent}</p>
        <a
          href={sent.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex h-12 items-center rounded-full bg-ink px-7 text-[15px] font-semibold text-white hover:bg-navy-2"
        >
          Abrir o WhatsApp de novo
        </a>
      </div>
    );
  }

  if (cart.lines.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-[18px] text-ink">{EMPTY_CART_TEXT}</p>
        <Link
          href="/produtos"
          className="mt-6 inline-flex h-12 items-center rounded-full bg-ink px-7 text-[15px] font-semibold text-white hover:bg-navy-2"
        >
          Ver produtos
        </Link>
      </div>
    );
  }

  async function send() {
    if (busy.current) return;
    setError("");
    const body = {
      lines: cart.lines.map((l) => ({ productId: l.productId, label: l.label, qty: l.qty })),
      name,
      vehicle,
      coupon: withCoupon,
      sourceUrl: window.location.href,
    };
    const checked = validateOrderInput(body);
    if (!checked.ok) {
      setError(checked.message);
      return;
    }
    // a aba abre no clique; o endereço chega depois da gravação (bloqueador de pop-up)
    busy.current = true;
    const tab = window.open("about:blank", "_blank");
    setSending(true);
    try {
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) {
        tab?.close();
        setError(json.error ?? ORDER_MESSAGES.invalid);
        return;
      }
      const order = json as OrderResponse;
      const message = orderMessage({ number: order.number, items: order.items, total: order.total, name, vehicle, coupon: order.coupon });
      const url = orderWhatsappLink(whatsapp, message);
      if (tab) tab.location.href = url;
      else window.location.href = url;
      clear();
      setSent({ url, unavailable: order.unavailable.length });
    } finally {
      busy.current = false;
      setSending(false);
    }
  }

  const priced = new Map(view.items.map((i) => [`${i.productId}|${i.label}`, i]));
  const unavailable = new Set(view.unavailable.map((l) => `${l.productId}|${l.label}`));

  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
      <ul aria-label="Itens do carrinho" className="divide-y divide-line-soft border-y border-line-soft">
        {cart.lines.map((l) => {
          const k = `${l.productId}|${l.label}`;
          const item = priced.get(k);
          const gone = unavailable.has(k);
          return (
            <li key={k} aria-label={`${l.title} · ${l.label}`} className="flex flex-wrap items-center gap-x-6 gap-y-3 py-5">
              <div className="min-w-0 flex-1 basis-[240px]">
                <Link href={`/produtos/${l.slug}`} className="font-display text-[18px] font-semibold tracking-tight text-ink hover:underline">
                  {item?.title ?? l.title}
                </Link>
                <p className="text-[14px] text-muted">{l.label}</p>
                {gone ? (
                  <p className="mt-1 inline-block rounded-full bg-low px-3 py-0.5 text-[13px] font-semibold text-low-ink">Indisponível</p>
                ) : item ? (
                  <p className="mt-1 text-[14px] text-ink">
                    {formatBRL(item.price)} cada
                    {item.regular !== null && (
                      <s className="ml-2 text-muted">
                        <span className="sr-only">de </span>
                        {formatBRL(item.regular)}
                      </s>
                    )}
                  </p>
                ) : (
                  <p className="mt-1 text-[14px] text-muted">{quoteFailed ? "Preço confirmado no envio" : "Atualizando o preço…"}</p>
                )}
              </div>
              <div className="flex h-11 items-center rounded-full border border-line-soft px-1">
                <button
                  type="button"
                  aria-label={`Diminuir quantidade de ${l.title}`}
                  disabled={l.qty <= 1}
                  onClick={() => setQty(l.productId, l.label, l.qty - 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-ink hover:bg-bg disabled:text-line"
                >
                  <IconMinus />
                </button>
                <output aria-label={`Quantidade de ${l.title}`} className="w-8 text-center text-[15px] font-semibold text-ink">
                  {l.qty}
                </output>
                <button
                  type="button"
                  aria-label={`Aumentar quantidade de ${l.title}`}
                  disabled={l.qty >= 99}
                  onClick={() => setQty(l.productId, l.label, l.qty + 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-ink hover:bg-bg disabled:text-line"
                >
                  <IconPlus />
                </button>
              </div>
              <p aria-label={`Subtotal de ${l.title}`} className="w-28 text-right text-[16px] font-semibold text-ink">
                {item ? formatBRL(item.subtotal) : "—"}
              </p>
              <button
                type="button"
                onClick={() => remove(l.productId, l.label)}
                className="h-11 rounded-full px-3 text-[14px] font-medium text-muted underline underline-offset-2 hover:text-ink"
                aria-label={`Remover ${l.title} · ${l.label}`}
              >
                Remover
              </button>
            </li>
          );
        })}
      </ul>

      <aside aria-label="Resumo do pedido" className="rounded-[24px] bg-bg p-6">
        <div className="flex items-baseline justify-between">
          <p className="text-[15px] text-muted">Total estimado</p>
          <p data-testid="total-estimado" className="font-display text-[28px] font-semibold tracking-tight text-ink">
            {formatBRL(view.total)}
          </p>
        </div>
        <p className="mt-3 text-[14px] leading-relaxed text-muted">{PRICE_NOTICE}</p>
        {quoteFailed && <p className="mt-2 text-[14px] text-low-ink">Não foi possível atualizar os preços.</p>}
        {coupon && (
          <label className="mt-5 flex items-start gap-3 text-[15px] text-ink">
            <input
              type="checkbox"
              checked={withCoupon}
              onChange={(e) => setWithCoupon(e.target.checked)}
              className="mt-1 h-5 w-5 accent-ink"
            />
            Quero fazer a troca na loja com o cupom {coupon.code}
          </label>
        )}
        <div className="mt-5 space-y-3">
          <label className="block">
            <span className="text-[14px] font-semibold text-ink">Nome (opcional)</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              className="mt-1 h-12 w-full rounded-xl border border-line bg-white px-4 text-[15px] text-ink outline-none focus:border-ink"
            />
          </label>
          <label className="block">
            <span className="text-[14px] font-semibold text-ink">Veículo (opcional)</span>
            <input
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
              placeholder="Placa ou modelo"
              className="mt-1 h-12 w-full rounded-xl border border-line bg-white px-4 text-[15px] text-ink outline-none placeholder:text-muted focus:border-ink"
            />
          </label>
        </div>
        {error && (
          <p role="alert" className="mt-4 text-[14px] font-medium text-low-ink">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={send}
          disabled={sending || view.items.length + view.pending.length === 0}
          className="mt-5 h-[54px] w-full rounded-full bg-ink px-6 text-[16px] font-semibold text-white hover:bg-navy-2 disabled:opacity-60"
        >
          {sending ? "Enviando…" : "Enviar pedido pelo WhatsApp"}
        </button>
      </aside>
    </div>
  );
}
