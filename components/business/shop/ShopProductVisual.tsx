import { ShopBrowserChrome } from "@/components/business/shop/ShopBrowserChrome";

import { ShopTbcScreenshot } from "@/components/business/shop/ShopTbcScreenshot";

import { BusinessPhoto } from "@/components/business/visuals/BusinessPhoto";

import { MockScreen } from "@/components/business/visuals/MockScreen";

import {

  getShopProductDisplayMode,

  getShopProductSymbol,

} from "@/lib/constants/business-shop-product-icons";

import { getShopProductImage } from "@/lib/constants/business-shop-product-images";

import {

  getTbcTemplateForProduct,

  TBC_TEMPLATES,

} from "@/lib/constants/business-core-template-screenshots";

import { ShopConnectAppGallery } from "@/components/business/shop/ShopConnectAppGallery";
import { isWebAppTemplateProduct } from "@/lib/constants/business-shop-template-previews";

import type { ShopProduct } from "@/lib/constants/business-shop-catalog";

import { cn } from "@/lib/utils/cn";



type ShopProductVisualProps = {

  product: ShopProduct;

  variant?: "card" | "detail" | "compact" | "hero" | "icon-header";

  className?: string;

};



const variantClass = {

  card: "aspect-[16/10] w-full",

  hero: "aspect-[16/9] w-full min-h-[240px]",

  detail: "aspect-[16/10] w-full min-h-[160px]",

  compact: "h-14 w-14",

  "icon-header": "h-12 w-12",

} as const;



export function ShopProductVisual({

  product,

  variant = "card",

  className,

}: ShopProductVisualProps) {

  const mode = getShopProductDisplayMode(product);



  if (mode === "template-preview") {

    if (isWebAppTemplateProduct(product.slug)) {
      if (variant === "compact" || variant === "icon-header") {
        return (
          <div className={cn("overflow-hidden bg-gray-100", variantClass[variant], className)}>
            <MockScreen variant="webapp" industry="handwerk" compact />
          </div>
        );
      }

      return (
        <div className={cn("overflow-hidden rounded-xl border border-gray-200 bg-white p-3", className)}>
          <ShopConnectAppGallery variant={variant === "card" ? "card" : "detail"} />
        </div>
      );
    }



    const templateId = getTbcTemplateForProduct(product.slug);

    const template = TBC_TEMPLATES[templateId];

    const screenshotVariant = variant === "hero" ? "hero" : "card";



    const screenshot = (

      <ShopTbcScreenshot templateId={templateId} page="home" variant={screenshotVariant} />

    );



    if (variant === "compact" || variant === "icon-header") {

      return screenshot;

    }



    return (

      <ShopBrowserChrome

        url={`${template.company.split(" ")[0].toLowerCase().replace(/[^a-z]/g, "")}.de`}

        className={className}

      >

        {screenshot}

      </ShopBrowserChrome>

    );

  }



  if (mode === "icon") {

    const Icon = getShopProductSymbol(product);

    const isHeader = variant === "icon-header";

    const iconBox = isHeader ? "h-12 w-12" : variant === "detail" ? "h-14 w-14" : "h-12 w-12";

    const iconSize = isHeader ? "h-6 w-6" : variant === "detail" ? "h-7 w-7" : "h-6 w-6";



    return (

      <div

        className={cn(

          "flex items-center justify-center",

          isHeader ? variantClass["icon-header"] : "min-h-[120px] w-full bg-gradient-to-b from-gray-50 to-white",

          className,

        )}

        aria-hidden

      >

        <div

          className={cn(

            "flex items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-gray-200/90",

            iconBox,

          )}

        >

          <Icon className={cn(iconSize, "text-slate-700")} strokeWidth={1.75} />

        </div>

      </div>

    );

  }



  const image = getShopProductImage(product);

  return (

    <div className={cn("relative overflow-hidden bg-gray-100", variantClass[variant], className)}>

      <BusinessPhoto src={image.src} alt={image.alt} fill sizes="400px" imageClassName="object-cover" />

    </div>

  );

}

