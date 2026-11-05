import { useState } from 'react';

export default function UserCard({ user, onSelect }) {
  return (
    <div
      onClick={() => onSelect(user)}
      className="p-4 border rounded-lg hover:shadow-md cursor-pointer transition"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {user.profilePicture ? (
            <img
              src={user.profilePicture}
              alt={user.username}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
              {user.username[0].toUpperCase()}
            </div>
          )}
          <div>
            <h3 className="font-semibold">{user.username}</h3>
            <p className="text-sm text-textSecondary">{user.mobile}</p>
          </div>
        </div>
        <div
          className={`w-3 h-3 rounded-full ${
            user.isOnline ? 'bg-secondary' : 'bg-gray-400'
          }`}
        />
      </div>
      {user.bio && <p className="text-sm text-textSecondary mt-2">{user.bio}</p>}
    </div>
  );
}
