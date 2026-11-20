import { cloudinary } from '../config/cloudinary.js';
import AppError from '../utils/AppError.js';

const uploadBuffer = (buffer) => new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream(
    {
      folder: 'personal-finance-tracker/profile-pictures',
      resource_type: 'image',
      transformation: [{ width: 500, height: 500, crop: 'limit' }]
    },
    (error, result) => {
      if (error) return reject(error);
      resolve(result);
    }
  );

  stream.end(buffer);
});

export const uploadProfilePicture = async (req, res) => {
  if (!req.file) throw new AppError('Please attach an image using the "profilePicture" field.', 400);

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new AppError('Profile-picture storage is not configured on the server.', 503);
  }

  const previousPublicId = req.user.profilePicturePublicId;
  const result = await uploadBuffer(req.file.buffer);

  req.user.profilePictureUrl = result.secure_url;
  req.user.profilePicturePublicId = result.public_id;
  await req.user.save();

  if (previousPublicId) {
    try {
      await cloudinary.uploader.destroy(previousPublicId, { resource_type: 'image' });
    } catch (error) {
      console.error('Could not remove the previous profile image:', error.message);
    }
  }

  res.status(200).json({
    status: 'success',
    message: 'Profile picture uploaded successfully.',
    data: {
      profilePictureUrl: req.user.profilePictureUrl
    }
  });
};
