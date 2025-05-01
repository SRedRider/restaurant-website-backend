const db = require('../../utils/database');
const moment = require('moment-timezone');

const addAnnouncement = async (title, content, image_url) => {
  const query = 'INSERT INTO announcements (title, content, image_url) VALUES (?, ?, ?)';
  const [result] = await db.query(query, [title, content, image_url]);
  return result.insertId;
};

const deleteAnnouncement = async (id) => {
  const query = 'DELETE FROM announcements WHERE id = ?';
  await db.query(query, [id]);
};

const editAnnouncement = async (id, title, content, image_url) => {
  const query = 'UPDATE announcements SET title = ?, content = ?, image_url = ?, updated_at = NOW() WHERE id = ?';
  await db.query(query, [title, content, image_url, id]);
};

const getAllAnnouncements = async () => {
  const query = 'SELECT * FROM announcements ORDER BY created_at DESC';
  const [rows] = await db.query(query);

  return rows.map((announcement) => {
    if (announcement.created_at) {
      announcement.created_at = moment
        .utc(announcement.created_at)
        .tz('Europe/Helsinki')
        .format('YYYY-MM-DD HH:mm:ss');
    }
    if (announcement.updated_at) {
      announcement.updated_at = moment
        .utc(announcement.updated_at)
        .tz('Europe/Helsinki')
        .format('YYYY-MM-DD HH:mm:ss');
    }
    return announcement;
  });
};

const getAnnouncementById = async (id) => {
  const query = 'SELECT * FROM announcements WHERE id = ?';
  const [rows] = await db.query(query, [id]);
  if (rows.length === 0) return null;

  const announcement = rows[0];
  if (announcement.created_at) {
    announcement.created_at = moment
      .utc(announcement.created_at)
      .tz('Europe/Helsinki')
      .format('YYYY-MM-DD HH:mm:ss');
  }
  if (announcement.updated_at) {
    announcement.updated_at = moment
      .utc(announcement.updated_at)
      .tz('Europe/Helsinki')
      .format('YYYY-MM-DD HH:mm:ss');
  }
  return announcement;
};

module.exports = {
  addAnnouncement,
  deleteAnnouncement,
  editAnnouncement,
  getAllAnnouncements,
  getAnnouncementById,
};