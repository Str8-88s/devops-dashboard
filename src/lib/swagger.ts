import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DevOps Dashboard API',
      version: '1.0.0',
      description: 'REST API for the DevOps Dashboard — team metrics and developer tools platform',
    },
    servers: [
      {
        url: 'https://devops-dashboard-985792054692.us-east1.run.app',
        description: 'Production',
      },
      {
        url: 'http://localhost:3000',
        description: 'Local development',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
