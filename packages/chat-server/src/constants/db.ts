import { DataTypes, Model, Sequelize } from 'sequelize'

const sequelize: Sequelize = new Sequelize(process.env.DATABASE_URL!, {
  dialect: 'postgres',
})

export interface User {
  id: string
  username: string
  email: string
  passwordHash: string
  passwordSalt: string
  createdAt?: Date
  updatedAt?: Date
  emailVerified?: boolean
  disabled?: boolean
}

export const UserModel = sequelize.define<Model<User>>(
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
      type: DataTypes.BOOLEAN,
      field: 'email_verified',
    },
    disabled: {
      type: DataTypes.BOOLEAN,
      field: 'disabled',
    },
  },
  {
    paranoid: true,
    deletedAt: 'deleted_at',
  },
)

export interface Token {
  id: string
  userId: string
  accessToken: string
  expirationTime: Date
}

export const TokenModel = sequelize.define<Model<Token>>(
  'tokens',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      field: 'user_id',
    },
    accessToken: {
      type: DataTypes.STRING,
      field: 'access_token',
    },
    expirationTime: {
      type: DataTypes.DATE,
      field: 'expiration_time',
    },
  },
  {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
)
