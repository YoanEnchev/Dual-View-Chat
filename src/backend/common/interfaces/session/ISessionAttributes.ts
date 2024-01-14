import { SessionData } from 'express-session';
import { User } from 'src/backend/features/user/user.entity';

// Extend the SessionData interface
interface ISessionAttributes extends SessionData {
  user?: User,
  accessToken?: string,
}

export { ISessionAttributes };