import {
    createPool,
} from 'slonik';

const slonikPool = createPool('postgres://username:password@localhost:5432/paytap');

export { slonikPool }