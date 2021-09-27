import Pino from 'pino'
import { env } from './config'

export const logger = Pino({
    prettyPrint: env === 'development',
    level: 'debug'
});