import path from 'path';
import { connectDB, disconnectDB } from '../src/config/db';
import { TaskModel, type TaskStatus } from '../src/models/task.model';
import { ImageModel } from '../src/models/image.model';
import { randomPrice } from '../src/services/task.service';
import { md5 } from '../src/utils/hash';

interface SeedOptions {
  clear?: boolean;
  tasks?: number;
  stats?: boolean;
};

async function seedTasks(count: number): Promise<void> {
  const tasks = [];
  const statuses: TaskStatus[] = ['pending', 'completed', 'failed'];
  const errors = [
    'Failed to fetch image: 404 Not Found',
    'Failed to load image: Connection timeout',
  ];

  for (let i = 0; i < count; i++) {
    const status = statuses[i % statuses.length];
    const image = 'https://picsum.photos/' + i;
    const taskData: any = {
      status,
      price: randomPrice(5, 50),
      originalPath: image,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (status === 'completed') {
      taskData.images = [
        { resolution: '1024', path: `/output/sample_${i}/1024/${md5(image + '1024')}.jpg` },
        { resolution: '800', path: `/output/sample_${i}/800/${md5(image + '800')}.jpg` }
      ];
    } else if (status === 'failed') {
      taskData.error = errors[i % errors.length];
    }

    tasks.push(taskData);
  }

  const createdTasks = await TaskModel.insertMany(tasks);

  await seedImages(createdTasks);

  console.log(`Created ${createdTasks.length} tasks\n`);
}

async function seedImages(tasks: any[]): Promise<void> {
  const images = [];
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  for (const task of completedTasks) {
    task.images.map((img) => {

      const name = `sample_${String(task._id)}`;
      const hash = path.basename(img.path, '.jpg');

      images.push({
        taskId: String(task._id),
        name,
        mimeType: 'image/jpeg',
        resolution: img.resolution,
        md5: hash,
        path: img.path,
        createdAt: task.createdAt
      });
    });
  }

  const createdImages = await ImageModel.insertMany(images);
}

async function clearDatabase(): Promise<void> {
  console.log('Clearing database...');

  await TaskModel.deleteMany({});
  await ImageModel.deleteMany({});

  console.log('Database cleared');
}

async function displayStats(): Promise<void> {
  const taskCount = await TaskModel.countDocuments();
  const imageCount = await ImageModel.countDocuments();
  
  const pendingCount = await TaskModel.countDocuments({ status: 'pending' });
  const completedCount = await TaskModel.countDocuments({ status: 'completed' });
  const failedCount = await TaskModel.countDocuments({ status: 'failed' });

  console.log('Database Statistics:');
  console.log(`   Total Tasks: ${taskCount}`);
  console.log(`   - Pending: ${pendingCount}`);
  console.log(`   - Completed: ${completedCount}`);
  console.log(`   - Failed: ${failedCount}`);
  console.log(`   Total Images: ${imageCount}\n`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const options: SeedOptions = {
    clear: args.includes('--clear'),
    tasks: Number(args.find((arg) => arg.startsWith('--tasks='))?.split('=')[1] || '20'),
    stats: args.includes('--stats')
  };

  console.log('Starting database seeding...');

  try {
    await connectDB();

    if (options.clear) { await clearDatabase(); }
    if (!!options.tasks) { await seedTasks(options.tasks); }
    if (options.stats) { await displayStats(); }
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
}

main();
