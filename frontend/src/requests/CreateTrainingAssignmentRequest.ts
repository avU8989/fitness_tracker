export interface CreateTrainingAssignmentRequest {
  trainingPlanId: string;
  startDate: string;
  endDate?: string | null;
}
