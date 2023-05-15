import { DataTypes, Model, Sequelize } from 'sequelize'

export const sequelize: Sequelize = new Sequelize(process.env.DATABASE_URL!, {
  dialect: 'postgres',
  pool: {
    max: 100,
    idle: 10000,
  },
  dialectOptions: {
    statement_timeout: 1000,
    query_timeout: 10000,
    idle_in_transaction_session_timeout: 10000,
  },
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

export interface Session {
  id: string
  name: string
  userId: string
  createdAt?: Date
  updatedAt?: Date
}

export const SessionModel = sequelize.define<Model<Session>>(
  'sessions',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      field: 'user_id',
    },
    name: DataTypes.STRING,
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at',
    },
  },
  {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
  },
)

export interface Message {
  id: string
  sessionId: string
  userId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt?: Date
  updatedAt?: Date
}

export const MessageModel = sequelize.define<Model<Message>>(
  'messages',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      field: 'user_id',
    },
    sessionId: {
      type: DataTypes.UUID,
      field: 'session_id',
    },
    role: DataTypes.STRING,
    content: DataTypes.STRING,
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at',
    },
  },
  {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
  },
)
MessageModel.belongsTo(UserModel, { foreignKey: 'userId', targetKey: 'id' })
MessageModel.belongsTo(SessionModel, { foreignKey: 'sessionId', targetKey: 'id' })

export interface Prompt {
  id: string
  userId: string
  name: string
  content: string
  prefix?: string
  usageLastDate?: Date
  usageCount?: number
  createdAt?: Date
  updatedAt?: Date
}

export const PromptModel = sequelize.define<Model<Prompt>>(
  'prompts',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      field: 'user_id',
    },
    name: DataTypes.STRING,
    content: DataTypes.STRING,
    prefix: DataTypes.STRING,
    usageLastDate: {
      type: DataTypes.DATE,
      field: 'usage_last_date',
    },
    usageCount: {
      type: DataTypes.INTEGER,
      field: 'usage_count',
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at',
    },
  },
  {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
  },
)
