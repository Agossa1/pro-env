import { useSearchParams } from 'react-router-dom';
import ActivateForm from '../../features/auth/components/ActivateForm';

function ActivatePage() {
  const [searchParams] = useSearchParams();
  const emailFromUrl = searchParams.get('email') ?? '';
  return <ActivateForm email={emailFromUrl || undefined} />;
}

export default ActivatePage;