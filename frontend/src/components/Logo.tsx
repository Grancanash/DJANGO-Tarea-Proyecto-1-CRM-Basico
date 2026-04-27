const Logo = () => (
  <div className="flex items-center gap-2">
    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
      <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
      <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
      <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
      <path d="M10 6.5H14M6.5 10V14M14 17.5H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
    <span className="text-xl font-black tracking-tighter text-primary">
      BASIC<span className="font-light text-gray-400 uppercase ml-1 tracking-widest text-xs">CRM</span>
    </span>
  </div>
);

export default Logo;