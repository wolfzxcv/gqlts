import { BaseEntity } from 'typeorm'
import { Field, ObjectType } from 'type-graphql'
import { TimeList } from './TimeList'

@ObjectType({ description: '多筆,給前端的日期時間' })
export class Timetable extends BaseEntity {
  @Field()
  date: string

  @Field(() => [TimeList])
  timeList: TimeList[]
}
