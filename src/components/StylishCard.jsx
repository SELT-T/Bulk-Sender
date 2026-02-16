import React from 'react';

const StylishCard = ({ title, value, icon, gradient }) => {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 shadow-xl ${gradient} border border-white/10 transition-transform hover:-translate-y-1 cursor-pointer`}>
      {/* Background glass effect element */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl"></div>
      
      <div className="relative z-10 flex justify-between items-start">
        <div>
          <p className="text-white/70 text-sm font-medium uppercase tracking-wider mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-white">{value}</h3>
        </div>
        <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm text-2xl shadow-inner">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StylishCard;