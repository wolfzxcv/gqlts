import { Request, Response } from 'express'
type Info = {
  username: string
  role: string
  iat: string
  exp: string
}
export interface MyContext {
  req: Request & { info: Info }
  res: Response
}
