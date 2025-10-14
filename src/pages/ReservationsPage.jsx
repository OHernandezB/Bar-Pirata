import { ReservationsForm } from '../components';

export default function ReservationsPage({ onSubmit }) {
  return (
    <main id="reservas">
      <ReservationsForm onSubmit={onSubmit} />
    </main>
  );
}