import React, { createContext, useContext, useState } from "react";
import { Exercise, TrainingPlanAssignment, WorkoutDay } from "../types/trainingPlan";
import { PlannedExercise } from "../screens/tabs/LogScreen";
import { LoggedExercise } from "../types/workoutLog";

type TrainingPlanContextType = {
    refreshedTrainingPlanAssignment: boolean;
    planDeactivated: boolean;

    setRefreshedTrainingPlanAssignment: (value: boolean) => void;
    setPlanDeactivated: (value: boolean) => void;
}

const TrainingPlanContext = createContext<TrainingPlanContextType | undefined>(undefined);

export const TrainingPlanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [refreshedTrainingPlanAssignment, setRefreshedTrainingPlanAssignment] = useState<boolean>(false);
    const [planDeactivated, setPlanDeactivated] = useState<boolean>(false);


    return (
        <TrainingPlanContext.Provider value={{
            refreshedTrainingPlanAssignment,
            planDeactivated,
            setRefreshedTrainingPlanAssignment,
            setPlanDeactivated
        }}>
            {children}
        </TrainingPlanContext.Provider>
    );
}

export const useTrainingPlan = () => {
    const ctx = useContext(TrainingPlanContext);
    if (!ctx) {
        throw new Error("useWorkout must be used inside WorkoutProvider");
    }
    return ctx;
}