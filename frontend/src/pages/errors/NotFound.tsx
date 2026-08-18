import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-lg">
        {/* Icône d'erreur (Boussole cassée / loupe) */}
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-benin-green/10 mb-8">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-benin-green">
            <circle cx="12" cy="12" r="10"/>
            <path d="M16 16s-1.5-2-4-2-4 2-4 2"/>
            <line x1="9" y1="9" x2="9.01" y2="9"/>
            <line x1="15" y1="9" x2="15.01" y2="9"/>
          </svg>
        </div>

        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Page introuvable</h2>
        
        <p className="text-gray-500 mb-8 text-lg">
          Oups ! La page que vous recherchez semble avoir été déplacée, supprimée ou n'a peut-être jamais existé.
        </p>

        <Link 
          to="/dashboard" 
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-benin-green hover:bg-benin-green-dark transition-colors duration-200 shadow-sm"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Retour à l'accueil
        </Link>
      </div>
      
      {/* Footer minimaliste pour la page d'erreur */}
      <div className="mt-16 text-sm text-gray-400">
        Plateforme Pro-Env — République du Bénin
      </div>
    </div>
  );
}

export default NotFound;