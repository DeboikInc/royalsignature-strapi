import RoomDetails from '@/components/royal/RoomDetails';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return {
    title: `${slug.replaceAll('-', ' ')} | Royal Signature Hotel and Suites`,
    alternates: { canonical: `/rooms/${slug}` },
  };
}

export default async function RoomPage({ params }) {
  const { slug } = await params;
  return <RoomDetails key={slug} slug={slug} />;
}