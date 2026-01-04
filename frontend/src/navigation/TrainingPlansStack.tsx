import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import TrainingPlansScreen from "../screens/tabs/TrainingPlansScreen";
import DummyTrainingPlanScreen from "../screens/tabs/PlanScreen";
import { TrainingPlansStackParamList } from "./navtypes";

const Stack = createNativeStackNavigator<TrainingPlansStackParamList>();

export default function TrainingPlansStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name="TrainingPlansScreen"
                component={TrainingPlansScreen}
            />
            <Stack.Screen
                name="TrainingPlanScreen"
                component={DummyTrainingPlanScreen}
            />
        </Stack.Navigator>
    );
}
