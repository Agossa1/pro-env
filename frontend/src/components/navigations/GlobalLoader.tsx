

export default function GlobalLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/80 backdrop-blur-sm">
      <div className="relative flex items-center justify-center w-20 h-20 mb-6">
        {/* Anneaux aux couleurs du Bénin */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#008751] animate-spin [animation-duration:1.5s] [animation-timing-function:cubic-bezier(0.68,-0.55,0.265,1.55)]" />
        <div className="absolute inset-2 rounded-full border-4 border-transparent border-r-[#FCD116] animate-spin [animation-duration:2s] [animation-timing-function:cubic-bezier(0.68,-0.55,0.265,1.55)] [animation-direction:reverse]" />
        <div className="absolute inset-4 rounded-full border-4 border-transparent border-b-[#E8112D] animate-spin [animation-duration:1.2s] [animation-timing-function:cubic-bezier(0.68,-0.55,0.265,1.55)]" />
        
        {/* Coeur pulsant */}
        <div className="w-3 h-3 bg-[#008751] rounded-full animate-pulse shadow-md" />
      </div>
      
      <div className="flex flex-col items-center gap-1.5">
        <h2 className="text-lg font-bold text-gray-800 tracking-wider">SIGIE</h2>
        <div className="flex items-center gap-1 text-lg  text-gray-400 ">
          <span>Chargement</span>
          <span className="flex gap-0.5">
            <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" />
          </span>
        </div>
      </div>
    </div>
  );
}
