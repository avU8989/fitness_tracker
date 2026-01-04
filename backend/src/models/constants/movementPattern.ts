export const MOVEMENT_PATTERNS = [
    "squat",
    "hinge",
    "lunge",
    "push_horizontal",
    "push_vertical",
    "pull_horizontal",
    "pull_vertical",
    "carry",
    "rotation",
    "anti_rotation",
    "anti_extension",
    "isolation",
] as const;

export type MovementPattern = typeof MOVEMENT_PATTERNS[number];