import mongoose from 'mongoose';
import { config } from '@root/config';
const logger = config.createLogger('databases');
export default () => {
  const connect = () => {
    mongoose
      .connect(`${config.DATABASE_URL}`)
      .then(() => {
        logger.info('Successfully connected to database');
      })
      .catch((error) => {
        logger.error('Error connecting to database', error);
        return process.exit(1);
      });
  };
  connect();
  mongoose.connection.on('disconnect', connect);
};
