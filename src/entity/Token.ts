import { BaseEntity } from 'typeorm'
import { Field, ObjectType } from 'type-graphql'

@ObjectType({ description: 'Token' })
export class Token extends BaseEntity {
  @Field()
  accessToken: string

  @Field()
  refreshToken: string
}
