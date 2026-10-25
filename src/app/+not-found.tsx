import { Redirect } from 'expo-router';

// Ismeretlen címről (pl. ha a böngészős változat más útvonalon nyílik meg) a kezdőlapra.
export default function NotFound() {
  return <Redirect href="/" />;
}
