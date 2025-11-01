import mongoose from 'mongoose';

describe('Database Connectivity', () => {
  it('should be connected to MongoDB', () => {
    expect(mongoose.connection.readyState).toBe(1);
  });

  it('should have valid connection', () => {
    expect(mongoose.connection.db).toBeDefined();
  });

  it('should be able to ping database', async () => {
    const admin = mongoose.connection.db?.admin();
    const ping = await admin?.ping();

    expect(ping?.ok).toBe(1);
  });
});
