export function getPlanStats(plan) {
    const totalExercises = plan.days.reduce(
        (sum, day) => sum + (day.exercises?.length ?? 0),
        0
    );

    const totalVolume = plan.days.reduce((acc, d) => {
        const list = d.exercises ?? [];
        return acc + list.reduce((s, ex) =>
            s + ex.sets.reduce((setAcc, set) => setAcc + set.reps * set.weight, 0)
            , 0);
    }, 0);

    return { totalExercises, totalVolume };
}
