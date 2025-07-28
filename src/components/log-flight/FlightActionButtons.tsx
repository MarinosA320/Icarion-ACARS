import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface FlightActionButtonsProps {
  loading: boolean;
  // Removed clearForm from props as it should only be called on successful submission in parent
}

const FlightActionButtons: React.FC<FlightActionButtonsProps> = ({ loading }) => {
  const navigate = useNavigate();

  const handleCancel = () => {
    // Do NOT clear form here, allow user to resume later
    navigate('/logbook'); // Navigate back to logbook
  };

  return (
    <div className="col-span-full flex justify-end mt-6 space-x-2">
      <Button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Log Flight'}
      </Button>
      <Button type="button" variant="outline" onClick={handleCancel} disabled={loading}>
        Cancel / Go Back
      </Button>
    </div>
  );
};

export default FlightActionButtons;