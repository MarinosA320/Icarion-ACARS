import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface FlightPlanAndRemarksProps {
  flightPlan: string;
  remarks: string;
  handleChange: (field: string, value: string) => void;
}

const FlightPlanAndRemarks: React.FC<FlightPlanAndRemarksProps> = ({
  flightPlan,
  remarks,
  handleChange,
}) => {
  return (
    <>
      <div className="col-span-full">
        <Label htmlFor="flightPlan">Flight Plan</Label>
        <Textarea id="flightPlan" value={flightPlan} onChange={(e) => handleChange('flightPlan', e.target.value)} placeholder="Enter your flight plan details..." rows={4} />
      </div>
      <div className="col-span-full">
        <Label htmlFor="remarks">Remarks (Optional)</Label>
        <Textarea id="remarks" value={remarks} onChange={(e) => handleChange('remarks', e.target.value)} placeholder="Any additional remarks about the flight..." rows={3} />
      </div>
    </>
  );
};

export default FlightPlanAndRemarks;