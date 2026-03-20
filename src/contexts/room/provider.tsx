import { RoomContext } from './context';

export interface RoomProviderProps {
  roomId: number;
  children: React.ReactNode;
}

export const RoomProvider = ({ roomId, children }: RoomProviderProps) => {
  return (
    <RoomContext.Provider value={{ roomId }}>{children}</RoomContext.Provider>
  );
};
