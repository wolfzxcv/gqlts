import { Resolver, Mutation, Arg, Int, Query, InputType, Field } from 'type-graphql'
import { User } from '../entity/User'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { UserError } from '../../@types'
import { AuthenticationError, UserInputError } from 'apollo-server-express'

@InputType()
class RegisterInput {
  @Field(() => String)
  username: string

  @Field(() => String)
  email: string

  @Field(() => String)
  password: string

  @Field(() => String)
  confirmPassword: string

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
    const errors = {} as UserError

    try {
      // Validate input data
      if (!username || !username?.trim()) errors.username = 'username must not be empty'
      if (!email || !email?.trim()) errors.email = 'email must not be empty'
      if (!password || !password?.trim()) errors.password = 'password must not be empty'
      if (!confirmPassword || !confirmPassword?.trim()) errors.confirmPassword = 'repeat password must not be empty'
      if (!imageURL || !imageURL?.trim()) errors.imageURL = 'imageURL must not be empty'
      if (!age || typeof age !== 'number') errors.age = 'age must not be empty'

      // Check if username/ email exists
      const duplicated = await User.findOne({ where: [{ username }, { email }] })

      if (duplicated?.username === username) {
        errors.username = 'Username is taken'
      }

      if (duplicated?.email === email) {
        errors.email = 'Email is taken'
      }

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
      console.log(e)
      throw new UserInputError('Input error', { errors: e })
    }
  }

  @Mutation(() => String)
  async updateUser(
    @Arg('username', () => String) username: string,
    @Arg('input', () => UpdateInput) input: UpdateInput
  ) {
    const updateAt = new Date().toLocaleString()
    await User.update({ username }, { ...input, updateAt })
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
  async getUser(@Arg('username', () => String) username: RegisterInput['username']) {
    try {
      const user = await User.findOne({ where: { username } })

      if (!user) {
        throw new UserInputError(`User ${username} not found`)
      }

      return user
    } catch (e) {
      console.log(e)
      throw e
    }
  }

  @Query(() => User)
  async login(
    @Arg('username', () => String) username: RegisterInput['username'],
    @Arg('password', () => String) password: RegisterInput['password']
  ) {
    try {
      const user = await User.findOne({ where: { username } })
      if (!user) {
        throw new UserInputError(`User ${username} not found`)
      }

      const passwordIsCorrect = await bcrypt.compare(password, user.password)

      if (!passwordIsCorrect) {
        throw new AuthenticationError('Password is incorrect')
      }

      const token = jwt.sign({ username }, process.env.JWT_SECRET || '', { expiresIn: 60 * 60 })

      user.token = token

      return user
    } catch (e) {
      console.log(e)
      throw e
    }
  }
}
