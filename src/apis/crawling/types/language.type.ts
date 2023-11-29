export interface LanguageType {
    id: string;
    test: string;
    classify: string;
    mainImage: string;
    homePage: string;
    examDate: string;
    openDate: string;
    closeDate: string;
    sortDate: Date;
    scrap: number;
    title?: string;
}

export interface LanguagefindeManyType extends Omit<LanguageType, 'detail'> {}
