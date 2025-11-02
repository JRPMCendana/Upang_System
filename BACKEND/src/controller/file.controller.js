const { getFileFromGridFS } = require('../middleware/upload.middleware');

class FileController {
  static async getFile(req, res, next) {
    try {
      const { fileId } = req.params;

      if (!fileId) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'File ID is required'
        });
      }

      const file = await getFileFromGridFS(fileId);

      res.setHeader('Content-Type', file.contentType);
      res.setHeader('Content-Disposition', `inline; filename="${file.filename || file.metadata?.originalName || 'file'}"`);
      
      res.send(file.buffer);
    } catch (error) {
      if (error.message && error.message.includes('FileNotFound')) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'File not found'
        });
      }
      next(error);
    }
  }
}

module.exports = FileController;

