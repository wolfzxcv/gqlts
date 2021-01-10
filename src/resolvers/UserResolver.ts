import { Resolver, Mutation, Arg, Int, Query, InputType, Field, UseMiddleware, Ctx } from 'type-graphql'
import { LoginUser, Token, User } from '../entity'
import { MyContext, UserError } from '../../@types'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { UserInputError } from 'apollo-server-express'
import dayjs from 'dayjs'
import { IsEmail, IsFQDN, IsNotEmpty, Max, MaxLength, Min, MinLength } from 'class-validator'
import { isAuth } from '../middleware/isAuth'

@InputType()
class RegisterInput {
  @Field(() => String)
  @MinLength(5)
  @MaxLength(20)
  username: string

  @Field(() => String)
  @IsEmail()
  @MaxLength(50)
  email: string

  @Field(() => String)
  @IsNotEmpty()
  password: string

  @Field(() => String)
  @IsNotEmpty()
  confirmPassword: string

  @Field(() => String)
  @IsFQDN()
  imageURL: string

  @Field(() => Int, { nullable: true })
  @Min(18)
  @Max(99)
  age: number
}

@InputType()
class UpdateInput {
  @Field(() => String, { nullable: true })
  @IsEmail()
  @MaxLength(50)
  email?: string

  @Field(() => String, { nullable: true })
  @IsNotEmpty()
  password?: string

  @Field(() => String, { nullable: true })
  @IsFQDN()
  imageURL?: string

  @Field(() => Int, { nullable: true })
  @Min(18)
  @Max(99)
  age?: number

  @Field(() => String, { nullable: true })
  role?: 'root' | 'admin' | 'member'
}

@Resolver()
export class UserResolver {
  private formatTime(timestamp?: string): string {
    if (timestamp) {
      return dayjs(timestamp).format('YYYY-MM-DD HH:mm')
    } else {
      return dayjs(new Date()).format('YYYY-MM-DD HH:mm')
    }
  }

  private async checkUserExists(username: string) {
    const errors = {} as UserError
    const user = await User.findOne({ where: { username } })

    if (!user) {
      errors.message = `User ${username} not found`
      throw errors
    }

    return user
  }

  private getToken(info: Object, isRefreshToken?: true) {
    let time
    if (isRefreshToken) {
      time = '30m'
    } else {
      time = '10m'
    }
    return jwt.sign(info, process.env.TOKEN_SECRET!, {
      expiresIn: time
    })
  }

  @Mutation(() => User)
  async createUser(@Arg('options', () => RegisterInput) options: RegisterInput) {
    let { username, email, password, confirmPassword, imageURL, age } = options
    const errors = {} as UserError

    try {
      // Validate input data
      if (!password?.trim()) errors.password = 'password must not be empty'
      if (!confirmPassword?.trim()) errors.confirmPassword = 'repeat password must not be empty'

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
      const createAt = this.formatTime()
      const user = await User.create({ username, email, password, imageURL, age, createAt }).save()

      // Return user
      return user
    } catch (e) {
      console.log(e)
      throw new UserInputError('createUser error', { errors: e })
    }
  }

  @Mutation(() => String)
  @UseMiddleware(isAuth)
  async updateUser(
    @Arg('username', () => String) username: string,
    @Arg('input', () => UpdateInput) input: UpdateInput
  ) {
    try {
      await this.checkUserExists(username)
      const updateAt = this.formatTime()
      await User.update({ username }, { ...input, updateAt })
      return `${username} updated successfully`
    } catch (e) {
      console.error(e)
      throw new UserInputError('updateUser error', { errors: e })
    }
  }

  @Mutation(() => String)
  @UseMiddleware(isAuth)
  async deleteUser(@Arg('username', () => String) username: string) {
    try {
      await this.checkUserExists(username)
      await User.delete({ username })
      return `${username} deleted successfully`
    } catch (e) {
      console.error(e)
      throw new UserInputError('deleteUser error', { errors: e })
    }
  }

  @Query(() => [User])
  @UseMiddleware(isAuth)
  async getUsers() {
    try {
      const users = await User.find()

      const res = users.map(x => ({ ...x, createAt: this.formatTime(x.createAt) }))

      return res
    } catch (e) {
      console.error(e)
      throw new UserInputError('getUsers error', { errors: e })
    }
  }

  @Query(() => User)
  @UseMiddleware(isAuth)
  async getUser(@Arg('username', () => String) username: RegisterInput['username']) {
    try {
      const user = await this.checkUserExists(username)

      const createAt = this.formatTime(user.createAt)

      return { ...user, createAt }
    } catch (e) {
      console.error(e)
      throw new UserInputError('getUser error', { errors: e })
    }
  }

  @Query(() => LoginUser)
  async login(
    @Arg('username', () => String) username: RegisterInput['username'],
    @Arg('password', () => String) password: RegisterInput['password']
  ) {
    try {
      const user = await this.checkUserExists(username)

      const passwordIsCorrect = await bcrypt.compare(password, user.password)

      if (!passwordIsCorrect) {
        const error = { message: 'Password is incorrect' }
        throw error
      }

      const info = { username, role: user.role }

      const accessToken = this.getToken(info)

      const refreshToken = this.getToken(info, true)

      const createAt = this.formatTime(user.createAt)

      return {
        ...user,
        createAt,
        accessToken,
        refreshToken
      }
    } catch (e) {
      console.error(e)
      throw new UserInputError('login error', { errors: e })
    }
  }

  @Query(() => Token)
  @UseMiddleware(isAuth)
  async refreshToken(@Ctx() ctx: MyContext['req']['info']) {
    const info = { username: ctx.username, role: ctx.role }

    const accessToken = this.getToken(info)

    const refreshToken = this.getToken(info, true)
    return {
      accessToken,
      refreshToken
    }
  }
}
