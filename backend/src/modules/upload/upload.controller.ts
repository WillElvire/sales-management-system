import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Param,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '../roles/entities/role.entity';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('payment-proof/:type')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.COMPTABLE)
  @UseInterceptors(FileInterceptor('file'))
  async uploadPaymentProof(
    @UploadedFile() file: any,
    @Param('type') type: string,
  ) {
    const filePath = await this.uploadService.saveFile(file, `payment-proofs/${type}`);
    return { filePath };
  }

  @Delete(':filePath')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN)
  async deleteFile(@Param('filePath') filePath: string) {
    await this.uploadService.deleteFile(filePath);
    return { message: 'File deleted successfully' };
  }
}

