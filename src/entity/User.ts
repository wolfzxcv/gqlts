import { Entity, PrimaryColumn, Column, BaseEntity } from 'typeorm'
import { Field, ObjectType } from 'type-graphql'

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field()
  @PrimaryColumn({
    length: 20
  })
  username: string

  @Field()
  @Column()
  password: string

  @Field()
  @Column({
    length: 50,
    unique: true
  })
  email: string

  @Field()
  @Column()
  imageURl: string

  @Field()
  @Column()
  age: number

  @Field()
  @Column('timestamp without time zone')
  createAt: string

  @Field()
  @Column('timestamp without time zone')
  updateAt: string
}
