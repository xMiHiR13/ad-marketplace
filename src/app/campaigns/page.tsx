import CampaignsList from "./CampaignsClient";
import CampaignDetail from "@/components/campaign/CampaignDetail";

export default async function Campaigns({
  searchParams,
}: {
  searchParams: Promise<{ tgWebAppStartParam: string }>;
}) {
  const campaignId = (await searchParams).tgWebAppStartParam;

  if (campaignId) {
    return <CampaignDetail campaignId={campaignId} />;
  }

  return <CampaignsList />;
}
