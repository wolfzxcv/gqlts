import { BaseEntity } from 'typeorm'
import { Field, ObjectType } from 'type-graphql'

@ObjectType()
export class Token extends BaseEntity {
  @Field()
  accessToken: string

  @Field()
  refreshToken: string
}
