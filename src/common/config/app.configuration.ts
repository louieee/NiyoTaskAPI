export const appConfig = {
  serverUrl: `http://localhost:${process.env.PORT || 3000}`,
  frontendUrl: 'http://localhost:3001',
  mediaDir: 'uploads',
  corsOrigins: ['http://localhost:3100'],
  corsAllowedMethods: 'GET,POST,PUT,DELETE,OPTIONS',
  corsAllowedHeaders: ['Content-Type', 'Authorization'],
  corsAllowCredentials: true,
};
