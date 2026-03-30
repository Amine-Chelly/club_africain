import { CartView } from "@/components/shop/cart-view";
import { getTranslations } from "next-intl/server";

export default async function CartPage() {
  const tShop = await getTranslations("shop");
  const tNav = await getTranslations("nav");

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-foreground text-3xl font-bold">
        {tShop("title")} — {tNav("cart")}
      </h1>
      <CartView checkoutLabel={tShop("checkout")} />
    </div>
  );
}
