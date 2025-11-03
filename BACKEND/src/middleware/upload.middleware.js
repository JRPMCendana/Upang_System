const multer = require('multer');
const { GridFSBucket } = require('mongodb');
const mongoose = require('mongoose');

// File filter - only allow PDF and images
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedMimes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and image files (JPEG, PNG, GIF, WEBP) are allowed.'), false);
  }
};

// File filter for quiz submissions - only allow images (screenshots)
const quizSubmissionFileFilter = (req, file, cb) => {
  // Allowed file types (only images for quiz submissions)
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only image files (JPEG, PNG, GIF, WEBP) are allowed for quiz submissions.'), false);
  }
};

// Configure multer to use memory storage (for GridFS)
const storage = multer.memoryStorage();

// Configure multer for general uploads (assignments, quiz documents)
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Configure multer for quiz submissions (images only)
const quizSubmissionUpload = multer({
  storage: storage,
  fileFilter: quizSubmissionFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Helper function to upload file to GridFS
const uploadToGridFS = async (file, filename, metadata = {}) => {
  const db = mongoose.connection.db;
  const bucket = new GridFSBucket(db, { bucketName: 'assignments' });

  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: file.mimetype,
      metadata: {
        originalName: file.originalname,
        uploadedAt: new Date(),
        ...metadata
      }
    });

    uploadStream.on('error', (error) => {
      reject(error);
    });

    uploadStream.on('finish', () => {
      resolve(uploadStream.id);
    });

    uploadStream.end(file.buffer);
  });
};

// Helper function to get file from GridFS
const getFileFromGridFS = async (fileId) => {
  const db = mongoose.connection.db;
  const bucket = new GridFSBucket(db, { bucketName: 'assignments' });

  return new Promise((resolve, reject) => {
    try {
      const objectId = new mongoose.Types.ObjectId(fileId);
      const downloadStream = bucket.openDownloadStream(objectId);

      const chunks = [];
      
      downloadStream.on('data', (chunk) => {
        chunks.push(chunk);
      });

      downloadStream.on('error', (error) => {
        if (error.message && error.message.includes('FileNotFound')) {
          reject(new Error('File not found in GridFS'));
        } else {
          reject(error);
        }
      });

      downloadStream.on('end', () => {
        const fileInfo = downloadStream.s;
        const fileData = Buffer.concat(chunks);
        resolve({
          buffer: fileData,
          contentType: fileInfo.contentType || 'application/octet-stream',
          metadata: fileInfo.metadata || {},
          filename: fileInfo.filename || 'file'
        });
      });
    } catch (error) {
      reject(new Error('Invalid file ID format'));
    }
  });
};

// Helper function to delete file from GridFS
const deleteFileFromGridFS = async (fileId) => {
  try {
    const db = mongoose.connection.db;
    const bucket = new GridFSBucket(db, { bucketName: 'assignments' });
    const objectId = new mongoose.Types.ObjectId(fileId);
    
    // Use promisify to convert callback to promise for better error handling
    return await new Promise((resolve, reject) => {
      bucket.delete(objectId, (error) => {
        if (error) {
          // Check if it's a "file not found" error
          const errorMessage = String(error.message || error || '');
          if (errorMessage.includes('File not found')) {
            console.log(`File ${fileId} not found in GridFS, treating as already deleted`);
            resolve(); // Success - file doesn't exist anyway
          } else {
            console.error(`Error deleting file ${fileId}:`, error);
            reject(error);
          }
        } else {
          console.log(`Successfully deleted file ${fileId} from GridFS`);
          resolve();
        }
      });
    });
  } catch (error) {
    // Catch any synchronous errors (invalid ObjectId, etc.)
    console.error('Error in deleteFileFromGridFS:', error);
    const errorMessage = String(error.message || error || '');
    if (errorMessage.includes('File not found') || errorMessage.includes('Invalid')) {
      return; // Treat as success if file not found or invalid ID
    }
    throw error; // Re-throw other errors
  }
};

module.exports = {
  upload,
  quizSubmissionUpload,
  uploadToGridFS,
  getFileFromGridFS,
  deleteFileFromGridFS
};

