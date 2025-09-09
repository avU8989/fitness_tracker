import React, { createContext, useContext, useState } from "react";

type WorkoutContextType = {
    remainingDays: number;
    setRemainingDays: (value: number) => void;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [remainingDays, setRemainingDays] = useState<number>(0);
    return (
        <WorkoutContext.Provider value={{ remainingDays, setRemainingDays }}>
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