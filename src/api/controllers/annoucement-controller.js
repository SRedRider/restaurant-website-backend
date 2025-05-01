const Announcement = require('../models/annoucement-model');

// Get all announcements
const getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.getAllAnnouncements();
    res.status(200).json(announcements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get an announcement by ID
const getAnnouncementById = async (req, res) => {
  const { id } = req.params;
  try {
    const announcement = await Announcement.getAnnouncementById(id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    res.status(200).json(announcement);
  } catch (error) {
    console.error('Error fetching announcement:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const addAnnouncement = async (req, res) => {
  const { title, content } = req.body;
  const image_url = req.file ? `/public/uploads/${req.file.filename}` : null;

  try {
    await Announcement.addAnnouncement(title, content, image_url);
    res.status(201).json({ message: 'Announcement added successfully', image_url });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add announcement' });
    console.error('Error adding announcement:', error); // Log the error for debugging
  }
};

const deleteAnnouncement = async (req, res) => {
  const { id } = req.params;
  try {
    await Announcement.deleteAnnouncement(id);
    res.status(200).json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
};

const editAnnouncement = async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  const image_url = req.file ? `/public/uploads/${req.file.filename}` : null;

  try {
    const currentAnnouncement = await Announcement.getAnnouncementById(id);
    if (!currentAnnouncement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    const finalImageUrl = image_url || currentAnnouncement.image_url;

    await Announcement.editAnnouncement(id, title, content, finalImageUrl);
    res.status(200).json({ message: 'Announcement updated successfully', image_url: finalImageUrl });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update announcement' });
    console.error('Error updating announcement:', error);
  }
};

module.exports = {
  addAnnouncement,
  deleteAnnouncement,
  editAnnouncement,
  getAllAnnouncements,
  getAnnouncementById
};