import { createContext } from 'react';
import { RoomContextType } from './types';

export const RoomContext = createContext<RoomContextType>({
  roomId: -1,
});
