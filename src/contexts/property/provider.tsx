import { PropertyContext } from './context';

export interface PropertyProviderProps {
  propertyId: number;
  children: React.ReactNode;
}

export const PropertyProvider = ({
  propertyId,
  children,
}: PropertyProviderProps) => {
  return (
    <PropertyContext.Provider value={{ propertyId }}>
      {children}
    </PropertyContext.Provider>
  );
};
