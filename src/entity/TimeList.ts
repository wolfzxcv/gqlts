import { BaseEntity } from 'typeorm'
import { Field, ObjectType } from 'type-graphql'

@ObjectType()
class Info extends BaseEntity {
  @Field()
  name: string

  @Field()
  tel: string

  @Field()
  remarks: string
}

@ObjectType()
export class TimeList extends BaseEntity {
  @Field()
  time: string

  @Field()
  isBooked: boolean

  @Field()
  info: Info
}
