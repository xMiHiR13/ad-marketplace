export const dynamic = "force-dynamic";

import ChannelsList from "./ChannelsClient";
import ChannelDetail from "@/components/channel/ChannelDetail";

export default async function Channels({
  searchParams,
}: {
  searchParams: Promise<{ tgWebAppStartParam: string }>;
}) {
  const channelId = (await searchParams).tgWebAppStartParam;

  if (channelId) {
    return <ChannelDetail channelId={channelId} />;
  }

  return <ChannelsList />;
}
