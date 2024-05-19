import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcrypt';
import { appConfig } from './config/app.configuration';
import { Logger } from '@nestjs/common';

export async function handleFileUpload(
  directory: string,
  file: Express.Multer.File,
): Promise<string> {
  try {
    const uploadDir = `./${appConfig.mediaDir}/${directory}`;
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const targetPath = path.join(uploadDir, file.filename);

    // Move the file to the target directory
    await fs.promises.rename(file.path, targetPath);

    return `${appConfig.serverUrl}/${targetPath}`;
  } catch (err) {
    console.error('Error while saving file:', err);
    throw new Error('Internal server error');
  }
}

export async function hashPassword(password: string): Promise<string> {
  try {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    console.error('Error hashing password:', error);
    throw error; // Re-throw for proper error handling
  }
}

export async function verifyPassword(password: string, hash: string) {
  return await bcrypt.compare(password, hash);
}

export async function deleteAllFiles(folderPath: string) {
  const directory = path.join(folderPath);

  try {
    const files = await fs.promises.readdir(directory);
    const deletePromises = files.map((file) => {
      const filePath = path.join(directory, file);
      return fs.promises.unlink(filePath);
    });
    await Promise.all(deletePromises);
  } catch (error) {
    Logger.log('Files Deletion Error: ', error);
    throw new Error('Error deleting files');
  }
}

export async function deleteFile(folderPath: string, filename: string) {
  const directory = path.join(folderPath);
  const filePath = path.join(directory, filename);
  try {
    return await fs.promises.unlink(filePath);
  } catch (error) {
    Logger.log('File Deletion Error: ', error);
    throw new Error('Error deleting files');
  }
}
