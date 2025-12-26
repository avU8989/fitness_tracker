import React, { createContext, useContext, useState } from "react";
import { Exercise, WorkoutDay } from "../types/trainingPlan";
import { PlannedExercise } from "../screens/tabs/LogScreen";
import { LoggedExercise } from "../types/workoutLog";
import { AuthContext } from "./AuthContext";
import { getUserWorkoutLoggedToday } from "../services/workoutLogService";

type WorkoutContextType = {
    loggedWorkout: boolean;
    loggedWorkoutSplitType: string;
    remainingDays: number;
    currentExercises: Exercise[];
    plannedExercises: PlannedExercise[];
    skippedWorkout: WorkoutDay | null;
    currentPlanId: string;
    currentWorkoutDayId: string;
    isRestDay: boolean;
    splitNamePlanned: string;
    splitNameSkipped: string;
    loggedExercises: LoggedExercise[];
    nextUpcomingWorkout: WorkoutDay | null;
    loggedWorkoutPerformed: Date | undefined;

    setRemainingDays: (value: number) => void;
    setSplitNamePlanned: (value: string) => void;
    setSplitNameSkipped: (value: string) => void;
    setLoggedWorkoutSplitType: (value: string) => void;
    setLoggedWorkout: (value: boolean) => void;
    setSkippedWorkout: (value: WorkoutDay | null) => void;
    setLoggedExercises: (value: LoggedExercise[]) => void;
    setCurrentPlanId: (value: string) => void;
    setCurrentWorkoutDayId: (value: string) => void;
    setNextUpcomingWorkout: (value: WorkoutDay | null) => void;
    setRestDay: (value: boolean) => void;
    setCurrentExercises: (value: Exercise[]) => void;
    setPlannedExercises: (value: PlannedExercise[]) => void;
    setLoggedWorkoutPerformed: (value: Date | undefined) => void;

    resetWorkoutState: () => void;
    loadTodayWorkoutStatus: () => void;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { token } = useContext(AuthContext);
    const [remainingDays, setRemainingDays] = useState<number>(0);
    const [loggedWorkout, setLoggedWorkout] = useState<boolean>(false);
    const [skippedWorkout, setSkippedWorkout] = useState<WorkoutDay | null>(null);
    const [isRestDay, setRestDay] = useState<boolean>(false);
    const [currentPlanId, setCurrentPlanId] = useState<string>("");
    const [currentWorkoutDayId, setCurrentWorkoutDayId] = useState<string>("");
    const [plannedExercises, setPlannedExercises] = useState<PlannedExercise[]>([]);
    const [currentExercises, setCurrentExercises] = useState<Exercise[]>([]);
    const [splitNamePlanned, setSplitNamePlanned] = useState<string>("");
    const [splitNameSkipped, setSplitNameSkipped] = useState<string>("");
    const [loggedExercises, setLoggedExercises] = useState<LoggedExercise[]>([]);
    const [loggedWorkoutSplitType, setLoggedWorkoutSplitType] = useState<string>("");
    const [nextUpcomingWorkout, setNextUpcomingWorkout] = useState<WorkoutDay | null>(null);
    const [loggedWorkoutPerformed, setLoggedWorkoutPerformed] = useState<Date>();

    const resetWorkoutState = () => {
        setPlannedExercises([]);
        setCurrentExercises([]);
        setSkippedWorkout(null);
        setSplitNamePlanned("");
        setSplitNameSkipped("");
        setCurrentPlanId("");
        setCurrentWorkoutDayId("");
        setLoggedWorkout(false);
        setLoggedExercises([]);
    };

    async function loadTodayWorkoutStatus() {
        if (!token) {
            return;
        }

        try {
            const response = await getUserWorkoutLoggedToday(token);

            setLoggedWorkout(response.loggedToday);

            if (response.loggedToday && response.lastWorkout) {
                setLoggedExercises(response.lastWorkout.exercises ?? []);
                setLoggedWorkoutSplitType(response.lastWorkout.splitType ?? "");
                setLoggedWorkoutPerformed(new Date(response.lastWorkout.performed));
            }

        } catch (err: any) {
            console.error("Failed to load today workout:", err);
        }
    }


    return (
        <WorkoutContext.Provider value={{
            loggedWorkoutPerformed,
            loggedExercises,
            nextUpcomingWorkout,
            splitNamePlanned,
            loggedWorkoutSplitType,
            plannedExercises,
            splitNameSkipped,
            isRestDay,
            remainingDays,
            skippedWorkout,
            currentWorkoutDayId,
            currentPlanId,
            loggedWorkout,
            currentExercises,
            setLoggedWorkoutPerformed,
            loadTodayWorkoutStatus,
            setNextUpcomingWorkout,
            setLoggedExercises,
            resetWorkoutState,
            setSplitNamePlanned,
            setSplitNameSkipped,
            setCurrentExercises,
            setLoggedWorkoutSplitType,
            setPlannedExercises,
            setRestDay,
            setRemainingDays,
            setCurrentWorkoutDayId,
            setCurrentPlanId,
            setSkippedWorkout,
            setLoggedWorkout
        }}>
            {children}
        </WorkoutContext.Provider>
    );
}

export const useWorkout = () => {
    const ctx = useContext(WorkoutContext);
    if (!ctx) {
        throw new Error("useWorkout must be used inside WorkoutProvider");
    }
    return ctx;
}
