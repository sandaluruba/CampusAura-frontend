const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

/**
 * Upload a single File to Cloudinary.
 *
 * @param {File}     file       - The image File to upload
 * @param {string}   folder     - Cloudinary sub-folder, e.g. 'events' | 'products'
 * @param {Function} onProgress - Optional (percent: number) => void
 * @returns {Promise<string>}   - Resolves with the secure HTTPS URL
 */
export async function uploadFile(file, folder = 'uploads', onProgress) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', `campusaura/${folder}`);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', UPLOAD_URL);

    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      });
    }

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const result = JSON.parse(xhr.responseText);
        resolve(result.secure_url); // always HTTPS
      } else {
        reject(new Error(`Cloudinary upload failed: ${xhr.status} ${xhr.responseText}`));
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
    xhr.send(formData);
  });
}

/**
 * Upload multiple Files in parallel.
 *
 * @param {File[]}   files      - Array of File objects
 * @param {string}   folder     - Cloudinary sub-folder
 * @param {Function} onProgress - Optional overall progress (0-100)
 * @returns {Promise<string[]>} - Array of secure URLs (same order as files)
 */
export async function uploadFiles(files, folder = 'uploads', onProgress) {
  if (!files || files.length === 0) return [];

  const total = files.length;
  const progresses = new Array(total).fill(0);

  const updateOverall = () => {
    if (onProgress) {
      onProgress(Math.round(progresses.reduce((a, b) => a + b, 0) / total));
    }
  };

  const uploads = files.map((file, i) =>
    uploadFile(file, folder, (pct) => {
      progresses[i] = pct;
      updateOverall();
    })
  );

  return Promise.all(uploads);
}
