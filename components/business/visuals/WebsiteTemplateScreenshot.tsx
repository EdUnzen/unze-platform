import { ProductMockupFrame } from "@/components/business/visuals/ProductMockupFrame";
import { WebsitePreview } from "@/components/business/visuals/previews/WebsitePreview";
import type { WebsitePageId, WebsiteTemplateId } from "@/lib/constants/business-website-templates";

interface WebsiteTemplateScreenshotProps {
  industry: WebsiteTemplateId;
  page: WebsitePageId;
  label: string;
  className?: string;
}

/** Template-Vorschau — proportional im einheitlichen Mockup-Rahmen */
export function WebsiteTemplateScreenshot({
  industry,
  page,
  label,
  className = "",
}: WebsiteTemplateScreenshotProps) {
  return (
    <figure className={className} data-export={`website-screenshot-${industry}-${page}`}>
      <ProductMockupFrame device="laptop" label={label} presentation="standard" fillContainer>
        <WebsitePreview industry={industry} page={page} size="gallery" />
      </ProductMockupFrame>
    </figure>
  );
}
