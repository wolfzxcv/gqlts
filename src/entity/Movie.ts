import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm'
import { Field, Int, ObjectType } from 'type-graphql'

@ObjectType()
@Entity()
export class Movie extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Field()
  @Column()
  title: string

  @Field(() => Int)
  @Column('int', { default: 60 })
  minutes: number
}
