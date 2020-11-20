import { Entity, PrimaryColumn, Column, BaseEntity } from 'typeorm'
import { Field, ObjectType } from 'type-graphql'

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field()
  @PrimaryColumn()
  username: string

  @Field()
  @Column()
  email: string

  @Field()
  @Column()
  firstName: string

  @Field()
  @Column()
  lastName: string

  @Field()
  @Column()
  age: number
}
