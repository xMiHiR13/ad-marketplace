export const dynamic = "force-dynamic";

import DealsList from "./DealsClient";
import DealDetail from "@/components/deal/DealDetail";

export default async function Deals({
  searchParams,
}: {
  searchParams: Promise<{ tgWebAppStartParam: string }>;
}) {
  const dealId = (await searchParams).tgWebAppStartParam;

  // If startParam present, show the detail view
  if (dealId) {
    return <DealDetail dealId={dealId} />;
  }

  return <DealsList />;
}
