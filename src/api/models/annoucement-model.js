const db = require('../../utils/database');
const moment = require('moment-timezone');

const addAnnouncement = async (title, content, image_url, visible, added_by) => {
  const query = 'INSERT INTO announcements (title, content, image_url, visible, added_by) VALUES (?, ?, ?, ?, ?)';
  const [result] = await db.query(query, [title, content, image_url, visible, added_by]);
  return result.insertId;
};

const deleteAnnouncement = async (id) => {
  const query = 'DELETE FROM announcements WHERE id = ?';
  await db.query(query, [id]);
};

const editAnnouncement = async (id, title, content, image_url, visible, updated_by) => {
  const query = 'UPDATE announcements SET title = ?, content = ?, image_url = ?, visible = ?, updated_by = ? WHERE id = ?';
  await db.query(query, [title, content, image_url, visible, updated_by, id]);
};

const getAllAnnouncements = async (isAdmin) => {
  let query = 'SELECT * FROM announcements';

  // If not admin, only return announcements that are visible
  if (!isAdmin) {
    query += " WHERE visible = 'yes'";
  }

  query += ' ORDER BY created_at DESC';

  const [rows] = await db.query(query);

  return rows.map((announcement) => {
    if (!isAdmin) {
      // Remove admin-specific fields for non-admin users
      delete announcement.visible;
      delete announcement.created_at;
      delete announcement.updated_at;
      delete announcement.added_by; // Don't expose the added_by field to non-admins
      delete announcement.updated_by; // Don't expose the updated_by field to non-admins
    }
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

const getAnnouncementById = async (id, isAdmin) => {
  let query = 'SELECT * FROM announcements WHERE id = ?';

  // If not admin, ensure the announcement is visible
  if (!isAdmin) {
    query += " AND visible = 'yes'";
  }

  const [rows] = await db.query(query, [id]);
  if (rows.length === 0) return null;

  const announcement = rows[0];
  if (!isAdmin) {
    // Remove admin-specific fields for non-admin users
    delete announcement.visible;
    delete announcement.created_at;
    delete announcement.updated_at;
    delete announcement.added_by; // Don't expose the added_by field to non-admins
    delete announcement.updated_by; // Don't expose the updated_by field to non-admins
  }
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