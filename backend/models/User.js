import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: false,
  },
  provider: {
    type: String,
    default: 'local'
  },
  providerId: {
    type: String,
  },
  profilePicture: {
    type: String,
  }
}, { timestamps: true });

export default mongoose.model('User', userSchema);

