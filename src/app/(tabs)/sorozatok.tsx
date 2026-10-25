import { router } from 'expo-router';
import { PracticeBrowser } from '../../components/PracticeBrowser';

export default function SequenceCatalogue() {
  return (
    <PracticeBrowser
      kind="sequence"
      onSelect={(p) => router.push({ pathname: '/pose/[id]', params: { id: p.id, kind: 'sequence' } })}
    />
  );
}
