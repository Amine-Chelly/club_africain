import { getTranslations } from "next-intl/server";
import { createSubscriptionAction } from "@/lib/subscription-actions";
import { SubscriptionType } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
};

export default async function SubscriptionsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const t = await getTranslations("subscriptions");
  const tShop = await getTranslations("shop");
  const sp = await searchParams;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-foreground text-3xl font-bold tracking-tight">{t("title")}</h1>
      <p className="text-muted mt-3 leading-relaxed">{t("intro")}</p>

      {sp.success && (
        <div className="mt-6 rounded-md bg-green-500/10 p-4 text-green-600 border border-green-500/20">
          {t("success")}
        </div>
      )}

      {sp.error && (
        <div className="mt-6 rounded-md bg-destructive/10 p-4 text-destructive border border-destructive/20">
          Invalid input. Please try again.
        </div>
      )}

      <form action={createSubscriptionAction} className="mt-8 space-y-6 bg-card p-6 rounded-xl border border-border">
        <input type="hidden" name="locale" value={locale} />
        
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-foreground">
            {t("fullName")}
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            className="mt-2 block w-full rounded-md border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
           <label htmlFor="birthDate" className="block text-sm font-medium text-foreground">
            {t("birthDate")}
          </label>
          <input
            id="birthDate"
            name="birthDate"
            type="date"
            required
            className="mt-2 block w-full rounded-md border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label htmlFor="seatType" className="block text-sm font-medium text-foreground mb-3">
            {t("seatType")}
          </label>
          <div className="space-y-3">
            {[
              { val: SubscriptionType.VIRAGE, labelKey: "virage", price: 150 },
              { val: SubscriptionType.PELOUSE, labelKey: "pelouse", price: 220 },
              { val: SubscriptionType.ENCEINTE_SUP, labelKey: "enceinteSup", price: 400 },
              { val: SubscriptionType.ENCEINTE_INF, labelKey: "enceinteInf", price: 500 },
              { val: SubscriptionType.TRIBUNE, labelKey: "tribune", price: 1000 },
            ].map((st) => (
              <label key={st.val} className="flex items-center gap-3 p-3 border border-border rounded-lg bg-background hover:bg-muted/30 cursor-pointer transition-colors">
                <input type="radio" name="seatType" value={st.val} required className="h-4 w-4 text-primary focus:ring-primary" />
                <div className="flex-1 flex justify-between">
                  <span className="font-medium text-foreground">{t(st.labelKey as "virage" | "pelouse" | "enceinteSup" | "enceinteInf" | "tribune")}</span>
                  <span className="text-primary font-semibold">{t("price", { price: st.price })}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="paymentType" className="block text-sm font-medium text-foreground mb-3">
            {tShop("paymentTypeLabel")}
          </label>
          <select
            id="paymentType"
            name="paymentType"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="CASH">{tShop("cashPayment")}</option>
            <option value="CARD">{tShop("cardPayment")}</option>
            <option value="BANK_TRANSFER">{tShop("bankTransferPayment")}</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {t("submit")}
        </button>
      </form>
    </div>
  );
}
