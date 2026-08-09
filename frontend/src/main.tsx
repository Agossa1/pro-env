import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './core'
import { initAuthSession } from './libs/api-client'
import { setInitialized } from './features/auth/services/auth.slices'
import { fetchMeThunk } from './features/auth/services/auth.thunk'
import './index.css'
import App from './App.tsx'

/**
 * Restaure la session au démarrage :
 * 1. Tente un refresh du token via le cookie HttpOnly
 * 2. Si succès → récupère le profil utilisateur
 * 3. Marque l'app comme initialisée (débloque les ProtectedRoutes)
 */
async function boot() {
  const restored = await initAuthSession();
  if (restored) {
    try {
      await store.dispatch(fetchMeThunk());
    } catch {
      // Session invalide — l'utilisateur sera redirigé vers /login
    }
  }
  store.dispatch(setInitialized());
}

boot();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)