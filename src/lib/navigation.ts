/**
 * Build a detail page URL using tgWebAppStartParam query parameter
 * Format: /deals?tgWebAppStartParam={id}
 */
export const buildDetailUrl = (basePath: string, id: string | number): string => {
  return `${basePath}?tgWebAppStartParam=${id}`;
};

// Convenience functions for each entity type
export const buildDealUrl = (id: string | number) => buildDetailUrl("/deals", id);
export const buildChannelUrl = (id: string | number) => buildDetailUrl("/channels", id);
export const buildCampaignUrl = (id: string | number) => buildDetailUrl("/campaigns", id);
