import type { Metadata } from 'next';
import EnrollmentsClient from './EnrollmentsClient';

export const metadata: Metadata = {
  title: 'My Enrollments | Brand Coach Network',
  description: 'View and manage your program enrollments.',
};

export default function EnrollmentsPage() {
  return <EnrollmentsClient />;
}
