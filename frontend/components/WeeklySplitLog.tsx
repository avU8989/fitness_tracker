import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import VHSGlowDivider from './VHSGlowDivider';
type SplitEntry = {
  day: string;
  type: string;
  status: string;
  plan: string;
};

const WeeklySplitLog: React.FC = () => {
  const splitData: SplitEntry[] = [
    { day: 'MON', type: 'PUSH', status: '▶ PLAY', plan: 'CHST_A1' },
    { day: 'TUE', type: 'PULL', status: 'RECORDED', plan: 'BCK_A1' },
    { day: 'WED', type: 'LEGS', status: 'RECORDED', plan: 'LEG_A1' },
    { day: 'THU', type: 'REST', status: '--', plan: '' },
    { day: 'FRI', type: 'PUSH', status: 'IN QUEUE', plan: 'CHST_A2' },
    { day: 'SAT', type: 'REST', status: '--', plan: '' },
    { day: 'SUN', type: 'PULL', status: '--', plan: '' },
  ];

  return (
    <View >
      <VHSGlowDivider></VHSGlowDivider>

      <Text style={styles.vhsHudTitle}>▓CHANNEL 03 — WEEK SPLIT▓</Text>
      <View style={styles.container}>
        {splitData.map((entry, i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.day}>{`>> ${entry.day}`}</Text>
            <Text style={styles.details}>
              {entry.type} // {entry.status} {entry.plan ? `// ${entry.plan}` : ''}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    color: '#BFC7D5',
    fontSize: 18,
    fontWeight: 'bold',
    paddingBottom: 15,
    fontFamily: 'monospace',
  },
  crtDivider: {
    height: 1,
    backgroundColor: '#00ffff',
    marginVertical: 24,
    borderRadius: 1,
    shadowColor: '#00ffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    opacity: 0.4,
    elevation: 6,
    transform: [{ scaleX: 1.02 }],
  },


  title: {
    fontSize: 18,
    fontFamily: 'monospace',
    color: '#BFC7D5',
    letterSpacing: 2,
  },
  container: {
    borderWidth: 1,
    borderColor: '#00ffcc',
    borderRadius: 8,
    paddingVertical: 8,
    backgroundColor: '#0B101A',
    shadowColor: '#00ffcc',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,255,204,0.2)',
  },
  day: {
    width: 70,
    fontFamily: 'monospace',
    fontSize: 13,
    color: '#00ffcc',
    letterSpacing: 2,
  },
  details: {
    flex: 1,
    fontFamily: 'monospace',
    fontSize: 13,
    color: '#E0E0E0',
    letterSpacing: 2,
  },
  vhsHudTitle: {
    fontFamily: 'monospace',
    color: '#00ffcc',
    fontSize: 16,
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(0, 255, 204, 0.08)',
    borderLeftWidth: 3,
    borderLeftColor: '#00ffcc',
    borderRadius: 2,
    letterSpacing: 3,
    textTransform: 'uppercase',
    textShadowColor: '#00ffcc',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
    marginBottom: 12,
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
});

export default WeeklySplitLog;
