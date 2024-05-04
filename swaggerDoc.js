import swaggerAutogen from 'swagger-autogen';

const config = {
    info: {
      title: 'Secure Chat API Documentation',
      description: '',
    },
    tags: [
      {
        name: 'User',
        description: 'User management endpoints',
      },
      {
        name: 'Chat',
        description: 'Chat management endpoints',
      }
    ],
    host: 'localhost:5000',
    schemes: ['http'],
  };

  const outputFile = './swaggerOutput.json';
  const endpointsFiles = ['./routes/*.js'];

  swaggerAutogen(outputFile, endpointsFiles, config);