import { Entity, Column, BaseEntity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { Field, ObjectType } from 'type-graphql'

@ObjectType({ description: '使用者資訊' })
@Entity()
export class User extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Field()
  @Column({
    length: 20,
    unique: true,
    nullable: true
  })
  username: string

  @Field()
  @Column({ nullable: true })
  password: string

  @Field()
  @Column({
    length: 50,
    unique: true,
    nullable: true
  })
  email: string

  @Field()
  @Column({ nullable: true })
  imageUUID: string

  @Field()
  @Column({ nullable: true })
  birthday: string

  @Field()
  @Column({ default: 'member', nullable: true })
  role: string

  @Field()
  @CreateDateColumn({ nullable: true })
  createAt: string

  @Field()
  @UpdateDateColumn({ nullable: true })
  updateAt: string

  @Field()
  @Column({ default: false })
  isEnabled: boolean
}

@ObjectType()
export class LoginUser extends User {
  @Field()
  accessToken: string

  @Field()
  refreshToken: string
}
