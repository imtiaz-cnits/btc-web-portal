import mongoose from 'mongoose';

const winnerListSchema = new mongoose.Schema({
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

winnerListSchema.index({ createdAt: -1 });

const WinnerListModel = mongoose.models.winnerList || mongoose.model('winnerList', winnerListSchema);

export default WinnerListModel;