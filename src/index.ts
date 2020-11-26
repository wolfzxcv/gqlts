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
      schema: await buildSchema({
        resolvers: [HelloWorldResolver, MovieResolver, UserResolver],
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
  app.listen(port, () => {
    console.log(
      `server started at ${port === defaultPort ? `http://localhost:${defaultPort}/graphql` : process.env.PORT}`
    )
  })
})()
