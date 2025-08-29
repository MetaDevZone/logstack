import { saveApiLog, getApiLogs, createApiLogMiddleware, getApiLogsByHour } from '../src/apiLogs';
import { init } from '../index';

async function apiLogExample() {
  await init({
    dbUri: 'mongodb://localhost:27017/cronlog',
    uploadProvider: 'local',
    fileFormat: 'json',
  });

  // Example: Save an API log manually
  await saveApiLog({
    method: 'GET',
    path: '/api/users',
    requestBody: {},
    responseStatus: 200,
    client_ip: '192.168.1.1',
    client_agent: 'Mozilla/5.0...',
    responseBody: { users: [] },
  });

  // Example: Fetch API logs with filters
  const logs = await getApiLogs({
    method: 'GET',
    startDate: new Date('2025-08-25T00:00:00Z'),
    endDate: new Date('2025-08-25T23:59:59Z'),
    limit: 50,
  });

  console.log('API Logs:', logs);

  // Example: Get logs for a specific hour
  const hourLogs = await getApiLogsByHour('2025-08-25', '09-10');
  console.log('Hour logs:', hourLogs);
}

// Example Express middleware usage:
/*
import express from 'express';
const app = express();

// Use the API logging middleware
app.use(createApiLogMiddleware());

app.get('/api/test', (req, res) => {
  res.json({ message: 'Hello World' });
});

app.listen(3000);
*/

apiLogExample();
