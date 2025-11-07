import { Router } from 'express';
import { DIContainer } from '@/core/infrastructure/config/di-container';
import { TaskController } from '@/core/infrastructure/adapters/in/http/controllers/TaskController';
import { validate } from '@/core/infrastructure/adapters/in/http/middleware/validate';
import { z } from 'zod';

const createTaskSchema = z.object({
  body: z.object({
    source: z.string().min(1, 'Source is required')
  })
});

const getTaskSchema = z.object({
  params: z.object({
    taskId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid taskId format')
  })
});

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Crear una nueva tarea de procesado de imagen
 *     tags: [Tasks]
 *     description: Crea una tarea para procesar una imagen en diferentes resoluciones
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTaskRequest'
 *           examples:
 *             url:
 *               summary: Imagen desde URL
 *               value:
 *                 source: "https://example.com/photo.jpg"
 *             local:
 *               summary: Imagen local
 *               value:
 *                 source: "./uploads/photo.jpg"
 *     responses:
 *       201:
 *         description: Tarea creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateTaskResponse'
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /tasks/{taskId}:
 *   get:
 *     summary: Obtener información de una tarea
 *     tags: [Tasks]
 *     description: Retorna el estado, precio y resultados de una tarea de procesado
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: ID de la tarea (ObjectId de MongoDB)
 *         example: "65d4a54b89c5e342b2c2c5f6"
 *     responses:
 *       200:
 *         description: Información de la tarea
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/TaskPending'
 *                 - $ref: '#/components/schemas/TaskCompleted'
 *                 - $ref: '#/components/schemas/TaskFailed'
 *             examples:
 *               pending:
 *                 summary: Tarea pendiente
 *                 value:
 *                   taskId: "65d4a54b89c5e342b2c2c5f6"
 *                   status: "pending"
 *                   price: 25.5
 *               completed:
 *                 summary: Tarea completada
 *                 value:
 *                   taskId: "65d4a54b89c5e342b2c2c5f6"
 *                   status: "completed"
 *                   price: 25.5
 *                   images:
 *                     - resolution: "1024"
 *                       path: "/output/sunset/1024/f322b730b287da77.jpg"
 *                     - resolution: "800"
 *                       path: "/output/sunset/800/202fd8b3174a77.jpg"
 *               failed:
 *                 summary: Tarea fallida
 *                 value:
 *                   taskId: "65d4a54b89c5e342b2c2c5f6"
 *                   status: "failed"
 *                   price: 25.5
 *                   error: "Image processing failed"
 *       400:
 *         description: taskId inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Tarea no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Task not found"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
 
export function createTaskRoutes(container: DIContainer): Router {
  const router = Router();
  const controller = new TaskController(
    container.getCreateTaskUseCase(),
    container.getGetTaskUseCase(),
    container.getProcessImageUseCase()
  );

  router.post('/', validate(createTaskSchema), (req, res, next) => controller.createTask(req, res, next));
  router.get('/:taskId', validate(getTaskSchema), (req, res, next) => controller.getTask(req, res, next));

  return router;
}
