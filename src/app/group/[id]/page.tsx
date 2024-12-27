// src/app/group/[id]/page.tsx

import GroupDetailClient from './GroupDetailClient';

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <GroupDetailClient params={{ id }} />;
}
