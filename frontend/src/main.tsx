import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './core'
import { initAuthSession } from './libs/api-client'
import { setInitialized } from './features/auth/services/auth.slices'
import { fetchMeThunk } from './features/auth/services/auth.thunk'
import './index.css'
import App from './App.tsx'
import "@fontsource/inter/400.css"; // Regular
import "@fontsource/inter/500.css"; // Medium
import "@fontsource/inter/600.css"; // SemiBold
import "@fontsource/inter/700.css"; // Bold

/**
 * Patch global pour empêcher React de crasher (Failed to execute 'removeChild' on 'Node')
 * à cause d'extensions navigateur comme Google Translate qui modifient le DOM en douce.
 */
if (typeof Node === 'function' && Node.prototype) {
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function<T extends Node>(this: Node, child: T): T {
    if (child.parentNode !== this) {
      console.warn('⚠️ DOM Node removed by external extension (e.g. Google Translate). React crash prevented.');
      return child;
    }
    return originalRemoveChild.call(this, child) as T;
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function<T extends Node>(this: Node, newNode: T, referenceNode: Node | null): T {
    if (referenceNode && referenceNode.parentNode !== this) {
      console.warn('⚠️ DOM Node inserted by external extension. React crash prevented.');
      return newNode;
    }
    return originalInsertBefore.call(this, newNode, referenceNode) as T;
  };
}

/**
 * Restaure la session au démarrage :
 * 1. Tente un refresh du token via le cookie HttpOnly
 * 2. Si succès → récupère le profil utilisateur
 * 3. Marque l'app comme initialisée (débloque les ProtectedRoutes)
 *
 * On attend que boot() se termine avant de rendre l'app
 * pour éviter le flash de redirection vers /login.
 */
async function boot() {
  try {
    const restored = await initAuthSession();
    if (restored) {
      try {
        await store.dispatch(fetchMeThunk());
      } catch {
        // Token refresh valide mais /me a échoué (compte désactivé etc.)
      }
    }
  } catch {
    // Erreur réseau — on laisse l'app s'initialiser sans session
  } finally {
    // Toujours marquer comme initialisé pour débloquer les routes
    store.dispatch(setInitialized());
  }
}

// On attend le boot AVANT de rendre l'app pour éviter le flash /login
boot().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </StrictMode>,
  );
});