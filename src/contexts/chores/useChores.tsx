import { useContext } from 'react';
import { ChoresContext } from './context';

export const useChores = () => {
  const context = useContext(ChoresContext);
  if (!context) {
    throw new Error('useChores must be used within a ChoresProvider');
  }
  return context;
};
