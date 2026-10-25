import { useEffect, useState } from 'react';
import { Alert, Modal, Platform, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/ui';
import { C } from './theme';

// Telefonon a rendszer saját párbeszédablaka (Alert). Böngészőben saját ablak,
// mert beágyazott oldalon a window.confirm/alert nem jelenik meg.

interface Ask {
  title: string;
  message: string;
  okLabel?: string;
  cancel: boolean;
  resolve: (ok: boolean) => void;
}
let show: ((a: Ask) => void) | null = null;

export function confirm(title: string, message: string, okLabel = 'Törlés'): Promise<boolean> {
  if (Platform.OS === 'web') {
    return new Promise((resolve) => (show ? show({ title, message, okLabel, cancel: true, resolve }) : resolve(true)));
  }
  return new Promise((resolve) =>
    Alert.alert(title, message, [
      { text: 'Mégse', style: 'cancel', onPress: () => resolve(false) },
      { text: okLabel, style: 'destructive', onPress: () => resolve(true) },
    ]),
  );
}

export function notify(title: string, message: string) {
  if (Platform.OS === 'web') show?.({ title, message, okLabel: 'Rendben', cancel: false, resolve: () => {} });
  else Alert.alert(title, message);
}

/** A gyökérelrendezésben egyszer elhelyezve jeleníti meg a böngészős kérdéseket. */
export function DialogHost() {
  const [ask, setAsk] = useState<Ask | null>(null);
  useEffect(() => {
    show = setAsk;
    return () => {
      show = null;
    };
  }, []);
  if (!ask) return null;
  const close = (ok: boolean) => {
    ask.resolve(ok);
    setAsk(null);
  };
  return (
    <Modal transparent animationType="fade" onRequestClose={() => close(false)}>
      <View style={st.backdrop}>
        <View style={st.box}>
          <Text style={st.title}>{ask.title}</Text>
          <Text style={st.msg}>{ask.message}</Text>
          <View style={st.row}>
            {ask.cancel && <Button kind="secondary" label="Mégse" onPress={() => close(false)} />}
            <Button kind={ask.cancel ? 'danger' : 'primary'} label={ask.okLabel ?? 'Rendben'} onPress={() => close(true)} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const st = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(20,24,30,0.45)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  box: { backgroundColor: C.surface, borderRadius: 16, padding: 20, width: '100%', maxWidth: 380 },
  title: { fontSize: 18, fontWeight: '700', color: C.ink },
  msg: { fontSize: 15, color: C.ink, marginTop: 8, lineHeight: 21 },
  row: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 18 },
});
