import { Path } from '../crawiling/interface';

export const cludes = (path: Path['path'] | 'language'): string[] => {
    const common = ['title', 'view', 'scrap'];
    const qnetLanExcept = [...common, 'period', 'mainImage', 'enterprise'];
    const cludes = {
        ousideOrCompetition: [...qnetLanExcept],
        intern: [...qnetLanExcept, 'preferentialTreatment', 'location'],
        qnet: [...common, 'relatedDepartment', 'institution', 'examSchedules'],
        language: ['test', 'openDate', 'examDate', 'closeDate', 'homePage'],
    };

    return (
        cludes[path as 'intern' | 'qnet' | 'language'] ||
        cludes['ousideOrCompetition']
    );
};
