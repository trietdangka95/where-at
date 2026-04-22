type OpenFoodFactsLookup = {
  name?: string;
  imageUrl?: string;
  brand?: string;
};

const OPEN_FOOD_FACTS_BASE_URL = "https://world.openfoodfacts.org/api/v2/product";
const LOOKUP_TIMEOUT_MS = 7000;

export const lookupBarcodeProduct = async (barcode: string): Promise<OpenFoodFactsLookup | null> => {
  const safeBarcode = barcode.trim();
  if (!safeBarcode) return null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), LOOKUP_TIMEOUT_MS);

  try {
    const response = await fetch(`${OPEN_FOOD_FACTS_BASE_URL}/${safeBarcode}.json`, {
      signal: controller.signal,
    });

    if (!response.ok) return null;
    const data = await response.json();
    const product = data?.product;
    if (!product) return null;

    return {
      name: product.product_name?.trim() || product.generic_name?.trim() || undefined,
      imageUrl: product.image_front_url?.trim() || product.image_url?.trim() || undefined,
      brand: product.brands?.split(",")?.[0]?.trim() || undefined,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
};
