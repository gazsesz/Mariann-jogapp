import { router } from 'expo-router';
import { PracticeBrowser } from '../../components/PracticeBrowser';

export default function AsanaCatalogue() {
  return <PracticeBrowser kind="asana" onSelect={(p) => router.push({ pathname: '/pose/[id]', params: { id: p.id } })} />;
}
