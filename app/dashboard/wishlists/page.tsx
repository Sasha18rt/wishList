'use client';

import { useState } from 'react';
import UserProfileModal from '@/components/user/UserProfileModal';

export default function Page() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const friend = {
    name: 'Andriy',
    email: 'andriy@example.com',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    createdAt: '2024-12-01T10:30:00.000Z',
    username: 'andrik',
    role: 'friend',
    nickname: 'dr1k',
    googleId: '1234567890',
    instagramHandle: 'andrik_insta',
    premiumStatus: true,
    emailVerified: true,
  };

  return (
    <main className="p-4">
      <button className="btn btn-secondary" onClick={() => setIsModalOpen(true)}>
        Подивитись профіль друга
      </button>

      <UserProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={friend}
      />
    </main>
  );
}
