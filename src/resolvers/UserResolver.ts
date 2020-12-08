import { Resolver, Mutation, Arg, Int, Query, InputType, Field } from 'type-graphql'
import { User } from '../entity/User'
import bcrypt from 'bcryptjs'
import { RegisterError } from '../../@types'
import { UserInputError } from 'apollo-server-express'
import { getManager } from 'typeorm'
import { IsEmail, IsFQDN, IsNotEmpty, MaxLength, MinLength, validate } from 'class-validator'

@InputType()
class RegisterInput {
  @Field(() => String)
  @IsNotEmpty({ message: 'username must not be empty' })
  @MinLength(6, {
    message: 'username is too short'
  })
  @MaxLength(20, {
    message: 'username is too long'
  })
  username: string

  @Field(() => String)
  @IsEmail()
  email: string

  @Field(() => String)
  password: string

  @Field(() => String)
  confirmPassword: string

  @IsFQDN()
  @Field(() => String)
  imageURL: string

  @Field(() => Int)
  age: number
}

@InputType()
class UpdateInput {
  @Field(() => String, { nullable: true })
  email?: string

  @Field(() => String, { nullable: true })
  password?: string

  @Field(() => String, { nullable: true })
  imageURL?: string

  @Field(() => Int, { nullable: true })
  age?: number
}

@Resolver()
export class UserResolver {
  @Mutation(() => User)
  async createUser(@Arg('options', () => RegisterInput) options: RegisterInput) {
    let { username, email, password, confirmPassword, imageURL, age } = options

    const errors11 = await validate(options)
    console.log(errors11)
    if (errors11.length > 0) {
      throw new Error('Validation failed!')
    } else {
      await getManager().save(options)
    }

    const errors = {} as RegisterError

    try {
      // Validate input data
      if (!username || !username?.trim()) errors.username = 'username must not be empty'
      if (!email || !email?.trim()) errors.email = 'email must not be empty'
      if (!password || !password?.trim()) errors.password = 'password must not be empty'
      if (!confirmPassword || !confirmPassword?.trim()) errors.confirmPassword = 'repeat password must not be empty'
      if (!imageURL || !imageURL?.trim()) errors.imageURL = 'imageURL must not be empty'
      if (!age || typeof age !== 'number') errors.age = 'age must not be empty'

      // Check if username/ email exists
      // const userByUsername = await User.findOne({ where: { username } })
      // const userByEmail = await User.findOne({ where: { email } })
      // console.log(userByUsername, userByEmail)

      // if (userByUsername) errors.username = 'Username is taken'

      // if (userByEmail) errors.email = 'Email is taken'
      // Hash password
      password = await bcrypt.hash(password, 6)

      if (Object.keys(errors).length) {
        throw errors
      }

      // Create user
      const createAt = new Date().toLocaleString()
      const user = await User.create({ username, email, password, imageURL, age, createAt }).save()
      // Return user
      return user
    } catch (e) {
      // console.log(e)
      // if (e.name === 'QueryFailedError') {
      //   errors.message = e.detail || e.exception.detail || 'ERROR!!'
      // }
      throw new UserInputError('Input error', { errors: e })
    }
  }

  @Mutation(() => String)
  async updateUser(
    @Arg('username', () => String) username: string,
    @Arg('input', () => UpdateInput) input: UpdateInput
  ) {
    await User.update({ username }, input)
    return `${username} updated successfully`
  }

  @Mutation(() => String)
  async deleteUser(@Arg('username', () => String) username: string) {
    await User.delete({ username })
    return `${username} deleted successfully`
  }

  @Query(() => [User])
  getUsers() {
    return User.find()
  }

  @Query(() => User)
  async getUser(@Arg('username', () => String) username: string) {
    try {
      const result = await User.findOne({ where: { username } })
      if (!result) {
        throw result
      }

      return result
    } catch (e) {
      console.log(e)
      throw new UserInputError(`Can't find username ${username}`)
    }
  }
}
