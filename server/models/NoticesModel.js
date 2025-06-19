import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    filePath: { type: String, default: null },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    issueDate: { type: Date, default: null },
    publishDate: { type: Date, default: null },
}, {
    timestamps: true,
});

noticeSchema.index({ createdAt: -1 });

const NoticeModel = mongoose.models.notices || mongoose.model('notices', noticeSchema);

export default NoticeModel;