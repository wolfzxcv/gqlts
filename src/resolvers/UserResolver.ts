import { Resolver, Mutation, Arg, Int, Query, InputType, Field } from 'type-graphql'
import { User } from '../entity/User'

@InputType()
class UserInput {
  @Field(() => String)
  username: string

  @Field(() => String)
  email: string

  @Field(() => String)
  password: string

  @Field(() => String)
  imageURL: string

  @Field(() => Int)
  age: number
}

@InputType()
class RegisterInput extends UserInput {
  @Field(() => String)
  confirmPassword: string
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
  async createUser(@Arg('options', () => UserInput) options: RegisterInput) {
    const { username, email, password, confirmPassword, imageURL, age } = options

    console.log(confirmPassword)
    try {
      const user = await User.create({ username, email, password, imageURL, age }).save()
      return user
    } catch (e) {
      console.log(e)
      throw e
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
      const result = await User.find({ where: { username } })
      return result[0]
    } catch (e) {
      console.log(e)
      return `Can't find username ${username}`
    }
  }
}
