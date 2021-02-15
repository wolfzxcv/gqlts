import { Resolver, Mutation, Arg, Query, InputType, Field, UseMiddleware, Ctx } from 'type-graphql'
import { LoginUser, Token, User } from '../entity'
import { MyContext, UserError } from '../../@types'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { UserInputError } from 'apollo-server-express'
import dayjs from 'dayjs'
import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator'
import { isAuth } from '../middleware/isAuth'

@InputType({ description: '註冊帳號' })
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

  @Field(() => String, { nullable: true })
  imageUUID: string

  @Field(() => String, { nullable: true })
  birthday: string
}

@InputType({ description: '更新帳號資料' })
class UpdateInput {
  @Field(() => String, { nullable: true })
  @IsEmail()
  @MaxLength(50)
  email: string

  @Field(() => String, { nullable: true })
  @IsNotEmpty()
  password: string

  @Field(() => String, { nullable: true })
  imageUUID: string

  @Field(() => String, { nullable: true })
  birthday: string

  @Field(() => String, { nullable: true })
  role: 'root' | 'admin' | 'member'
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
  async register(@Arg('options', () => RegisterInput) options: RegisterInput) {
    let { username, email, password, confirmPassword, imageUUID, birthday } = options
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
      const user = await User.create({ username, email, password, imageUUID, birthday, createAt }).save()

      // Return user
      return { ...user, createAt }
    } catch (e) {
      console.log(e)
      throw new UserInputError('register error', { errors: e })
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
  async users() {
    try {
      const users = await User.find()

      const res = users.map(x => ({
        ...x,
        createAt: x.createAt ? this.formatTime(x.createAt) : null,
        updateAt: x.updateAt ? this.formatTime(x.updateAt) : null
      }))

      return res
    } catch (e) {
      console.error(e)
      throw new UserInputError('Fetch users error', { errors: e })
    }
  }

  @Query(() => User)
  async user(@Arg('username', () => String) username: RegisterInput['username']) {
    try {
      const user = await this.checkUserExists(username)

      const createAt = user.createAt ? this.formatTime(user.createAt) : null
      const updateAt = user.updateAt ? this.formatTime(user.updateAt) : null

      return { ...user, createAt, updateAt }
    } catch (e) {
      console.error(e)
      throw new UserInputError('Fetch user error', { errors: e })
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
