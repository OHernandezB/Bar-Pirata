import { ReservationsForm, Tables } from '../components';

export default function ReservationsPage({ onSubmit }) {
  return (
    <main id="reservas">
      <ReservationsForm onSubmit={onSubmit} />
      <Tables />
    </main>
  );
}