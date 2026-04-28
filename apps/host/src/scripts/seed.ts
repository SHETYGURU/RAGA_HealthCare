declare var process: any;
import { seedPatients } from '../services/seedData';

console.log('Running database seeder...');
seedPatients(100).then(() => {
  console.log('Seeding process complete.');
  process.exit(0);
}).catch((err) => {
  console.error('Error seeding data:', err);
  process.exit(1);
});
