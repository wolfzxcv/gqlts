import { Resolver, Mutation, Arg, Int, Query, InputType, Field } from 'type-graphql'
import { User } from '../entity/User'

@InputType()
class UserInput {
  @Field(() => String)
  username: string

  @Field(() => String)
  email: string

  @Field(() => String)
  firstName: string

  @Field(() => String)
  lastName: string

  @Field(() => Int)
  age: number
}

@InputType()
class UserUpdateInput {
  @Field(() => String, { nullable: true })
  email?: string

  @Field(() => String, { nullable: true })
  firstName?: string

  @Field(() => String, { nullable: true })
  lastName?: string

  @Field(() => Int, { nullable: true })
  age?: number
}

@Resolver()
export class UserResolver {
  @Mutation(() => User)
  async createUser(@Arg('options', () => UserInput) options: UserInput) {
    const user = await User.create(options).save()
    return user
  }

  @Mutation(() => String)
  async updateUser(
    @Arg('username', () => String) username: string,
    @Arg('input', () => UserUpdateInput) input: UserUpdateInput
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
}
