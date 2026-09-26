import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Employee } from './src/models/Employee';

dotenv.config();

export const STAFF = [
  { name: 'Dana Whitfield', role: 'HK Supervisor', dept: 'Housekeeping', skills: ['Housekeeping'], costPerHour: 18, blocks: [{ start: 0, span: 4, dept: 'Housekeeping' }] },
  { name: 'Rosa Diaz', role: 'Room Attendant', dept: 'Housekeeping', skills: ['Housekeeping'], costPerHour: 15, blocks: [{ start: 0, span: 4, dept: 'Housekeeping' }] },
  { name: 'Luis Vega', role: 'Room Attendant', dept: 'Housekeeping', skills: ['Housekeeping'], costPerHour: 15, blocks: [{ start: 2, span: 5, dept: 'Housekeeping' }] },
  { name: 'Mia Chen', role: 'Turndown Lead', dept: 'Housekeeping', skills: ['Housekeeping'], costPerHour: 16, blocks: [{ start: 1, span: 4, dept: 'Housekeeping' }] },
  { name: 'Priya Nair', role: 'Guest Services', dept: 'Front Desk', skills: ['Front Desk'], costPerHour: 16, blocks: [{ start: 0, span: 4, dept: 'Front Desk' }] },
  { name: 'Tom Becker', role: 'Night FD Agent', dept: 'Front Desk', skills: ['Front Desk'], costPerHour: 17, blocks: [{ start: 3, span: 5, dept: 'Front Desk' }] },
  { name: 'Alex Carter', role: 'F&B Lead', dept: 'F&B', skills: ['F&B'], costPerHour: 19, blocks: [{ start: 1, span: 4, dept: 'F&B' }] },
  { name: 'Marco Ruiz', role: 'Sous Chef', dept: 'F&B', skills: ['F&B'], costPerHour: 22, blocks: [{ start: 4, span: 4, dept: 'F&B' }] },
  {
    name: 'Nina Rossi', role: 'Spa Therapist · XT', dept: 'Spa', skills: ['Spa', 'Front Desk', 'F&B'], costPerHour: 20, blocks: [{ start: 1, span: 4, dept: 'Spa' }],
    afterBlocks: []
  },
  {
    name: 'Sara Kim', role: 'Spa Therapist · XT', dept: 'Spa', skills: ['Spa', 'F&B'], costPerHour: 20, blocks: [{ start: 0, span: 4, dept: 'Spa' }],
    afterBlocks: []
  },
  {
    name: 'Leah Fontaine', role: 'Spa Attendant · XT', dept: 'Spa', skills: ['Spa', 'F&B'], costPerHour: 16, blocks: [{ start: 2, span: 3, dept: 'Spa' }],
    afterBlocks: []
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI!);
  await Employee.deleteMany({});
  await Employee.insertMany(STAFF);
  console.log('Staff seeded');
  process.exit(0);
}

seed();
