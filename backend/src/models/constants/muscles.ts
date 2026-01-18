export const MUSCLES = [
    "chest",
    "upper_chest",
    "lower_chest",

    "lats",
    "upper_back",
    "lower_back",

    "front_delts",
    "side_delts",
    "rear_delts",

    "biceps",
    "triceps",
    "forearms",

    "quadriceps",
    "hamstrings",
    "glutes",
    "calves",

    "core",
    "abs",
    "obliques",

    "hip_flexors",
    "adductors",
    "abductors",
    "neck",
] as const;

export type Muscle = typeof MUSCLES[number];