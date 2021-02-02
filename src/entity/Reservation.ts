import { Entity, Column, BaseEntity, PrimaryColumn } from 'typeorm'
import { Field, ObjectType } from 'type-graphql'

@ObjectType({ description: '資料庫的日期時間' })
@Entity()
export class Reservation extends BaseEntity {
  @Field()
  @PrimaryColumn({ length: 10 })
  date: string

  @Field()
  @PrimaryColumn({ length: 5 })
  time: string

  @Field()
  @Column({ default: false })
  isBooked: boolean

  @Field({ nullable: true })
  @Column({ length: 20, nullable: true })
  name: string

  @Field({ nullable: true })
  @Column({ length: 20, nullable: true })
  tel: string

  @Field({ nullable: true })
  @Column({ length: 200, nullable: true })
  remarks: string
}
