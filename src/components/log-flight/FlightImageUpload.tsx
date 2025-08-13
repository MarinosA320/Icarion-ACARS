import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FlightImageUploadProps {
  handleImageChange: (file: File | null) => void;
}

const FlightImageUpload: React.FC<FlightImageUploadProps> = ({ handleImageChange }) => {
  return (
    <div className="col-span-full">
      <Label htmlFor="flightImage">Upload Flight Image (Optional)</Label>
      <Input
        id="flightImage"
        type="file"
        accept="image/*"
        onChange={(e) => handleImageChange(e.target.files ? e.target.files[0] : null)}
        className="w-full"
      />
    </div>
  );
};

export default FlightImageUpload;