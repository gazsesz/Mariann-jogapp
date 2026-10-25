import { router } from 'expo-router';
import { PoseBrowser } from '../../components/PoseBrowser';

export default function AsanaCatalogue() {
  return <PoseBrowser onSelect={(p) => router.push({ pathname: '/pose/[id]', params: { id: p.id } })} />;
}
