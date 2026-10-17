const roomPhotoBySlug = {
  'classic-room': '/media/rooms/classic-room.webp',
  'executive-room': '/media/rooms/executive-room.webp',
  'deluxe-room': '/media/rooms/deluxe-room.webp',
  'super-royal': '/media/rooms/super-royal.webp',
  'apartment-amsterdams': '/media/rooms/apartment-amsterdams.webp',
};

export function getRoomPhoto(slug) {
  return typeof slug === 'string' ? roomPhotoBySlug[slug] || null : null;
}
