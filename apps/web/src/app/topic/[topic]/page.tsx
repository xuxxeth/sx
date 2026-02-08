import { TopicShell } from "../../../components/TopicShell";

export default function TopicPage({
  params,
}: {
  params: { topic: string };
}) {
  return <TopicShell topic={decodeURIComponent(params.topic)} />;
}
