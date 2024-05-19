import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';

const multerDisk = diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = './temp_upload';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

export const multerConfig: MulterOptions = {
  storage: multerDisk,
};

//TODO: await fs.unlink(filePath); Write a cron job to clear all temp files every day
