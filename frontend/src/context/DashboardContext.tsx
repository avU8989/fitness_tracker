import React, { createContext, useContext, useState } from "react";

type DashboardState = {
    workoutsThisWeek: number;
    plannedWorkoutDaysForWeek: number;
}
type DashboardContextType = {
    state: DashboardState;
    setState: React.Dispatch<React.SetStateAction<DashboardState>>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<DashboardState>({
        workoutsThisWeek: 0,
        plannedWorkoutDaysForWeek: 0,
    });

    return (
        <DashboardContext.Provider value={{ state, setState }}>
            {children}
        </DashboardContext.Provider>
    );
}

export const useDashboard = () => {
    const ctx = useContext(DashboardContext);
    if (!ctx) {
        throw new Error("useDashboard must be used inside DashboardProvider");
    }
    return ctx;
}
