import app from './app';
import dotenv from 'dotenv';
import { initSequelize } from './models/index';

dotenv.config();

const port = process.env.PORT || 3000;


async function bootstrap() {
  try {
    await initSequelize();

    app.listen(port, () => {
      console.log(`✅ API running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error('❌ Startup error:', err);
    process.exit(1);
  }
}

bootstrap();