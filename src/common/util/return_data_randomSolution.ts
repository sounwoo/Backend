import { Path } from '../crawiling/interface';

export const randomSolution = (el: Path['path']): string[] => {
    const commonCompetitionOutside = [
        'mainImage',
        'enterprise',
        'title',
        'Dday',
        'interests',
        'target',
        'period',
    ];
    const randomSolution = {
        competition: [...commonCompetitionOutside],
        outside: [...commonCompetitionOutside],
        qnet: ['institution', 'title', 'examSchedules'],
        intern: [
            'mainImage',
            'preferentialTreatment',
            'title',
            'location',
            'period',
        ],
    };

    return randomSolution[el];
};
