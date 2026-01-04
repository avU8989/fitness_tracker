import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Easing,
  SafeAreaView,
  Image,
} from 'react-native';
import ExerciseLogModal from '../../components/modals/ExerciseLogModal';
import VHSGlowDivider from '../../components/VHSGlowDivider';
import { AuthContext } from '../../context/AuthContext';
import { CreateWorkoutLogRequest } from '../../requests/CreateWorkoutLogRequest';
import { createWorkoutLog, getNextSkippedDay } from '../../services/workoutLogService';
import { useWorkout } from '../../context/WorkoutContext';
import Stopwatch from '../../components/Stopwatch';
import { todayOverViewStyle } from "../../components/TodayOverviewPanel";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Animated } from 'react-native';
import { GRAIN_TEXTURE, homeStyles, SCANLINE_TEXTURE } from './HomeScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import TrainingTopBar from '../../components/TopBar';

export type PlannedExercise = {
  name: string;
  sets: { reps: number; weight: number; unit: string }[];
};

const LogPage = () => {
  const { token } = useContext(AuthContext);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [blinkVisible, setBlinkVisible] = useState(true);
  const [completedExercises, setCompletedExercises] = useState<String[]>([]);
  const { loggedWorkout, setLoggedWorkout } = useWorkout();
  const { loggedWorkoutSplitType, setLoggedWorkoutSplitType } = useWorkout();

  const { plannedExercises } = useWorkout();
  const { skippedWorkout } = useWorkout();
  const { currentWorkoutDayId } = useWorkout();
  const { currentPlanId } = useWorkout();
  const { currentExercises } = useWorkout();
  const { splitNamePlanned } = useWorkout();
  const { splitNameSkipped } = useWorkout();
  const { loggedExercises, setLoggedExercises } = useWorkout();

  const [viewMode, setViewMode] = useState<"skipped" | "current">("current");
  const [loading, setLoading] = useState(true);
  const [toggleAnim] = useState(new Animated.Value(0)); // 0 = current, 1 = skipped
  let isRestDay = !loading && viewMode === 'current' && (!splitNamePlanned || currentExercises.length === 0);

  const activeSplitName =
    viewMode === "skipped"
      ? splitNameSkipped
      : splitNamePlanned;



  const tooLong = activeSplitName.length > 18;

  const todaysWorkoutText = loggedWorkout
    ? `DONE`
    : tooLong
      ? `${activeSplitName}`
      : `${activeSplitName}`;


  const toggle = (mode: "current" | "skipped") => {
    setViewMode(mode);
    Animated.timing(toggleAnim, {
      toValue: mode === "current" ? 0 : 1,
      duration: 180,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  };

  // Blink animation for session status
  useEffect(() => {
    const interval = setInterval(() => {
      setBlinkVisible((v) => !v);
    }, 600);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (loggedWorkout) return;

    const load = async () => {
      setLoading(true);

      if (skippedWorkout) {
        setViewMode("skipped");
      }

      setViewMode("current");

      setLoading(false);
    };

    load();
  }, [token]);

  const exercisesAreEqual = (a, b) => {
    if (!a || !b) return false;
    if (a.length !== b.length) return false;

    return a.every((exA, i) => {
      const exB = b[i];
      if (exA.name !== exB.name) return false;

      // compare sets
      if (exA.sets.length !== exB.sets.length) return false;

      return exA.sets.every((setA, idx) => {
        const setB = exB.sets[idx];
        return (
          setA.reps === setB.reps &&
          setA.weight === setB.weight &&
          setA.unit === setB.unit
        );
      });
    });
  };


  // RPE dot color helper
  const rpeColor = (rpe?: string) => {
    if (!rpe) return { backgroundColor: '#00ff99' };
    const val = parseFloat(rpe);
    if (val <= 3) return { backgroundColor: '#00ff99' }; // green
    if (val <= 7) return { backgroundColor: '#FFCC00' }; // yellow
    return { backgroundColor: '#FF3333' }; // red
  };

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
      setLoggedWorkout(true);
      setLoggedWorkoutSplitType(activeSplitName);
    } catch (err: any) {
      console.log("This is the message: ", err.message);
      alert(err.message || 'Log workout already exists');
    }
  }

  return (
    <SafeAreaView style={homeStyles.root}>
      <View style={{ flex: 1 }}>

        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          {/* Session Status */}

          <TrainingTopBar title="Today's Workout"
            status={undefined}
            blinkVisible={blinkVisible}
            onLeftPress={() => { }}
            onRightPress={() => {
              // open search
            }}></TrainingTopBar>

          {skippedWorkout && !exercisesAreEqual(skippedWorkout.exercises, currentExercises) && (
            <>
              <View style={styles.tagRow}>
                {["current", "skipped"].map(mode => {
                  const active = viewMode === mode;

                  return (
                    <Pressable
                      key={mode}
                      onPress={() => setViewMode(mode as "current" | "skipped")}
                      style={[
                        styles.tagPill,
                        active && styles.tagPillActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.tagText,
                          active && styles.tagTextActive,
                        ]}
                      >
                        {mode.toUpperCase()}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <VHSGlowDivider></VHSGlowDivider>
            </>
          )}


          <View style={styles.splitHeaderContainer}>
            <Text style={styles.splitHint}>
              {isRestDay ? "Rest Day" : todaysWorkoutText.toLocaleUpperCase()}
            </Text>

          </View>

          <Stopwatch></Stopwatch>

          <VHSGlowDivider></VHSGlowDivider>

          <View style={styles.trainingPlanTable}>
            {/* REST DAY UI */}
            {isRestDay ? (
              <View style={styles.restDayContainer}>
                <Text style={styles.restDayTitle}>REST DAY</Text>
                <Text style={styles.restDayText}>
                  You’ve earned it. Recover, stretch, or take a walk.
                </Text>
                <Text style={styles.restDayTip}>
                  (Switch to SKIPPED to make up missed sessions.)
                </Text>
              </View>
            ) : (

              <ScrollView style={styles.scrollArea} nestedScrollEnabled>
                <View style={styles.trainingLeft}>
                  <View style={styles.trainingLabelRow}>
                    <MaterialCommunityIcons
                      name="calendar-check"
                      size={16}
                      color="#00ffcc"
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.heroLabel}>PLANNED EXERCISES</Text>
                  </View>
                </View>

                {/* EXERCISE LIST */}
                {(viewMode === 'skipped'
                  ? skippedWorkout?.exercises
                  : currentExercises
                )?.map((exercise) => {
                  const isSelected = selectedExercise === exercise.name;

                  const loggedEntry = loggedExercises.find((l) => l.name === exercise.name);
                  const isLogged = loggedEntry
                    ? loggedEntry.sets.some(s => s.reps > 0 && s.weight > 0)
                    : false;

                  return (
                    <Pressable
                      key={exercise.name}
                      onPress={() => setSelectedExercise(exercise.name)}
                      style={({ pressed }) => [
                        styles.trainingPlanItem,

                        // apply press effect
                        pressed && {
                          transform: [{ scale: 0.97 }],
                          backgroundColor: "#171e2eff",
                          shadowOpacity: 0.6,
                        },

                        // your existing conditions
                        isLogged && styles.workoutLogCard,
                      ]}
                    >

                      {
                        isLogged && (
                          <View style={styles.loggedBadge}>
                            <MaterialCommunityIcons
                              name="check-circle"
                              size={20}
                              color="#00ff99"
                            />
                          </View>
                        )
                      }

                      {/* Exercise Name */}
                      <Text style={styles.exerciseTitle}>{exercise.name}</Text>

                      {/* Planned Sets */}
                      {
                        exercise.sets.map((set, idx) => {
                          const loggedSet =
                            loggedExercises.find((l) => l.name === exercise.name)?.sets[idx];

                          const isLogged =
                            loggedSet && loggedSet.reps > 0 && loggedSet.weight > 0;

                          return (
                            <>
                              <Text
                                key={idx}
                                style={[
                                  styles.exerciseMetaTrainingPlan,
                                  isLogged ? styles.savedSetHighlight : styles.unsavedSetDimmed
                                ]}
                              >

                                <View style={styles.setRow}>
                                  {/* Number circle */}
                                  <View
                                    style={[
                                      todayOverViewStyle.iconCircleWorkout,
                                      {
                                        width: 18,
                                        height: 18,
                                        justifyContent: "center",
                                        alignItems: "center",
                                      },
                                      !isLogged ? { backgroundColor: "#00d9ffff" } : { backgroundColor: "#00ff99" }
                                    ]}
                                  >
                                    <Text style={styles.setDotText}>{idx + 1}</Text>
                                  </View>

                                  {/* The set text */}
                                  <Text style={[styles.exerciseMetaTrainingPlan, { paddingLeft: 8 }]}>
                                    › {String(set.reps).padStart(2, ' ')} reps x {set.weight} {set.unit}
                                  </Text>
                                </View>
                              </Text>
                            </>
                          );
                        })
                      }
                    </Pressable>
                  );
                })}

              </ScrollView>
            )
            }


          </View >
          {!isRestDay && (
            <View style={styles.heroCard}>


              <View style={styles.heroLeft}>
                <View style={styles.trainingLabelRow}>
                  <MaterialCommunityIcons
                    name="history"
                    size={16}
                    color="#00ffcc"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.heroLabel}>LOG FEED</Text>
                </View>

              </View>

              <ScrollView style={styles.heroFeedScroll} nestedScrollEnabled>
                <View style={styles.logFeed}>
                  {(viewMode == 'skipped' && skippedWorkout ? skippedWorkout.exercises : plannedExercises).map((planned, i) => {

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
                        <Text style={styles.loggedExerciseTitle}>{planned.name}</Text>
                        {/* WARM-UP SETS */}
                        {logged?.warmupSets && logged.warmupSets.length > 0 && (
                          <View style={{ marginBottom: 6 }}>
                            <Text style={styles.warmupLabel}>WARM-UP</Text>

                            {logged.warmupSets.map((set, idx) => (
                              <View key={`wu-${idx}`} style={styles.dotRpeContainer}>
                                <View style={styles.warmupDot}>
                                  <Text style={styles.warmupDotText}>{idx + 1}</Text>
                                </View>

                                <Text style={styles.exerciseMetaLogFeedMuted}>
                                  › {set.reps} reps @ {set.weight} {set.unit}
                                </Text>
                              </View>
                            ))}
                          </View>
                        )}

                        {/* Show logged sets with RPE */}
                        {logged?.sets?.map((set, idx) => {
                          if (!set || set.reps <= 0 || set.weight <= 0) return null;

                          return (
                            <View key={idx} style={styles.dotRpeContainer}>
                              {/* RPE dot */}
                              <View style={[styles.rpeDot, rpeColor(String(set.rpe))]}>
                                <Text style={styles.rpeDotText}>{idx + 1}</Text>
                              </View>

                              {/* Set info */}
                              <Text style={styles.exerciseMetaLogFeed}>
                                › {set.reps} reps @ {set.weight} kg
                                {set.rpe !== undefined && ` | RPE ${set.rpe}`}
                              </Text>
                            </View>
                          );
                        })}

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
                      </View>
                    );

                  })}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Exercise Log Modal */}
          {
            selectedExercise && (
              <ExerciseLogModal
                visible={!!selectedExercise}
                onClose={() => setSelectedExercise(null)}
                exerciseName={selectedExercise}
                plannedSets={(viewMode == 'skipped' && skippedWorkout ? skippedWorkout.exercises : currentExercises).find(e => e.name === selectedExercise)?.sets ?? []}
                onSave={(exerciseName, logs, warmupSets) => {
                  setLoggedExercises(prev => {
                    const withoutThisExercise = prev.filter((ex: { name: string; }) => ex.name !== exerciseName);
                    const existing = prev.find((ex: { name: string; }) => ex.name === exerciseName);


                    // get the unit of the first exercise 
                    const unit =
                      (viewMode === 'skipped'
                        ? skippedWorkout?.exercises
                        : currentExercises
                      )
                        ?.find(e => e.name === exerciseName)
                        ?.sets?.[0]?.unit ?? "kg";


                    //might need to check it again, why the fuck do i store a string and then convert it to a number again, when it intially should be a number anyways
                    const parsedWarmups = warmupSets
                      .map(s => ({
                        reps: parseInt(s.actualReps, 10) || 0,
                        weight: parseFloat(s.actualWeight) || 0,
                        unit,
                      }))
                      .filter(s => s.reps > 0 && s.weight > 0);

                    const parsedSets = logs
                      .map(l => ({
                        reps: parseInt(l.actualReps, 10) || 0,
                        weight: parseFloat(l.actualWeight) || 0,
                        unit,
                        rpe: l.rpe ? parseFloat(l.rpe) : undefined,
                      }))
                      .filter(s => s.reps > 0 && s.weight > 0);

                    return [
                      ...withoutThisExercise,
                      { name: exerciseName, sets: parsedSets, warmupSets: parsedWarmups }
                    ];
                  });

                  // Mark exercise as completed if at least one set has been logged
                  setCompletedExercises(prev => [...new Set([...prev, exerciseName])]);
                }}



              />
            )
          }

          {/* Previous Session Snapshot: TO-DO FETCH FOR THIS EXERCISE THE MOST RECENT LIFT*/}
          {
            selectedExercise && (
              < View style={styles.exerciseStatsBox}>
                <Text style={styles.exerciseStatsHeader}>▚ PREVIOUS SESSION SNAPSHOT ▞</Text>
                <Text style={styles.exerciseStatsLine}>▌Top Set: 6 reps @ 92.5kg</Text>
                <Text style={styles.exerciseStatsLine}>▌RPE: 8.5 | Last Logged: 2 Days Ago</Text>
              </View>
            )
          }

          {/* Log Feed / Stats / Actions */}
          {
            isRestDay ? (

              <View style={styles.heroCard}>
                <View style={styles.heroLeft}>
                  <View style={styles.trainingLabelRow}>
                    <MaterialCommunityIcons
                      name="heart-pulse"
                      size={16}
                      color="#00ffcc"
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.heroLabel}>RECOVERY FEED</Text>
                  </View>

                </View>

                <View style={styles.recoveryStatBox}>
                  {/* To-Do: fetch sleep hours from homescreen*/}

                  <Text style={styles.recoveryLine}>
                    <Text style={styles.recoveryLabel}>SLEEP: </Text>7.5 hrs
                    <Text style={styles.recoveryStatus}> — OPTIMAL</Text>
                  </Text>
                  <View style={styles.recoveryBarTrack}>
                    <View style={[styles.recoveryBarFill, { width: '85%' }]} />
                  </View>

                  {/* To-Do: fetch steps activity*/}
                  <Text style={styles.recoveryLine}>
                    <Text style={styles.recoveryLabel}>Cardio: </Text>2000 steps
                  </Text>
                  <View style={styles.recoveryBarTrack}>
                    <View style={[styles.recoveryBarFill, { width: '80%' }]} />
                  </View>

                  {/* To-Do: Fatigue Level calculation based on how many hours person slept & how many workouts user has done this week & volume increasement compared to last week*/}
                  <Text style={styles.recoveryLine}>
                    <Text style={styles.recoveryLabel}>Fatigue Level:</Text>
                    <Text style={styles.recoveryStatus}> LOW</Text>
                  </Text>
                  <View style={styles.recoveryBarTrack}>
                    <View style={[styles.recoveryBarFill, { width: '70%' }]} />
                  </View>

                  {/* To-Do: fetch thisWeekVolume from homescreen*/}
                  <Text style={styles.recoveryLine}>
                    <Text style={styles.recoveryLabel}>This Week Volume: </Text>900 kg
                  </Text>
                  <View style={styles.recoveryBarTrack}>
                    <View style={[styles.recoveryBarFill, { width: '95%' }]} />
                  </View>
                </View>

                <Text style={styles.restQuote}>“Recovery is training too.”</Text>
              </View>
            ) : (
              <>
              </>
            )
          }

          {/* Sticky Footer */}
          {!isRestDay && (
            <Pressable
              style={[styles.endButton, loggedWorkout && { backgroundColor: '#33FF66' }]}
              disabled={loggedWorkout}
              onPress={logWorkout}
            >
              <Text style={styles.endButtonText}>
                {loggedWorkout ? "■ WORKOUT LOGGED" : "■ LOG WORKOUT"}
              </Text>
            </Pressable>
          )}
        </ScrollView >
      </View >
    </SafeAreaView >
  );
};


export default LogPage;

const styles = StyleSheet.create({
  splitHeaderContainer: {
    alignItems: "center",
    marginTop: 12,
    marginBottom: 8,
  },

  splitTitle: {
    fontFamily: "monospace",
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: 2,
    textAlign: "center",
  },

  splitHint: {
    fontFamily: "monospace",
    fontSize: 18,
    fontWeight: "condensedBold",
    color: "#7ACFCF",
    letterSpacing: 1,
  },

  tagRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginTop: 8,
  },

  tagPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#111622",
    shadowColor: "#00ffcc",
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },

  tagPillActive: {
    backgroundColor: "rgba(0,255,204,0.18)",
    borderColor: "#00ffcc",
    shadowColor: "#00ffcc",
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },
  tagText: {
    fontFamily: "monospace",
    fontSize: 12,
    color: "#7ACFCF",
    letterSpacing: 2,
  },

  tagTextActive: {
    color: "#00ffcc",
    fontWeight: "bold",
  },

  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  statusRow: {
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerContainer: {
    marginTop: 18,
    marginBottom: 4,
    alignItems: 'center',
  },
  planStatusContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  planStatusText: {
    color: "white",
    fontFamily: "monospace",
    fontSize: 22,
    fontWeight: "bold",
  },

  headerIconContainer: {
    flexDirection: "row",
  },

  headerSidePlaceholder: {
    width: 30,
  },

  headerSide: {
    paddingLeft: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  warmupLabel: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#7ACFCF',
    letterSpacing: 2,
    opacity: 0.7,
    marginBottom: 4,
  },

  warmupDot: {
    width: 14,
    height: 14,
    borderRadius: 999,
    backgroundColor: '#1A1F2C',
    borderWidth: 1,
    borderColor: '#00ffcc55',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  warmupDotText: {
    fontFamily: 'monospace',
    fontSize: 8,
    color: '#7ACFCF',
  },

  exerciseMetaLogFeedMuted: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#7ACFCF',
    letterSpacing: 1,
    opacity: 0.6,
  },

  trainingLabelRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  setDotText: {
    color: "#0A0F1C",
    alignSelf: "center",
    fontFamily: "monospace",
    fontSize: 10,
    fontWeight: "bold",
  },
  rpeDotText: {
    color: "#0A0F1C",
    alignSelf: "center",
    fontFamily: "monospace",
    fontSize: 10,
    fontWeight: "bold",
  },
  loggedBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    zIndex: 5,

    // Optional glowing effect matching your neon theme:
    shadowColor: "#00ff99",
    shadowOpacity: 0.8,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },

  setRow: {
    flexDirection: "row",
    justifyContent: "center",
    paddingBottom: 8,
  },
  bgImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    opacity: 0.10,
  },
  vcrStrip: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    paddingVertical: 8,
    paddingHorizontal: 12,

    borderWidth: 1.2,
    borderRadius: 6,

    marginTop: 6,
    backgroundColor: "#0C111C",

    // VHS look
    shadowColor: "#00ffcc",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 6,
  },

  vcrStripLogged: {
    borderColor: "#00ff66",
    backgroundColor: "rgba(0,255,102,0.08)",
    shadowColor: "#00ff66",
  },

  vcrStripPending: {
    borderColor: "#00ffcc55",
    backgroundColor: "rgba(0,255,204,0.05)",
  },

  vcrStripText: {
    fontFamily: "monospace",
    fontSize: 12,
    color: "#BFC7D5",
    letterSpacing: 1,
  },

  vcrStripStatus: {
    fontFamily: "monospace",
    fontSize: 12,
    letterSpacing: 1,
    color: "#00ffcc",
    textShadowColor: "#00ffcc",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },


  heroToggleContainer: {
    width: 200,               // FULL WIDTH OF TOGGLE
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
    borderRadius: 10,
    backgroundColor: "#0f1624",
    padding: 4,
    overflow: "hidden",
    alignSelf: "center",
    marginBottom: 10,
    marginTop: 20,
  },

  heroToggleSlider: {
    position: "absolute",
    width: "50%",            // slider is half width (2 options)
    height: "100%",
    backgroundColor: "#00ffcc33",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#00ffcc",
  },

  heroToggleButton: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2, // above the slider so text stays visible
  },

  heroToggleText: {
    color: "#7ACFCF",
    fontFamily: "monospace",
    fontSize: 13,
    letterSpacing: 1,
  },

  heroToggleTextActive: {
    color: "#00ffcc",
    fontWeight: "bold",
  },

  /* HERO CARD */
  heroFeedScroll: {
    maxHeight: undefined,   // allows full height

    marginTop: 10,
  },

  heroCard: {
    flexDirection: "column",
    padding: 16,
    backgroundColor: "#111622",
    borderRadius: 18,
    shadowColor: "#00ffcc",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    marginBottom: 16,
    marginTop: 20,
  },

  heroLeft: {
    paddingRight: 8,
  },
  trainingLeft: {
    paddingLeft: 8,
    paddingVertical: 8,
  },

  heroLabel: {
    fontFamily: "monospace",
    fontSize: 11,
    color: "#00ffcc",
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 4,
    opacity: 0.9,
  },

  heroTitle: {
    fontFamily: "monospace",
    fontSize: 18,
    color: "#BFC7D5",
    fontWeight: "bold",
    letterSpacing: 2,
    marginBottom: 6,
  },

  heroSub: {
    fontFamily: "monospace",
    fontSize: 11,
    color: "#BFC7D5",
    opacity: 0.8,
    marginTop: 2,
  },

  heroSubHighlight: {
    color: "#00ffcc",
    textShadowColor: "#00ffcc",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },

  recIndicatorLogged: {
    backgroundColor: '#00ff66',
    shadowColor: '#00ff66',
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },

  sessionStatusTextLogged: {
    color: '#00ff66',
    textShadowColor: '#00ff66',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },

  recoveryStatsContainer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  recoveryStatBox: {
    width: '100%',
    backgroundColor: 'rgba(0,255,204,0.05)',
    borderWidth: 1,
    borderColor: '#00ffcc55',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 10,
  },
  recoveryLine: {
    fontFamily: 'monospace',
    color: '#7ACFCF',
    fontSize: 13,
    letterSpacing: 1,
    marginTop: 8,
  },
  recoveryLabel: {
    color: '#00ffcc',
    fontWeight: 'bold',
  },
  recoveryStatus: {
    color: '#33FF66',
  },

  recoveryBarTrack: {
    height: 6,
    backgroundColor: '#1A1F2C',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
    marginTop: 2,
  },
  recoveryBarFill: {
    height: '100%',
    backgroundColor: '#00ffcc',
    shadowColor: '#00ffcc',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
  recoveryTip: {
    color: '#7ACFCF',
    fontFamily: 'monospace',
    fontSize: 12,
    letterSpacing: 1,
    marginTop: 12,
    opacity: 0.8,
  },
  restQuote: {
    color: '#00ffcc',
    fontFamily: 'monospace',
    fontSize: 12,
    letterSpacing: 1,
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.7,
  },


  restDayContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  restDayTitle: {
    color: '#00ffcc',
    fontFamily: 'monospace',
    fontSize: 16,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  restDayText: {
    color: '#BFC7D5',
    fontFamily: 'monospace',
    fontSize: 13,
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 6,
  },
  restDayTip: {
    color: '#7ACFCF',
    fontFamily: 'monospace',
    fontSize: 11,
    letterSpacing: 1,
    textAlign: 'center',
    opacity: 0.6,
  },

  splitHeaderContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },

  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
    gap: 10,
  },
  toggleButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#00ffcc55',
    backgroundColor: 'rgba(0,255,204,0.05)',
  },
  toggleButtonActive: {
    backgroundColor: '#00ffcc22',
    borderColor: '#00ffcc',
  },
  toggleButtonText: {
    fontFamily: 'monospace',
    color: '#00ffcc',
    fontSize: 12,
    letterSpacing: 1,
  },


  unsavedSetDimmed: {
    opacity: 0.5,  // dim only unsaved sets
  },

  savedSetHighlight: {
    color: '#00ff66',
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
  },
  content: {
    padding: 20,
    minHeight: "100%",
    paddingBottom: 140,
  },

  sessionStatusContainer: {
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
    color: 'white',
    fontFamily: 'monospace',
    fontSize: 12,
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
    borderRadius: 18,
    backgroundColor: "#111622",
    minHeight: 260,
    overflow: 'hidden',
  },
  scrollArea: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },

  trainingPlanItem: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    shadowColor: "#00ffcc",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    marginBottom: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#171e2eff"
  },

  workoutLogCard: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 16,
    // Slight green fill, neon aesthetic
    backgroundColor: "rgba(0,255,153,0.12)",

    // Neon green border
    borderWidth: 2,
    borderColor: "#00FF99",

    // Outer glow
    shadowColor: "#00FF99",
    marginBottom: 8,

    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
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
    fontSize: 18,
    fontWeight: "bold",
    color: '#BFC7D5',
    letterSpacing: 2,
    marginBottom: 4,
    paddingBottom: 3,
  },
  exerciseMetaTrainingPlan: {
    fontFamily: "monospace",
    fontSize: 12,
    color: "#BFC7D5",
    letterSpacing: 2,
    opacity: 0.75,
  },
  exerciseMetaLogFeed: {
    fontFamily: "monospace",
    fontSize: 12,
    color: "#BFC7D5",
    letterSpacing: 2,
    opacity: 0.75,
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
    justifyContent: "center",
    marginBottom: 8,

  },
  dotRpeContainer: {
    flexDirection: 'row',
    alignItems: "center",
    marginBottom: 6,
  },
  rpeDot: {
    width: 18,
    height: 18,
    borderRadius: 999,
    marginRight: 10,
    marginLeft: 0,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    shadowColor: '#00ffcc',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  loggedExerciseTitle: {
    fontFamily: 'monospace',
    paddingBottom: 8,
    fontSize: 18,
    color: '#BFC7D5',
    letterSpacing: 1,
    textShadowColor: '#00ffcc',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 2,
  },

  volumeBarTrack: {
    marginTop: 8,
    height: 8,
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
    fontSize: 11,
    marginTop: 6,
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
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 80,
    backgroundColor: '#00ffcc',
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 9,
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
