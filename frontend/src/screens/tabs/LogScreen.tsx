import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import ExerciseLogModal from '../../components/modals/ExerciseLogModal';
import VHSGlowDivider from '../../components/VHSGlowDivider';
import { AuthContext } from '../../context/AuthContext';
import { getActivePlan } from '../../services/planAssignmentsService';
import { getTodayName, toDateFormatFetchActiveTrainingPlans } from '../../utils/apiHelpers';
import { Exercise, WorkoutDay } from '../../types/trainingPlan';
import { CreateWorkoutLogRequest } from '../../requests/CreateWorkoutLogRequest';
import { createWorkoutLog, getNextSkippedDay } from '../../services/workoutLogService';
import { LoggedExercise, LoggedSet } from '../../types/workoutLog';
import { useWorkout } from '../../context/WorkoutContext';

type PlannedExercise = {
  name: string;
  sets: { reps: number; weight: number; unit: string }[];
};

const LogPage = () => {
  const { token } = useContext(AuthContext);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [blinkVisible, setBlinkVisible] = useState(true);
  const [currentExercises, setCurrentExercises] = useState<Exercise[]>([]);
  const [currentPlanId, setCurrentPlanId] = useState(null);
  const [currentWorkoutDayId, setCurrentWorkoutDayId] = useState(null);
  const [loggedExercises, setLoggedExercises] = useState<LoggedExercise[]>([]);
  const [completedExercises, setCompletedExercises] = useState<String[]>([]);
  const [workoutLogged, setWorkoutLogged] = useState(false);
  const [splitName, setSplitName] = useState("");
  const [plannedExercises, setPlannedExercises] = useState<PlannedExercise[]>([]);
  const [nextSkippedDay, setNextSkippedDay] = useState<WorkoutDay | null>(null);
  const { remainingDays } = useWorkout();

  // Blink animation for session status
  useEffect(() => {
    const interval = setInterval(() => {
      setBlinkVisible((v) => !v);
    }, 600);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (remainingDays > 0) {
      //To-Do let user choose which skipped training day he wants to finish 
      //so nextSkippedWorkoutDay becomes Array of WorkoutDay and also need to update backend to send WorkoutDay[]
      //To-DO let user choose between skipped training day or next working split based on training plan
      loadSkippedExercises();
    } else {
      //if user hasnt skipped training days, show training days based on plan 
      loadExercises();
    }
    console.log("Updated loggedExercises", loggedExercises);
  }, [token]);


  // RPE dot color helper
  const rpeColor = (rpe?: string) => {
    if (!rpe) return { backgroundColor: '#555' };
    const val = parseFloat(rpe);
    if (val <= 5) return { backgroundColor: '#33FF66' }; // green
    if (val <= 7) return { backgroundColor: '#FFCC00' }; // yellow
    return { backgroundColor: '#FF3333' }; // red
  };

  const loadExercises = async () => {
    if (!token) {
      alert('You must be logged in to log your workout');
      return;
    }

    //fetch active trainingplan
    try {
      const today = toDateFormatFetchActiveTrainingPlans(new Date());
      const assignment = await getActivePlan(token, today);
      const trainingPlan = assignment.trainingPlan;

      if (!trainingPlan) {
        console.log("Could not find active trainingplan");
        return;
      }
      //set the trainingplanid to create workout logs for later
      setCurrentPlanId(trainingPlan._id);
      console.log("This is the current training plan id: ", trainingPlan._id);

      for (let i = 0; i < trainingPlan.days.length; ++i) {
        if (trainingPlan.days[i].dayOfWeek === getTodayName()) {
          //set the current Workout Day id to create workout logs for later
          setCurrentWorkoutDayId(trainingPlan.days[i]._id);
          setSplitName(trainingPlan.days[i].splitType);

          if (trainingPlan.days[i].exercises.length > 0) {
            const todaysExercises = trainingPlan.days[i].exercises;
            setPlannedExercises(JSON.parse(JSON.stringify(todaysExercises)));
            setCurrentExercises(todaysExercises);
          }
        }
      };
    } catch (err: any) {
      console.error("Could not load Exercises for today: ", err);
    }
  }

  const logWorkout = async () => {
    if (!token) {
      alert('You must be logged in to log a workout');
      return;
    }

    if (!currentPlanId) {
      console.error("Current training plan id is undefined");
      return;
    }

    if (!currentWorkoutDayId) {
      console.error("Current workout day id is undefined");
      return;
    }

    if (loggedExercises?.length === 0 || loggedExercises === null) {
      console.error("Logged exercises cannot be null");
      return;
    }

    //create workout log on user, save on database
    try {
      const payload: CreateWorkoutLogRequest = {
        trainingPlanId: currentPlanId,
        workoutDayId: currentWorkoutDayId,
        performed: new Date(),
        exercises: loggedExercises,
      };

      const createdWorkoutLog = await createWorkoutLog(token, payload);
      console.log(createdWorkoutLog);

      //indication that the workout is logged
      alert("Workout successfully logged!");
      setWorkoutLogged(true);
    } catch (err: any) {
      console.log("This is the message: ", err.message);
      alert(err.message || 'Log workout already exists');
    }
  }

  const loadSkippedExercises = async () => {
    if (!token) {
      alert('You must be logged in to log your workout');
      return;
    }

    try {
      const response = await getNextSkippedDay(token);
      setNextSkippedDay(response.nextSkippedDay);
      console.log(nextSkippedDay);
    } catch (err: any) {
      alert(err.message);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Session Status */}
      <View style={styles.sessionStatusContainer}>
        <View style={[styles.recIndicator, { opacity: blinkVisible ? 1 : 0.3 }]} />
        <Text style={[
          styles.sessionStatusText,
          workoutLogged && { color: '#00ffcc' }
        ]}>
          {workoutLogged ? "SESSION STATUS: LOGGED" : "SESSION STATUS: ACTIVE"}
        </Text>

      </View>

      {/* Header */}
      <Text style={styles.vhsHudTitle}>▓CHANNEL 03 — SESSION LOG▓</Text>
      <Text style={styles.vhsSubHeader}>▐ TODAY'S SPLIT: {nextSkippedDay?.splitType ?? splitName} ▐</Text>



      <VHSGlowDivider />

      {/* Training Plan List - Supposed Sets, Reps and Load to perform*/}
      <View style={styles.trainingPlanTable}>
        <ScrollView style={styles.scrollArea} nestedScrollEnabled>
          {(nextSkippedDay ? nextSkippedDay.exercises : currentExercises).map((exercise, i) => {
            const isSelected = selectedExercise === exercise.name;
            return (
              <Pressable
                key={i}
                onPress={() => setSelectedExercise(exercise.name)}
                style={[styles.trainingPlanItem, isSelected && styles.pressedHighlight]}
              >
                <Text style={styles.exerciseTitle}>▌ {exercise.name}</Text>

                {exercise.sets.map((set, idx) => {
                  const logged = loggedExercises.find(le => le.name === exercise.name);
                  const thisSetLogged = logged?.sets?.[idx] && logged.sets[idx].reps > 0;

                  return (
                    <Text
                      key={idx}
                      style={[
                        styles.exerciseMeta,
                        thisSetLogged ? styles.savedSetHighlight : styles.unsavedSetDimmed,
                      ]}
                    >
                      ▍Set {idx + 1}: {set.reps} reps @ {set.weight} {set.unit}
                      {thisSetLogged && <Text style={styles.doneMarker}> ✓</Text>}
                    </Text>
                  );
                })}
              </Pressable>


            );
          })}
        </ScrollView>
      </View>

      <VHSGlowDivider />

      {/* Exercise Log Modal */}
      {selectedExercise && (
        <ExerciseLogModal
          visible={!!selectedExercise}
          onClose={() => setSelectedExercise(null)}
          exerciseName={selectedExercise}
          plannedSets={(nextSkippedDay?.exercises ?? currentExercises).find(e => e.name === selectedExercise)?.sets ?? []}
          onSave={(exerciseName, logs) => {
            setLoggedExercises(prev => {
              const withoutThisExercise = prev.filter(ex => ex.name !== exerciseName);
              const existing = prev.find(ex => ex.name === exerciseName);

              const mergedSets = logs.map((l, idx) => {
                const newSet = {
                  reps: parseInt(l.actualReps, 10) || 0,
                  weight: parseFloat(l.actualWeight) || 0,
                  unit: "kg",
                  rpe: l.rpe ? parseFloat(l.rpe) : undefined,
                };

                // If user didn’t enter anything → keep old logged set (if it exists)
                const isEmpty =
                  !l.actualReps && !l.actualWeight && (!l.rpe || l.rpe === "");

                if (isEmpty && existing?.sets[idx]) {
                  return existing.sets[idx];
                }

                return newSet;
              });

              return [
                ...withoutThisExercise,
                { name: exerciseName, sets: mergedSets }
              ];
            });

            // Mark exercise as completed if at least one set has been logged
            setCompletedExercises(prev => [...new Set([...prev, exerciseName])]);
          }}

        />
      )}

      {/* Previous Session Snapshot */}
      {selectedExercise && (
        < View style={styles.exerciseStatsBox}>
          <Text style={styles.exerciseStatsHeader}>▚ PREVIOUS SESSION SNAPSHOT ▞</Text>
          <Text style={styles.exerciseStatsLine}>▌Top Set: 6 reps @ 92.5kg</Text>
          <Text style={styles.exerciseStatsLine}>▌RPE: 8.5 | Last Logged: 2 Days Ago</Text>
        </View>
      )
      }

      {/* Log Feed */}
      <View style={styles.logFeed}>
        <Text style={styles.feedHeader}>▓ LOG FEED ▓</Text>

        {(nextSkippedDay?.exercises ?? plannedExercises).map((planned, i) => {
          const logged = loggedExercises.find(le => le.name === planned.name);

          // planned volume
          const plannedVolume = planned.sets.reduce(
            (acc, s) => acc + (s.weight || 0) * (s.reps || 0),
            0
          );

          // logged volume
          const actualVolume = logged
            ? logged.sets.reduce(
              (acc, s) => acc + (s.weight || 0) * (s.reps || 0),
              0
            )
            : 0;

          const percent = plannedVolume
            ? Math.min((actualVolume / plannedVolume) * 100, 100)
            : 0;

          return (
            <View key={i} style={styles.setLogRow}>
              <Text style={styles.feedText}>{planned.name}</Text>

              {/* Progress bar */}
              <View style={styles.volumeBarTrack}>
                <View
                  style={[
                    styles.volumeBarFill,
                    { width: `${percent}%` },
                  ]}
                />
              </View>

              <Text style={styles.volumeBarLabel}>
                {actualVolume} kg lifted / {plannedVolume} kg planned
              </Text>

              {/* Show logged sets with RPE */}
              {logged && logged.sets.map((set, idx) => {
                return (
                  <View key={idx} style={styles.dotRpeContainer}>
                    {/* Set info */}
                    {set !== undefined && set.reps > 0 && set.weight > 0 && <Text style={styles.exerciseMeta}>
                      ▍Set {idx + 1}: {set.reps} reps @ {set.weight} kg
                      {set.rpe !== undefined && ` | RPE ${set.rpe}`}
                    </Text>}
                    {/* RPE dot */}
                    {set.rpe !== undefined && (
                      <View style={[styles.rpeDot, rpeColor(String(set.rpe))]} />
                    )}
                  </View>
                );
              })}
            </View>
          );
        })}
      </View>

      {/* Tape Stats */}
      <View style={styles.tapeStatRow}>
        <Text style={styles.tapeStat}>
          SETS LOGGED: {
            loggedExercises.reduce(
              (sum, e) =>
                sum + e.sets.filter(s => (s.reps ?? 0) > 0 || (s.weight ?? 0) > 0 || s.rpe !== undefined).length,
              0
            )
          }
        </Text>

        <Text style={styles.tapeStat}>▌TOTAL LOAD:
          {loggedExercises.reduce((acc, ex) => {
            return acc + ex.sets.reduce((sum, s) =>
              sum + s.reps * s.weight, 0);
          }, 0)} kg</Text>
      </View>

      {/* Finalize Button */}
      <Pressable
        style={[styles.endButton, workoutLogged && { backgroundColor: '#33FF66' }]}
        disabled={workoutLogged}
        onPress={logWorkout}
      >
        <Text style={styles.endButtonText}>
          {workoutLogged ? "■ WORKOUT LOGGED" : "■ LOG WORKOUT"}
        </Text>
      </Pressable>

    </ScrollView >
  );
};


export default LogPage;

const styles = StyleSheet.create({
  pressedHighlight: {
    borderColor: '#00ffcc',
    borderWidth: 2,
    backgroundColor: '#002229',
  },
  unsavedSetDimmed: {
    opacity: 0.5,  // dim only unsaved sets
  },

  savedSetHighlight: {
    color: '#00ffcc',
    textShadowColor: '#00ffcc',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },

  loggedIndicator: {
    marginTop: 15,
    padding: 10,
    borderRadius: 6,
    backgroundColor: '#00ffcc22',
    borderWidth: 1,
    borderColor: '#00ffcc',
    alignItems: 'center',
  },
  loggedText: {
    color: '#00ffcc',
    fontFamily: 'monospace',
    fontSize: 13,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  completedExercise: {
    borderColor: '#00ffcc', // green border when done
    borderWidth: 2,
    backgroundColor: '#00ffcc24',
  },
  doneMarker: {
    color: '#ff0055',
    marginLeft: 6,
    fontWeight: 'bold',
  },

  container: {
    flex: 1,
    backgroundColor: '#0A0F1C',
  },
  content: {
    padding: 20,
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
    fontSize: 20,
    marginTop: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    opacity: 0.6,
  },

  trainingPlanTable: {
    borderWidth: 1,
    borderColor: '#00ffcc',
    borderRadius: 10,
    backgroundColor: 'transparent',
    height: 260,
    overflow: 'hidden',
  },
  scrollArea: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },

  trainingPlanItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 6,
    backgroundColor: '#101622',
  },
  selectedExercise: {
    borderColor: '#00ffcc',
    borderWidth: 2,
    backgroundColor: '#002229',
  },
  dimmedExercise: {
    opacity: 0.5,
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
  setLogRow: {
    marginBottom: 10,
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
    marginLeft: 10,
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
