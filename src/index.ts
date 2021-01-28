import 'reflect-metadata'
import { createConnection, getConnectionOptions } from 'typeorm'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'
import { HelloWorldResolver } from './resolvers/HelloWorldResolver'
import { ReservationResolver } from './resolvers/ReservationResolver'
import { UserResolver } from './resolvers/UserResolver'
;(async () => {
  const app = express()

  try {
    const options = await getConnectionOptions(process.env.NODE_ENV || 'development')

    await createConnection({ ...options, name: 'default', synchronize: true })
    console.log('database ok')
  } catch (e) {
    console.log(e)
    console.log('database connection failed!')
  }

  try {
    const apolloServer = new ApolloServer({
      introspection: true,
      playground: true,
      tracing: true,
      schema: await buildSchema({
        resolvers: [HelloWorldResolver, ReservationResolver, UserResolver],
        validate: true
      }),
      context: ({ req, res }) => ({ req, res })
    })
    console.log('apollo server ok')

    apolloServer.applyMiddleware({ app, cors: false })
  } catch (e) {
    console.log(e)
    console.log('apollo server execution failed!')
  }

  const defaultPort = 8081
  const port = process.env.PORT || defaultPort
  const address =
    process.env.NODE_ENV === 'production' && process.env.BASE_URL
      ? `${process.env.BASE_URL}:${port}/graphql`
      : `http://localhost:${port}/graphql`
  app.listen(port, () => {
    console.log(`server started at ${address}`)
  })
})()
