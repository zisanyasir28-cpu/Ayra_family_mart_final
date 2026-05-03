import multer from 'multer';
import { ApiError } from '../utils/ApiError';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]);

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const storage = multer.memoryStorage();

const imageFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        'VALIDATION_ERROR',
        `Unsupported file type "${file.mimetype}". Allowed: JPEG, PNG, WebP.`,
      ),
    );
  }
};

const baseOptions: multer.Options = {
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: MAX_FILE_SIZE },
};

export const uploadSingle = multer(baseOptions).single('image');
export const uploadMultiple = multer(baseOptions).array('images', 8);

export type MulterFile = Express.Multer.File;
