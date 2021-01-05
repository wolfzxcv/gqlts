import { MyContext } from '@types'
import { MiddlewareFn } from 'type-graphql'
import jwt from 'jsonwebtoken'

export const isAuth: MiddlewareFn<MyContext> = async ({ context }, next) => {
  const authHeader = context.req.headers?.authorization
  const token = authHeader ? authHeader.substring(authHeader.indexOf('Bearer ') + 7) || null : null
  if (token) {
    await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET! as string, err => {
      if (err) {
        throw new Error('token is illegal')
      }

      return next()
    })
  } else {
    throw new Error('not authenticated')
  }
}
