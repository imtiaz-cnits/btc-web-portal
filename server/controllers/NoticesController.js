import NoticesModel from "../models/NoticesModel.js";

// Create a new notice
export const createNotice = async (req, res) => {
    try {
        const { title, content, status, issueDate, publishDate } = req.body;
        const file = req.file;

        if (!req.user || !req.user._id) {
            console.log('req.user or req.user._id is undefined:', req.user);
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }

        if (!title || !content) {
            return res.status(400).json({ success: false, message: 'Title and content are required' });
        }

        const noticeData = {
            title,
            content,
            status: status || 'active',
            createdBy: req.user._id,
            issueDate: issueDate ? new Date(issueDate) : null,
            publishDate: publishDate ? new Date(publishDate) : null,
        };

        if (file) {
            noticeData.filePath = `/uploads/${file.filename}`;
        }

        const notice = await NoticesModel.create(noticeData);

        res.status(201).json({ success: true, notice });
    } catch (error) {
        console.error('Create notice error:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: error.message, errors: error.errors });
        }
        res.status(500).json({ success: false, message: 'Failed to create notice' });
    }
};

// Read all notices
export const viewNotice = async (req, res) => {
    try {
        const notices = await NoticesModel.find()
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, notices });
    } catch (error) {
        console.error('Get notices error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch notices' });
    }
};

// Read a single notice by ID (NEW)
export const getNoticeById = async (req, res) => {
    try {
        const { id } = req.params;
        const notice = await NoticesModel.findById(id).populate('createdBy', 'name email');
        if (!notice) {
            return res.status(404).json({ success: false, message: 'Notice not found' });
        }
        res.status(200).json({ success: true, notice });
    } catch (error) {
        console.error('Get notice by ID error:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: 'Invalid notice ID' });
        }
        res.status(500).json({ success: false, message: 'Failed to fetch notice' });
    }
};

// Update an existing notice
export const updateNotice = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, status, issueDate, publishDate } = req.body;
        const file = req.file;

        if (!req.user || !req.user._id) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }

        const updateData = {
            title,
            content,
            status,
            issueDate: issueDate ? new Date(issueDate) : undefined,
            publishDate: publishDate ? new Date(publishDate) : undefined,
        };

        if (file) {
            updateData.filePath = `/uploads/${file.filename}`;
        }

        const notice = await NoticesModel.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!notice) {
            return res.status(404).json({ success: false, message: 'Notice not found' });
        }

        res.status(200).json({ success: true, notice });
    } catch (error) {
        console.error('Update notice error:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: error.message, errors: error.errors });
        }
        res.status(500).json({ success: false, message: 'Failed to update notice' });
    }
};

// Delete a notice
export const deleteNotice = async (req, res) => {
    try {
        const { id } = req.params;

        if (!req.user || !req.user._id) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }

        const notice = await NoticesModel.findByIdAndDelete(id);

        if (!notice) {
            return res.status(404).json({ success: false, message: 'Notice not found' });
        }

        res.status(200).json({ success: true, message: 'Notice deleted successfully' });
    } catch (error) {
        console.error('Delete notice error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete notice' });
    }
};