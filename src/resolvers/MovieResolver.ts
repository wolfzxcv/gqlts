import { Resolver, Mutation, Arg, Int, Query, InputType, Field } from 'type-graphql'
import { Movie } from '../../src/entity/Movie'

@InputType()
class MovieInput {
  @Field(() => String)
  title: string

  @Field(() => Int)
  minutes: number
}

@InputType()
class MovieUpdateInput {
  @Field(() => String, { nullable: true })
  title?: string

  @Field(() => Int, { nullable: true })
  minutes?: number
}

@Resolver()
export class MovieResolver {
  @Mutation(() => Movie)
  async createMovie(@Arg('options', () => MovieInput) options: MovieInput) {
    const movie = await Movie.create(options).save()
    return movie
  }

  @Mutation(() => String)
  async updateMovie(@Arg('id', () => Int) id: number, @Arg('input', () => MovieUpdateInput) input: MovieUpdateInput) {
    await Movie.update({ id }, input)
    return `${id} updated successfully`
  }

  @Mutation(() => String)
  async deleteMovie(@Arg('id', () => Int) id: number) {
    await Movie.delete({ id })
    return `${id} deleted successfully`
  }

  @Query(() => [Movie])
  movies() {
    return Movie.find()
  }
}
