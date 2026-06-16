import React from "react";

export default function KidCard({ kid, navigate }) {
  return (
    <button
      key={kid._id}
      onClick={() => navigate(`/client/kid-profile?kidId=${kid._id}`)}
      className="bg-white p-4 rounded-3xl soft-shadow flex flex-col items-center text-center border border-outline-variant/30 hover:shadow-lg active:scale-95 transition-all"
    >
      <div className="w-16 h-16 rounded-full overflow-hidden mb-3 border-2 border-primary-fixed">
        <img
          src={
            kid.avatar ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${kid.fullName}`
          }
          alt={kid.fullName}
          className="w-full h-full object-cover"
        />
      </div>
      <h3 className="font-bold text-on-surface text-sm">{kid.fullName}</h3>
    </button>
  );
}
