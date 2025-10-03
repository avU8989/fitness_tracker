import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from 'vitest';
import '../_lifecycle';

vi.mock('../../src/models/TrainingPlan', () => {
    class TrainingPlanMock {
        static findOne = vi.fn();
        constructor(data: any) { Object.assign(this, data) };
        save = vi.fn();
    }
    return { default: TrainingPlanMock };
});

vi.mock('../../src/models/PowerliftingPlan', () => {
    class PowerliftingPlanMock {
        constructor(data: any) { Object.assign(this, data) };
        save = vi.fn();
    }
    return { default: PowerliftingPlanMock };
});

vi.mock('../../src/models/BodybuildingPlan', () => {
    class BodybuildingPlanMock {
        constructor(data: any) { Object.assign(this, data) };
        save = vi.fn();
    }
    return { default: BodybuildingPlanMock };
});

const { CrossFitPlanMock } = vi.hoisted(() => {
    const CrossFitPlanMock = vi.fn().mockImplementation(function (this: any, d: any) {
        Object.assign(this, d);
        this.save = vi.fn().mockResolvedValue(this);
    });
    return { CrossFitPlanMock };
});

const { BodybuildingPlanMock } = vi.hoisted(() => {
    const BodybuildingPlanMock = vi.fn().mockImplementation(function (this: any, data: any) {
        Object.assign(this, data);
        this.save = vi.fn().mockResolvedValue(this);
    });
    return { BodybuildingPlanMock };
});

const { PowerliftingPlanMock } = vi.hoisted(() => {
    const PowerliftingPlanMock = vi.fn().mockImplementation(function (this: any, data: any) {
        Object.assign(this, data);
        this.save = vi.fn().mockResolvedValue(this);
    });
    return { PowerliftingPlanMock };
})

vi.mock('../../src/models/CrossfitPlan', () => {
    return { default: CrossFitPlanMock };
});

vi.mock('../../src/models/BodybuildingPlan', () => {
    return { default: BodybuildingPlanMock };
});

vi.mock('../../src/models/PowerliftingPlan', () => {
    return { default: PowerliftingPlanMock };
});

import { createTrainingPlan } from '../../src/services/trainingPlan.service'
import { CreateBaseTrainingPlanRequest, CreatePowerliftingPlanRequest } from '../../src/requests/trainingplans/CreateTrainingPlanRequest';

describe('createTrainingPlan', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('creates training plan with crossfit type, returns crossfit training plan', async () => {
        const userId = '1234uid';
        const request: CreateBaseTrainingPlanRequest = {
            name: 'Crossfit Plan',
            type: 'Crossfit',
            days: [
                {
                    dayOfWeek: 'MON',
                    splitType: 'MetCon',
                    exercises: [{
                        name: 'Burpees',
                        sets: [
                            { reps: 10, weight: 0, unit: 'kg' }
                        ]
                    }]
                }
            ]
        };

        const result = await createTrainingPlan(userId, request);
        const inst = (CrossFitPlanMock as any).mock.instances[0];

        expect((CrossFitPlanMock as any)).toHaveBeenCalledTimes(1);
        expect((CrossFitPlanMock as any)).toHaveBeenCalledWith({
            name: request.name,
            type: request.type,
            user: userId,
            days: request.days
        });
        expect(result).toMatchObject({
            name: 'Crossfit Plan',
            type: 'Crossfit',
            user: userId,
            days: [
                {
                    dayOfWeek: 'MON',
                    splitType: 'MetCon',
                    exercises: [{
                        name: 'Burpees',
                        sets: [
                            { reps: 10, weight: 0, unit: 'kg' }
                        ]
                    }]
                }
            ]
        })
        expect(inst.save).toHaveBeenCalledTimes(1);
        expect((PowerliftingPlanMock as any)).not.toHaveBeenCalled();
        expect((BodybuildingPlanMock as any)).not.toHaveBeenCalled();
    });

    it('creates training plan with bodybuilding type, returns bodybuilding training plan', async () => {
        const userId = '1234uid';
        const request: CreateBaseTrainingPlanRequest = {
            name: 'Bodybuilding Plan',
            type: 'Bodybuilding',
            days: [
                {
                    dayOfWeek: 'MON',
                    splitType: 'PUSH',
                    exercises: [{
                        name: 'Bench',
                        sets: [
                            { reps: 10, weight: 140, unit: 'kg' }
                        ]
                    }]
                }
            ]
        };

        const result = await createTrainingPlan(userId, request);
        const inst = (BodybuildingPlanMock as any).mock.instances[0];

        expect((BodybuildingPlanMock as any)).toHaveBeenCalledTimes(1);
        expect((BodybuildingPlanMock as any)).toHaveBeenCalledWith({
            name: request.name,
            type: request.type,
            user: userId,
            days: request.days
        });
        expect(result).toMatchObject({
            name: 'Bodybuilding Plan',
            type: 'Bodybuilding',
            user: userId,
            days: [
                {
                    dayOfWeek: 'MON',
                    splitType: 'PUSH',
                    exercises: [{
                        name: 'Bench',
                        sets: [
                            { reps: 10, weight: 140, unit: 'kg' }
                        ]
                    }]
                }
            ]
        })
        expect(inst.save).toHaveBeenCalledTimes(1);
        expect((PowerliftingPlanMock as any)).not.toHaveBeenCalled();
        expect((CrossFitPlanMock as any)).not.toHaveBeenCalled();
    });

    it('creates training plan with powerlifting type, return powerlifting training plan', async () => {
        const days = [
            {
                dayOfWeek: 'MON' as const,
                splitType: 'Squat Focus',
                exercises: [
                    {
                        name: 'Back Squat',
                        sets: [
                            { reps: 5, weight: 100, unit: 'kg' as const },
                            { reps: 5, weight: 100, unit: 'kg' as const },
                            { reps: 5, weight: 100, unit: 'kg' as const }
                        ]
                    }
                ]
            },
            {
                dayOfWeek: 'WED' as const,
                splitType: 'Bench Focus',
                exercises: [
                    {
                        name: 'Bench Press',
                        sets: [
                            { reps: 5, weight: 80, unit: 'kg' as const },
                            { reps: 5, weight: 80, unit: 'kg' as const },
                            { reps: 5, weight: 80, unit: 'kg' as const }
                        ]
                    }
                ]
            },
            {
                dayOfWeek: 'FRI' as const,
                splitType: 'Deadlift Focus',
                exercises: [
                    {
                        name: 'Conventional Deadlift',
                        sets: [
                            { reps: 5, weight: 140, unit: 'kg' as const },
                            { reps: 5, weight: 140, unit: 'kg' as const },
                            { reps: 5, weight: 140, unit: 'kg' as const }
                        ]
                    }
                ]
            }
        ];
        const userId = '1234uid';
        const request: CreatePowerliftingPlanRequest = {
            name: 'PL - Week 1',
            type: 'Powerlifting',
            intensityPhase: 'Volume',
            weeks: [{ weekNumber: 1, days }],
        };

        const result = await createTrainingPlan(userId, request);
        const inst = (PowerliftingPlanMock as any).mock.instances[0];

        expect((PowerliftingPlanMock as any)).toHaveBeenCalledTimes(1);
        expect((PowerliftingPlanMock as any)).toHaveBeenCalledWith({
            name: request.name,
            type: request.type,
            user: userId,
            intensityPhase: request.intensityPhase,
            weeks: request.weeks
        });
        expect(result).toMatchObject({
            name: 'PL - Week 1',
            type: 'Powerlifting',
            intensityPhase: 'Volume',
            weeks: [{ weekNumber: 1, days }],
        })
        expect(inst.save).toHaveBeenCalledTimes(1);
        expect((BodybuildingPlanMock as any)).not.toHaveBeenCalled();
        expect((CrossFitPlanMock as any)).not.toHaveBeenCalled();

    })

    it('userId param overrides any user present in data', async () => {
        const userId = 'realUser';
        const request = { name: 'CF', type: 'Crossfit', days: [], user: 'fakeUser' } as any;

        await createTrainingPlan(userId, request);

        expect((CrossFitPlanMock as any)).toHaveBeenCalledTimes(1);
        expect((CrossFitPlanMock as any)).toHaveBeenCalledWith(
            expect.objectContaining({ user: 'realUser' })
        );
    })
});

describe('updateExercise', () => {

});

describe('updateWorkoutDay', () => {

});




