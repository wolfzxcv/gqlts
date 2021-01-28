import { Resolver, Mutation, Arg, Query, InputType, Field } from 'type-graphql'
import { Reservation, Timetable } from '../entity'
import { UserInputError } from 'apollo-server-express'

@InputType()
class InfoInput {
  @Field()
  name: string

  @Field()
  tel: string

  @Field()
  remarks: string
}

@InputType()
class TimeListInput {
  @Field()
  time: string

  @Field()
  isBooked: boolean

  @Field()
  info: InfoInput
}

@InputType({ description: '給API的日期時間格式' })
class ReservationInput {
  @Field(() => String)
  date: string

  @Field(() => [TimeListInput])
  timeList: TimeListInput[]
}

@Resolver()
export class ReservationResolver {
  private toFrontend(dataFromDatabase: Reservation[]): ReservationInput[] {
    console.log(dataFromDatabase)
    return []
  }

  private toDatabase(dataFromFrontend: ReservationInput[]): Reservation[] {
    const output = [] as Reservation[]

    for (let i = 0; i < dataFromFrontend.length; i++) {
      for (let j = 0; j < dataFromFrontend[i].timeList.length; j++) {
        const isBooked = dataFromFrontend[i].timeList[j].isBooked
        const singleData = {
          date: dataFromFrontend[i].date,
          time: dataFromFrontend[i].timeList[j].time,
          isBooked
        } as Reservation

        if (isBooked) {
          const name = dataFromFrontend[i].timeList[j].info?.name || undefined
          const tel = dataFromFrontend[i].timeList[j].info?.tel || undefined
          const remarks = dataFromFrontend[i].timeList[j].info?.remarks || undefined

          if (name) {
            singleData.name = name
          }

          if (tel) {
            singleData.tel = tel
          }

          if (remarks) {
            singleData.remarks = remarks
          }

          if (name === undefined || tel === undefined || remarks === undefined) {
            throw new UserInputError('Reservation data error', { errors: 'info is needed' })
          }
        }

        output.push(singleData)
      }
    }
    return output
  }

  @Mutation(() => String)
  async createReservations(@Arg('options', () => [ReservationInput]) options: ReservationInput[]) {
    try {
      const saveData = this.toDatabase(options)

      await Reservation.delete(Reservation)
      console.log(saveData)

      await Reservation.save(saveData)

      return 'Reservation saved successfully'
    } catch (e) {
      console.log(e)
      throw new UserInputError('createReservation error', { errors: e })
    }
  }

  @Mutation(() => String)
  async updateReservation(
    @Arg('date', () => String) date: string,
    @Arg('input', () => ReservationInput) input: ReservationInput
  ) {
    try {
      console.log(input)
      await Reservation.delete({ date })
      // TODO  符合該天的值都要刪除,再寫入新的timeList,其餘不更動
      return `${date} updated successfully`
    } catch (e) {
      console.error(e)
      throw new UserInputError('updateReservation error', { errors: e })
    }
  }

  @Query(() => [Timetable])
  async reservations() {
    try {
      const output = await Reservation.find()

      return this.toFrontend(output)
    } catch (e) {
      console.error(e)
      throw new UserInputError('Fetch reservations error', { errors: e })
    }
  }

  @Query(() => Timetable)
  async reservation(@Arg('date', () => String) date: ReservationInput['date']) {
    try {
      const output = await Reservation.find({ date })

      return this.toFrontend(output)
    } catch (e) {
      console.error(e)
      throw new UserInputError('Fetch reservation error', { errors: e })
    }
  }
}
