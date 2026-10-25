import { router } from 'expo-router';
import { PracticeBrowser } from '../../components/PracticeBrowser';

export default function PranayamaCatalogue() {
  return (
    <PracticeBrowser
      kind="pranayama"
      onSelect={(p) => router.push({ pathname: '/pose/[id]', params: { id: p.id, kind: 'pranayama' } })}
    />
  );
}
