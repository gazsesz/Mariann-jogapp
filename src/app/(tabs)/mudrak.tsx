import { router } from 'expo-router';
import { PracticeBrowser } from '../../components/PracticeBrowser';

export default function MudraCatalogue() {
  return (
    <PracticeBrowser
      kind="mudra"
      onSelect={(p) => router.push({ pathname: '/pose/[id]', params: { id: p.id, kind: 'mudra' } })}
    />
  );
}
