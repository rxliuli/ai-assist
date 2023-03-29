import { expect, it } from 'vitest'
import { CreationOptional, DataTypes, Model, Sequelize } from 'sequelize'
import { v4 } from 'uuid'

interface UserModel {
  id: string
  username: string
  email: string
  passwordHash: string
  passwordSalt: string
  createdAt?: Date
  updatedAt?: Date
  emailVerified: CreationOptional<boolean>
}

const sequelize: Sequelize = new Sequelize(process.env.DATABASE_URL!)
const User = sequelize.define<Model<UserModel>>(
  'users',
  {
    id: {
      type: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    passwordHash: {
      type: DataTypes.STRING,
      field: 'password_hash',
    },
    passwordSalt: {
      type: DataTypes.STRING,
      field: 'password_salt',
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at',
    },
    emailVerified: {
      type: DataTypes.NUMBER,
      field: 'email_verified',
    },
  },
  {
    paranoid: true,
    deletedAt: 'deleted_at',
  },
)

it('sequelize', async () => {
  await sequelize.authenticate()
})
it.only('basic', async () => {
  await User.destroy({ where: { username: 'liuli' }, force: true })
  const r = await User.create({
    id: v4(),
    email: 'test@test.com',
    username: 'test2',
    passwordHash: 'test2',
    passwordSalt: 'test2',
    emailVerified: false,
    // TODO 如何手动写入 Date 类型的数据
  })
  expect(await User.findOne({ where: { id: r.get().id } })).not.null
  await r.update({ username: 'liuli' })
  expect((await User.findOne({ where: { id: r.get().id } }))!.get().username).eq('liuli')
  await User.destroy({ where: { id: r.get().id }, force: true })
  expect(await User.findOne({ where: { id: r.get().id } })).null
})
it('list', async () => {
  const r = await User.findAll()
  console.log(r.map((it) => it.get()))
  if (r.length > 0) {
    expect(r[0].get().createdAt instanceof Date).true
  }
  expect(Array.isArray(r)).true
})
