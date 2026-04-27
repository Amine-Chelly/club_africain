import { getTranslations } from "next-intl/server";

type Props = { searchParams: Promise<{ orderId?: string }> };

export default async function CheckoutPage({ searchParams }: Props) {
  const { orderId } = await searchParams;
  const t = await getTranslations("shop");

  return (
    <div className="mx-auto w-full max-w-lg flex-1 px-4 py-16 text-center sm:px-6">
      <h1 className="text-foreground text-2xl font-bold">{t("checkout")}</h1>
      {orderId ? (
        <p className="text-muted mt-4">
          {t("orderPlaced")} <span className="text-foreground font-mono">{orderId}</span>
        </p>
      ) : (
        <p className="text-muted mt-4">{t("noOrder")}</p>
      )}
    </div>
  );
}
