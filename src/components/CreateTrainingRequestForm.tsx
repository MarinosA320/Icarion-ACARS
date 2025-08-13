import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useTrainingRequestsManagement } from '@/hooks/useTrainingRequestsManagement';
import { RANK_ORDER, AIRCRAFT_FAMILIES } from '@/utils/aircraftData'; // Import necessary data

interface CreateTrainingRequestFormProps {
  onFormSubmitted: () => void;
}

const CreateTrainingRequestForm: React.FC<CreateTrainingRequestFormProps> = ({ onFormSubmitted }) => {
  const { handleCreateTrainingRequest } = useTrainingRequestsManagement();
  const [desiredRank, setDesiredRank] = useState('');
  const [trainingCategory, setTrainingCategory] = useState(''); // New state for training category
  const [aircraftType, setAircraftType] = useState(''); // This will now be conditional
  const [preferredDateTime, setPreferredDateTime] = useState('');
  const [priorExperience, setPriorExperience] = useState('');
  const [optionalMessage, setOptionalMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!trainingCategory || !preferredDateTime) {
      alert('Please fill in all required fields: Training Category and Preferred Date/Time.');
      setLoading(false);
      return;
    }

    // Conditional validation for aircraft type if 'Aircraft Type Rating' is selected
    if (trainingCategory === 'Aircraft Type Rating' && !aircraftType) {
      alert('Please select an Aircraft Type Rating.');
      setLoading(false);
      return;
    }

    const newRequest = {
      desired_rank: desiredRank || 'N/A', // Default to N/A if not selected for non-rank training
      training_category: trainingCategory, // Include new field
      aircraft_type: trainingCategory === 'Aircraft Type Rating' ? aircraftType : 'N/A', // Set to N/A if not type rating
      preferred_date_time: new Date(preferredDateTime).toISOString(),
      prior_experience: priorExperience || null,
      optional_message: optionalMessage || null,
    };

    await handleCreateTrainingRequest(newRequest);
    setLoading(false);
    // Clear form fields after submission
    setDesiredRank('');
    setTrainingCategory('');
    setAircraftType('');
    setPreferredDateTime('');
    setPriorExperience('');
    setOptionalMessage('');
    onFormSubmitted(); // Notify parent component to refresh data
  };

  const availableRanks = Object.keys(RANK_ORDER).filter(rank => RANK_ORDER[rank] > RANK_ORDER['Visitor']);
  const availableAircraftFamilies = Object.values(AIRCRAFT_FAMILIES).filter((value, index, self) => self.indexOf(value) === index);

  return (
    <Card className="shadow-md rounded-lg">
      <CardHeader>
        <CardTitle>Submit a Training Request</CardTitle>
        <CardDescription>Request training for a new rank, aircraft type rating, or general pilot training.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <Label htmlFor="trainingCategory">Training Category</Label>
            <Select value={trainingCategory} onValueChange={setTrainingCategory} disabled={loading}>
              <SelectTrigger id="trainingCategory">
                <SelectValue placeholder="Select training category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PPL Training">PPL Training</SelectItem>
                <SelectItem value="Multi-Engine Training">Multi-Engine Training</SelectItem>
                <SelectItem value="IFR Training">IFR Training</SelectItem>
                <SelectItem value="Aircraft Type Rating">Aircraft Type Rating</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {trainingCategory === 'Aircraft Type Rating' && (
            <div>
              <Label htmlFor="aircraftType">Aircraft Type Rating</Label>
              <Select value={aircraftType} onValueChange={setAircraftType} disabled={loading}>
                <SelectTrigger id="aircraftType">
                  <SelectValue placeholder="Select aircraft family" />
                </SelectTrigger>
                <SelectContent>
                  {availableAircraftFamilies.map(family => (
                    <SelectItem key={family} value={family}>{family}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Desired Rank is always optional, but more relevant for 'Aircraft Type Rating' or general progression */}
          <div>
            <Label htmlFor="desiredRank">Desired Rank (Optional, if applicable)</Label>
            <Select value={desiredRank} onValueChange={(value) => setDesiredRank(value === 'none-rank' ? '' : value)} disabled={loading}>
              <SelectTrigger id="desiredRank">
                <SelectValue placeholder="Select desired rank" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none-rank">None / Not Applicable</SelectItem> {/* Changed value to non-empty string */}
                {availableRanks.map(rank => (
                  <SelectItem key={rank} value={rank}>{rank}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="preferredDateTime">Preferred Date and Time</Label>
            <Input
              id="preferredDateTime"
              type="datetime-local"
              value={preferredDateTime}
              onChange={(e) => setPreferredDateTime(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="priorExperience">Prior Experience (Optional)</Label>
            <Textarea
              id="priorExperience"
              value={priorExperience}
              onChange={(e) => setPriorExperience(e.target.value)}
              placeholder="Briefly describe any prior experience relevant to this training."
              rows={3}
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="optionalMessage">Optional Message</Label>
            <Textarea
              id="optionalMessage"
              value={optionalMessage}
              onChange={(e) => setOptionalMessage(e.target.value)}
              placeholder="Any additional notes or questions for the instructor."
              rows={3}
              disabled={loading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateTrainingRequestForm;