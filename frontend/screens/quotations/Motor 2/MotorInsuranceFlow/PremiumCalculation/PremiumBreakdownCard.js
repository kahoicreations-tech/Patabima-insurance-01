import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function PremiumBreakdownCard({ result }) {
  const [open, setOpen] = useState(false);
  if (!result) return null;

  const base = Number(result.base_premium || result.premium || 0);
  const m = result.mandatory_levies || {};
  const itl = Number(m.insurance_training_levy || 0);
  const pcf = Number(m.pcf_levy || 0);
  const stamp = Number(m.stamp_duty ?? 40);
  const total = Number(result.total_premium || base + itl + pcf + stamp);

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => setOpen(!open)}>
        <Text style={styles.title}>Premium Breakdown {open ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {open && (
        <View style={{ gap: 6 }}>
          <Row k="Base premium" v={base} />
          <Row k="ITL (0.25%)" v={itl} />
          <Row k="PCF (0.25%)" v={pcf} />
          <Row k="Stamp duty" v={stamp} />
          <View style={styles.sep} />
          <Row k="Total" v={total} bold />
        </View>
      )}
    </View>
  );
}

function Row({ k, v, bold }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.k, bold && styles.bold]}>{k}</Text>
      <Text style={[styles.v, bold && styles.bold]}>KES {Number(v).toLocaleString()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#e9ecef' },
  title: { fontWeight: '700', color: '#2c3e50', marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  k: { color: '#495057' },
  v: { color: '#2c3e50' },
  sep: { height: 1, backgroundColor: '#f1f3f5', marginVertical: 8 },
  bold: { fontWeight: '700' },
});
