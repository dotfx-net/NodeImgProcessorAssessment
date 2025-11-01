import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Image Processing API',
      version: '1.0.0',
      description: 'REST API for image processing and task querying'
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: 'Development server'
      }
    ],
    tags: [
      {
        name: 'Tasks',
        description: 'Endpoints for image processing task management'
      }
    ],
    components: {
      schemas: {
        TaskPending: {
          type: 'object',
          properties: {
            taskId: {
              type: 'string',
              description: 'Unique task ID',
              example: '65d4a54b89c5e342b2c2c5f6'
            },
            status: {
              type: 'string',
              enum: ['pending'],
              example: 'pending'
            },
            price: {
              type: 'number',
              description: 'Price associated with the task',
              example: 25.5
            }
          }
        },
        TaskCompleted: {
          type: 'object',
          properties: {
            taskId: {
              type: 'string',
              example: '65d4a54b89c5e342b2c2c5f6'
            },
            status: {
              type: 'string',
              enum: ['completed'],
              example: 'completed'
            },
            price: {
              type: 'number',
              example: 25.5
            },
            images: {
              type: 'array',
              description: 'Array of processed images',
              items: {
                type: 'object',
                properties: {
                  resolution: {
                    type: 'string',
                    example: '1024'
                  },
                  path: {
                    type: 'string',
                    example: '/output/sunset/1024/f322b730b287da77e1c519c7ffef4fc2.jpg'
                  }
                }
              }
            }
          }
        },
        TaskFailed: {
          type: 'object',
          properties: {
            taskId: {
              type: 'string',
              example: '65d4a54b89c5e342b2c2c5f6'
            },
            status: {
              type: 'string',
              enum: ['failed'],
              example: 'failed'
            },
            price: {
              type: 'number',
              example: 25.5
            },
            error: {
              type: 'string',
              description: 'Mensaje de error describiendo el fallo',
              example: 'Failed to load image from \'https://invalid-url.com/image.jpg\': Failed to fetch image: 404 Not Found'
            }
          }
        },
        CreateTaskRequest: {
          type: 'object',
          required: ['source'],
          properties: {
            source: {
              type: 'string',
              description: 'URL or local path of the image to be processed',
              example: 'https://example.com/image.jpg'
            }
          }
        },
        CreateTaskResponse: {
          type: 'object',
          properties: {
            taskId: {
              type: 'string',
              example: '65d4a54b89c5e342b2c2c5f6'
            },
            status: {
              type: 'string',
              example: 'pending'
            },
            price: {
              type: 'number',
              example: 25.5
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Validation error'
            },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    example: 'body.source'
                  },
                  message: {
                    type: 'string',
                    example: 'Source is required'
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.ts']
};

export const swaggerSpec = swaggerJsdoc(options);
