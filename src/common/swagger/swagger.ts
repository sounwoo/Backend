const swaggerAutogen = require('swagger-autogen')();

const options = {
    info: {
        version: '3.0.0',
        title: 'allinjob API Docs',
        description: '올인잡 api 문서입니다',
    },
    servers: [
        { url: 'http://localhost:4000' },
        { url: 'https://backallinjob.co.kr' },
    ],
    schemes: ['http', 'https'],
    tags: [
        {
            name: 'Users',
            description: 'User관련 API',
        },
        {
            name: 'Crawling',
            description: '크롤링 데이터 조회 API',
        },
        {
            name: 'Community',
            description: '취준job담 API',
        },
    ],
};

const outputFile = './swagger-output.json';
const endpointsFiles = [
    './src/apis/users/users.controller.ts',
    './src/apis/crawiling/crawiling.controller.ts',
    './src/apis/auth/auth.controller.ts',
];
swaggerAutogen(outputFile, endpointsFiles, options);
