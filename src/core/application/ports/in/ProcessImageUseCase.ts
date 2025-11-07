export interface ProcessImageUseCase {
  execute(taskId: string, source: string): Promise<void>;
};
