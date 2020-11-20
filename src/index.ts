import 'reflect-metadata'
import { createConnection, getConnectionOptions } from 'typeorm'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'
import { HelloWorldResolver } from './resolvers/HelloWorldResolver'
import { MovieResolver } from './resolvers/MovieResolver'
import { UserResolver } from './resolvers/UserResolver'
;(async () => {
  const app = express()

  const options = await getConnectionOptions(process.env.NODE_ENV || 'development')

  await createConnection({ ...options, name: 'default' })
  console.log('database ok')

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloWorldResolver, MovieResolver, UserResolver],
      validate: true
    }),
    context: ({ req, res }) => ({ req, res })
  })
  console.log('apollo server ok')

  apolloServer.applyMiddleware({ app, cors: false })
  const defaultPort = 8081
  const port = process.env.PORT || defaultPort
  app.listen(port, () => {
    console.log(
      `server started at ${port === defaultPort ? `http://localhost:${defaultPort}/graphql` : process.env.PORT}`
    )
  })
})()
