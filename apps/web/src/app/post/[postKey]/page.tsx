import { PostDetailShell } from "../../../components/PostDetailShell";

type PageProps = {
  params: Promise<{ postKey: string }>;
};

export default async function PostDetailPage({ params }: PageProps) {
  const { postKey } = await params;
  return <PostDetailShell eventId={postKey} />;
}
