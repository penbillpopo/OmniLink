import {
  Controller,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { randomUUID } from 'crypto';
import { Request } from 'express';
import { Errors } from '@ay-gosu/util/errors';

const uploadDir = join(process.cwd(), 'uploads');
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

@Controller('api/uploads')
export class UploadController {
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: uploadDir,
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname) || '.jpg';
          cb(null, `${randomUUID()}${ext}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          cb(new Errors.UPDATE_FAILED('僅支援上傳圖片檔案'), false);
        } else {
          cb(null, true);
        }
      },
    }),
  )
  public upload(
    @UploadedFile() file: any,
    @Req() req: Request,
  ) {
    if (!file) {
      throw new Errors.UPDATE_FAILED('請選擇要上傳的圖片');
    }

    const origin = `${req.protocol}://${req.get('host')}`;
    const relativeUrl = `/uploads/${file.filename}`;

    return {
      url: `${origin}${relativeUrl}`,
      path: relativeUrl,
      filename: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
    };
  }
}
