import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  private uploadPath: string;

  constructor(private configService: ConfigService) {
    this.uploadPath = this.configService.get('UPLOAD_DEST', './uploads');
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async saveFile(file: any, subfolder?: string): Promise<string> {
    const folder = subfolder ? path.join(this.uploadPath, subfolder) : this.uploadPath;
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    const timestamp = Date.now();
    const filename = `${timestamp}-${file.originalname}`;
    const filepath = path.join(folder, filename);

    fs.writeFileSync(filepath, file.buffer);

    return path.relative(this.uploadPath, filepath).replace(/\\/g, '/');
  }

  async deleteFile(filePath: string): Promise<void> {
    const fullPath = path.join(this.uploadPath, filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }

  getFilePath(relativePath: string): string {
    return path.join(this.uploadPath, relativePath);
  }
}

