import { type IUser } from "../src/models/User.model.js";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}
