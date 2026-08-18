import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from '../core/store';

/** Dispatch typé avec les thunks de l'application */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/** Selector typé sur le state global */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;