const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// ====================== CONFIGURATION CLOUDINARY ======================
// Variables d'environnement requises (.env local + dashboard Render) :
//   CLOUDINARY_CLOUD_NAME
//   CLOUDINARY_API_KEY
//   CLOUDINARY_API_SECRET
if (!process.env.CLOUDINARY_CLOUD_NAME) {
  console.warn('⚠️  CLOUDINARY_CLOUD_NAME manquant : les uploads échoueront.');
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// ====================== FABRIQUE DE MIDDLEWARE UPLOAD ======================
// Renvoie un middleware multer qui pousse directement vers Cloudinary.
// Le type de ressource est déterminé selon le mimetype :
//   - image/*  → 'image'
//   - video/*  → 'video'
//   - autres (PDF…) → 'raw'
// Après upload, `file.path` contient l'URL sécurisée (secure_url) à stocker en base.
function makeUpload(folder, options = {}) {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: (req, file) => {
      const isImage = file.mimetype.startsWith('image/');
      const isVideo = file.mimetype.startsWith('video/');
      const resourceType = isImage ? 'image' : isVideo ? 'video' : 'raw';

      return {
        folder: `sencsu/${folder}`,
        resource_type: resourceType,
        // Nom unique, on conserve l'extension d'origine pour les fichiers raw (PDF).
        public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`
      };
    }
  });

  return multer({
    storage,
    limits: options.limits || { fileSize: 10 * 1024 * 1024 }, // 10 Mo par défaut
    fileFilter: options.fileFilter
  });
}

module.exports = { cloudinary, makeUpload };
