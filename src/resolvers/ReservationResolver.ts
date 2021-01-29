import { Resolver, Mutation, Arg, Query, InputType, Field } from 'type-graphql'
import { Reservation, Timetable } from '../entity'
import { UserInputError } from 'apollo-server-express'
import { IsBoolean, MaxLength } from 'class-validator'

@InputType()
class InfoInput {
  @MaxLength(20)
  @Field({ nullable: true })
  name: string

  @MaxLength(20)
  @Field({ nullable: true })
  tel: string

  @MaxLength(200)
  @Field({ nullable: true })
  remarks: string
}

@InputType()
class TimeListInput {
  @Field()
  @MaxLength(5)
  time: string

  @Field()
  @IsBoolean()
  isBooked: boolean

  @Field({ nullable: true })
  info: InfoInput
}

@InputType({ description: 'create,給API的日期時間格式' })
class ReservationsInput {
  @Field(() => String)
  @MaxLength(10)
  date: string

  @Field(() => [TimeListInput])
  timeList: TimeListInput[]
}

@InputType({ description: 'update,給API的日期時間格式' })
class ReservationInput {
  @Field(() => String)
  @MaxLength(10)
  date: string

  @Field()
  @MaxLength(5)
  time: string

  @Field()
  @IsBoolean()
  isBooked: boolean

  @MaxLength(20)
  @Field({ nullable: true })
  name: string

  @MaxLength(20)
  @Field({ nullable: true })
  tel: string

  @MaxLength(200)
  @Field({ nullable: true })
  remarks: string
}

@Resolver()
export class ReservationResolver {
  infoIsNeeded: UserInputError = new UserInputError('Reservation data error', {
    errors: 'If isBooked is true, info is needed'
  })

  private toFrontend(dataFromDatabase: Reservation[]): ReservationsInput[] {
    const result = [] as ReservationsInput[]
    dataFromDatabase.map(each => {
      const timeList = {
        time: each.time,
        isBooked: each.isBooked,
        info: {
          name: each.name || '',
          tel: each.tel || '',
          remarks: each.remarks || ''
        }
      } as TimeListInput
      const condition = result.find(x => x.date === each.date)
      if (condition) {
        return condition.timeList.push(timeList)
      } else {
        const newData = { date: each.date, timeList: [timeList] }
        return result.push(newData)
      }
    })

    return result
  }

  private toDatabase(dataFromFrontend: ReservationsInput[]): Reservation[] {
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

          // 如果isBooked為true,一定要有這三個資訊
          if (!name || !tel || !remarks) {
            throw this.infoIsNeeded
          }
        }

        output.push(singleData)
      }
    }
    return output
  }

  @Mutation(() => String)
  async createReservations(@Arg('options', () => [ReservationsInput]) options: ReservationsInput[]) {
    try {
      if (options.length) {
        const saveData = this.toDatabase(options)

        await Reservation.createQueryBuilder().delete().from(Reservation).execute()

        await Reservation.save(saveData)

        return 'Reservation saved successfully'
      } else {
        throw new UserInputError('createReservation error', { errors: 'Options.length is 0' })
      }
    } catch (e) {
      console.log(e)
      throw new UserInputError('createReservation error', { errors: e })
    }
  }

  @Mutation(() => String)
  async updateReservation(@Arg('input', () => ReservationInput) input: ReservationInput) {
    try {
      const date = input.date
      const time = input.time

      const isExist = await Reservation.findOne({ date, time })

      if (isExist) {
        const isBooked = input.isBooked

        const updateData = { ...isExist, ...input }

        if (isBooked) {
          const hasName = input.name || isExist.name || undefined
          const hasTel = input.tel || isExist.tel || undefined
          const hasRemarks = input.remarks || isExist.remarks || undefined
          if (!hasName || !hasTel || !hasRemarks) {
            throw this.infoIsNeeded
          }
        } else {
          updateData.name = ''
          updateData.tel = ''
          updateData.remarks = ''
        }

        await Reservation.update({ date, time }, updateData)

        return `${date} ${time}`
      } else {
        throw new UserInputError('updateReservation error', { errors: 'No result' })
      }
    } catch (e) {
      console.error(e)
      throw new UserInputError('updateReservation error', { errors: e })
    }
  }

  @Query(() => [Timetable])
  async reservations() {
    try {
      const output = await Reservation.find({ order: { date: 1, time: 1 } })
      if (output.length) {
        return this.toFrontend(output)
      } else {
        return []
      }
    } catch (e) {
      console.error(e)
      throw new UserInputError('Fetch reservations error', { errors: e })
    }
  }

  @Query(() => Reservation)
  async reservation(
    @Arg('date', () => String) date: ReservationInput['date'],
    @Arg('time', () => String) time: ReservationInput['time']
  ) {
    try {
      const output = await Reservation.findOne({ date, time })

      if (output) {
        const formatOutput = {
          ...output,
          name: output.name || '',
          tel: output.tel || '',
          remarks: output.remarks || ''
        }

        return formatOutput
      }

      throw new UserInputError('Fetch reservation error', { errors: 'No result' })
    } catch (e) {
      console.error(e)
      throw new UserInputError('Fetch reservation error', { errors: e })
    }
  }
}
