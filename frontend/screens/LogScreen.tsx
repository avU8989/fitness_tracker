import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import ExerciseLogModal from '../components/ExerciseLogModal';
import VHSGlowDivider from '../components/VHSGlowDivider';
import DaySelectorCarousel from '../components/DaySelectorCarousel';

const initialSets = [
  { exercise: 'BENCH PRESS', reps: '8', weight: '100', rpe: '7' },
  { exercise: 'DEADLIFT', reps: '5', weight: '140', rpe: '8' },
];

const LogPage = ({ navigation }) => {
  const [sets, setSets] = useState(initialSets);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [blinkVisible, setBlinkVisible] = useState(true);

  const trainingPlan = [
    {
      name: 'INCLINE BENCH PRESS',
      sets: [
        { reps: 10, weight: 80 },
        { reps: 8, weight: 85 },
        { reps: 6, weight: 90 },
      ],
    },
    {
      name: 'DUMBBELL PRESS',
      sets: [
        { reps: 12, weight: 26 },
        { reps: 10, weight: 28 },
      ],
    },
    // Add more exercises as needed
  ];

  const handleSelectExercise = (exercise) => {
    setSelectedExercise({ name: exercise });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setBlinkVisible((prev) => !prev);
    }, 600);

    return () => clearInterval(interval);
  }, []);

  // Helpers for RPE dot color and load bar width
  const rpeColor = (rpe) => {
    if (!rpe) return { backgroundColor: '#555' };
    const num = parseFloat(rpe);
    if (num <= 5) return { backgroundColor: '#33FF66' }; // green
    if (num <= 7) return { backgroundColor: '#FFCC00' }; // yellow
    return { backgroundColor: '#FF3333' }; // red
  };

  const loadWidth = (set) => {
    const maxLoad = 3000;
    const load = parseFloat(set.weight) * parseInt(set.reps);
    const percent = Math.min((load / maxLoad) * 100, 100);
    return `${percent}%`;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.trainingPlanWrapper}>
        <View style={styles.sessionStatusContainer}>
          <View style={[styles.recIndicator, { opacity: blinkVisible ? 1 : 0.2 }]} />
          <Text style={styles.sessionStatusText}>SESSION STATUS: ACTIVE</Text>
        </View>

        <Text style={styles.vhsHudTitle}>▓CHANNEL 04 — SESSION LOG▓</Text>
        <Text style={styles.vhsSubHeader}>▐▐ SPLIT: PUSH_A1 ▐▐</Text>

        <VHSGlowDivider></VHSGlowDivider>

        <View style={styles.trainingPlanTable}>
          <ScrollView style={styles.scrollArea}>
            {trainingPlan.map((exerciseObj, index) => {
              const isSelected = selectedExercise?.name === exerciseObj.name;
              return (
                <Pressable
                  key={index}
                  onPress={() => handleSelectExercise(exerciseObj.name)}
                  style={[
                    styles.trainingPlanItem,
                    isSelected && styles.selectedExercise,
                    selectedExercise && !isSelected && styles.dimmedExercise,
                  ]}
                >
                  <Text style={styles.exerciseTitle}>▌ {exerciseObj.name}</Text>
                  {exerciseObj.sets.map((set, i) => (
                    <Text key={i} style={styles.exerciseMeta}>
                      ▍Set {i + 1}: {set.reps} reps @ {set.weight}kg
                    </Text>
                  ))}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <VHSGlowDivider></VHSGlowDivider>
      </View>

      {selectedExercise && (
        <ExerciseLogModal
          visible={!!selectedExercise}
          onClose={() => setSelectedExercise(null)}
          exerciseName={selectedExercise.name}
          plannedSets={trainingPlan.find(e => e.name === selectedExercise.name)?.sets}
          onSave={(exerciseName, logs) => {
            console.log('Saved logs for', exerciseName, logs);
          }}
        />
      )}

      {selectedExercise && (
        <View style={styles.exerciseStatsBox}>
          <Text style={styles.exerciseStatsHeader}>▚ PREVIOUS SESSION SNAPSHOT ▞</Text>
          <Text style={styles.exerciseStatsLine}>▌Top Set: 6 reps @ 92.5kg</Text>
          <Text style={styles.exerciseStatsLine}>▌RPE: 8.5 | Last Logged: 2 Days Ago</Text>
        </View>
      )}

      <View style={styles.logFeed}>
        <Text style={styles.feedHeader}>▓ LOG FEED ▓</Text>
        {sets.slice(-5).reverse().map((set, i) => {
          const exercisePlan = trainingPlan.find(e => e.name === set.exercise);
          const plannedVolume = exercisePlan ? exercisePlan.sets.reduce((acc, s) => acc + s.weight * s.reps, 0) : 0;
          const actualVolume = (parseFloat(set.weight) || 0) * (parseInt(set.reps) || 0);
          const progressPercent = plannedVolume ? Math.min((actualVolume / plannedVolume) * 100, 100) : 0;

          return (
            <View key={i} style={styles.setLogRow}>
              <View style={styles.dotRpeContainer}>
                <View style={[styles.rpeDot, rpeColor(set.rpe)]} />
                <Text style={styles.feedText}>
                  {set.exercise} — {set.reps} reps @ {set.weight}kg
                </Text>
              </View>
              <View style={styles.volumeBarTrack}>
                <View style={[styles.volumeBarFill, { width: `${progressPercent}%` }]} />
              </View>
              <Text style={styles.volumeBarLabel}>
                {actualVolume} kg lifted / {plannedVolume} planned
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.carouselContainer}>
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>▚ LAST SESSION ▞</Text>
            <Text style={styles.cardContent}>6 reps @ 92.5kg ▸ RPE 8</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>▚ TARGET ZONE ▞</Text>
            <Text style={styles.cardContent}>3 sets of 8–10 reps ▸ RPE 7–8</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>▚ FORM TIP ▞</Text>
            <Text style={styles.cardContent}>“Keep scapulae retracted. Full ROM.”</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>▚ PERSONAL RECORD ▞</Text>
            <Text style={styles.cardContent}>110kg x 6 (3 weeks ago)</Text>
          </View>
        </ScrollView>
      </View>

      <View style={styles.tapeStatRow}>
        <Text style={styles.tapeStat}>▌SETS LOGGED: {sets.length}</Text>
        <Text style={styles.tapeStat}>
          ▌TOTAL LOAD: {sets.reduce((acc, s) => acc + parseFloat(s.weight || 0), 0)} kg
        </Text>
      </View>

      <Pressable style={styles.endButton}>
        <Text style={styles.endButtonText}>■ FINALIZE & ENCODE SESSION</Text>
      </Pressable>
    </ScrollView>
  );
};

export default LogPage;

const styles = StyleSheet.create({
  setLogRow: {
    marginBottom: 10,
  },

  volumeBarTrack: {
    height: 6,
    backgroundColor: '#1A1F2C',
    borderRadius: 3,
    overflow: 'hidden',
  },
  volumeBarFill: {
    height: '100%',
    backgroundColor: '#00ffcc',
    shadowColor: '#00ffcc',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 6,
  },
  volumeBarLabel: {
    fontFamily: 'monospace',
    color: '#7ACFCF',
    fontSize: 10,
    marginTop: 2,
    letterSpacing: 1,
  },

  carouselContainer: {
    marginTop: 20,
    height: 100,
  },
  card: {
    backgroundColor: 'rgba(0,255,204,0.05)',
    borderColor: '#00ffcc',
    borderWidth: 1,
    borderRadius: 8,
    width: 240,
    padding: 12,
    marginRight: 12,
  },
  cardTitle: {
    color: '#00ffcc',
    fontFamily: 'monospace',
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 4,
  },
  cardContent: {
    color: '#BFC7D5',
    fontFamily: 'monospace',
    fontSize: 12,
    opacity: 0.9,
  },
  sessionStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 10,
    alignSelf: 'center',
  },
  recIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ff0055',
    marginRight: 10,
    shadowColor: '#ff0055',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },
  sessionStatusText: {
    color: '#ff0055',
    fontFamily: 'monospace',
    fontSize: 13,
    letterSpacing: 2,
    textTransform: 'uppercase',
    textShadowColor: '#ff0055',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  exerciseStatsBox: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#00ffcc',
    borderRadius: 6,
    marginBottom: 20,
    backgroundColor: 'rgba(0,255,204,0.05)',
  },
  exerciseStatsHeader: {
    color: '#00ffcc',
    fontFamily: 'monospace',
    fontSize: 13,
    marginBottom: 6,
    letterSpacing: 2,
  },
  exerciseStatsLine: {
    color: '#BFC7D5',
    fontFamily: 'monospace',
    fontSize: 12,
    marginBottom: 2,
    letterSpacing: 1,
  },
  logFeed: {
    marginTop: 0,
  },
  feedHeader: {
    color: '#00ffcc',
    fontSize: 13,
    fontFamily: 'monospace',
    marginBottom: 6,
    letterSpacing: 2,
  },
  feedEntry: {
    marginBottom: 14,
  },
  dotRpeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rpeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
    shadowColor: '#00ffcc',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  feedText: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#BFC7D5',
    letterSpacing: 1,
    textShadowColor: '#00ffcc',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 2,
  },
  loadBarTrack: {
    height: 6,
    backgroundColor: '#0A0F1C',
    borderRadius: 3,
    overflow: 'hidden',
  },
  loadBarFill: {
    height: '100%',
    backgroundColor: '#00ffcc',
    shadowColor: '#00ffcc',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  tapeStatRow: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  tapeStat: {
    fontFamily: 'monospace',
    color: '#00ffcc',
    fontSize: 13,
    letterSpacing: 2,
  },
  trainingPlanWrapper: {
    marginTop: 20,
  },
  trainingPlanTable: {
    borderWidth: 1,
    borderColor: '#00ffcc',
    borderRadius: 10,
    opacity: 1,
    backgroundColor: 'transparent',
    height: 180,
    overflow: 'hidden',
  },
  trainingPlanItem: {
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderRadius: 6,
  },
  selectedExercise: {
    backgroundColor: 'rgba(0,255,204,0.08)',
    borderColor: '#00ffcc',
    borderWidth: 1,
    shadowColor: '#00ffcc',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
  dimmedExercise: {
    opacity: 0.3,
  },
  scrollArea: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  exerciseTitle: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#BFC7D5',
    letterSpacing: 2,
    marginBottom: 4,
  },
  exerciseMeta: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#7ACFCF',
    opacity: 0.75,
    marginBottom: 2,
    letterSpacing: 1,
  },
  vhsHudTitle: {
    fontFamily: 'monospace',
    color: '#00ffcc',
    fontSize: 18,
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(0, 255, 204, 0.08)',
    borderLeftWidth: 3,
    borderLeftColor: '#00ffcc',
    borderRadius: 2,
    letterSpacing: 1,
    textTransform: 'uppercase',
    textShadowColor: '#00ffcc',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
    marginBottom: 12,
    alignSelf: 'center',
    overflow: 'hidden',
  },
  vhsSubHeader: {
    fontFamily: 'monospace',
    color: '#00ffcc',
    fontSize: 11,
    marginBottom: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    opacity: 0.6,
  },
  container: {
    backgroundColor: '#0A0F1C',
    flex: 1,
  },
  content: {
    padding: 20,
  },
  endButton: {
    backgroundColor: '#00ffcc',
    marginTop: 20,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#00ffcc',
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  endButtonText: {
    color: '#0A0F1C',
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
});
