import { TrainingPlanUI } from "../types/trainingPlan";

export type RootStackParameterList = {
  Login: undefined;
  SignUpCredentials: undefined;
  SignUpProfile: { email: string; password: string; username: string };
  Main: undefined;
};


export type TrainingPlansStackParamList = {
  TrainingPlansScreen: undefined;
  TrainingPlanScreen: { plan: TrainingPlanUI };
};
