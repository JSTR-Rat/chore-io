import { createContext } from 'react';
import { PropertyContextType } from './types';

export const PropertyContext = createContext<PropertyContextType>({
  propertyId: -1,
});
