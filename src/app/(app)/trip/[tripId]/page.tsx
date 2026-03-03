import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ tripId: string }>;
}

export default async function TripIndexPage({ params }: Props) {
  const { tripId } = await params;
  redirect(`/trip/${tripId}/overview`);
}
