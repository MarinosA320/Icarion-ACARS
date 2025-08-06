import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess, showError } from '@/utils/toast';
import { AIRCRAFT_FAMILIES, AIRCRAFT_MIN_RANKS, hasRequiredRank, hasTypeRating, ALL_AIRLINES, RANK_ORDER } from '@/utils/aircraftData';

interface RequestFormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userProfile: {
    id: string;
    rank: string;
    type_ratings: string[] | null;
  } | null;
}

const RequestFormSheet: React.FC<RequestFormSheetProps> = ({ isOpen, onClose, onSuccess, userProfile }) => {
  const [requestType, setRequestType] = useState('');
  const [loading, setLoading] = useState(false);

  // State for Training/Exam requests
  const [desiredRank, setDesiredRank] = useState('');
  const [aircraftType, setAircraftType] = useState('');
  const [preferredDateTime, setPreferredDateTime] = useState('');
  const [priorExperience, setPriorExperience] = useState('');
  const [optionalMessage, setOptionalMessage] = useState('');

  // State for other generic requests
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isOpen) {
      // Reset form when sheet closes
      setRequestType('');
      setDesiredRank('');
      setAircraftType('');
      setPreferredDateTime('');
      setPriorExperience('');
      setOptionalMessage('');
      setSubject('');
      setMessage('');
    }
  }, [isOpen]);

  const getFilteredAircraftTypes = () => {
    if (!userProfile) return [];
    const icarionAirline = ALL_AIRLINES.find(a => a.name === 'Icarion Virtual') || ALL_AIRLINES[0];
    const availableAircraftTypes = icarionAirline.fleet.map(ac => ac.type);
    
    const filteredByRankAndTypeRating = availableAircraftTypes.filter(type => {
      const requiredRank = AIRCRAFT_MIN_RANKS[type];
      const meetsRank = requiredRank ? hasRequiredRank(userProfile.rank, requiredRank) : true;
      const meetsTypeRating = hasTypeRating(userProfile.type_ratings, type);
      
      return meetsRank && meetsTypeRating;
    });
    return filteredByRankAndTypeRating;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!userProfile?.id) {
      showError('User not logged in.');
      setLoading(false);
      return;
    }

    let details: any = {};
    let validationError = '';

    switch (requestType) {
      case 'training':
      case 'exam':
        if (!desiredRank || !aircraftType || !preferredDateTime || !priorExperience) {
          validationError = 'Please fill all required fields for Training/Exam request.';
        } else {
          // Validate rank and type rating for training/exam
          const requiredRank = AIRCRAFT_MIN_RANKS[aircraftType];
          const meetsRank = requiredRank ? hasRequiredRank(userProfile.rank, requiredRank) : true;
          const meetsTypeRating = hasTypeRating(userProfile.type_ratings, aircraftType);

          if (!meetsRank) {
            validationError = `Your current rank (${userProfile.rank}) is not sufficient for the ${aircraftType}. Required: ${requiredRank}.`;
          } else if (!meetsTypeRating) {
            validationError = `You do not have the required type rating for the ${aircraftType} (${AIRCRAFT_FAMILIES[aircraftType] || 'N/A'} family).`;
          } else {
            details = {
              desired_rank: desiredRank,
              aircraft_type: aircraftType,
              preferred_date_time: preferredDateTime ? new Date(preferredDateTime).toISOString() : null, // Convert to ISO string (UTC)
              prior_experience: priorExperience,
              optional_message: optionalMessage,
            };
          }
        }
        break;
      case 'contact':
      case 'new_member_orientation':
      case 'advisory_real_pilot':
      case 'improvement_request':
      case 'report_member':
      case 'tech_support':
      case 'report_staff':
      case 'other':
        if (!subject || !message) {
          validationError = 'Subject and Message are required for this request type.';
        } else {
          details = {
            subject: subject,
            message: message,
          };
        }
        break;
      default:
        validationError = 'Please select a request type.';
        break;
    }

    if (validationError) {
      showError(validationError);
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('user_requests').insert({
      user_id: userProfile.id,
      request_type: requestType,
      details: details,
      status: 'Pending', // Default status
    });

    if (error) {
      showError('Error submitting request: ' + error.message);
      console.error('Error submitting request:', error);
    } else {
      showSuccess('Request submitted successfully!');
      onSuccess();
      onClose();
    }
    setLoading(false);
  };

  const renderFormFields = () => {
    switch (requestType) {
      case 'training':
      case 'exam':
        const availableRanksForProgression = Object.keys(RANK_ORDER).filter(rank => RANK_ORDER[rank] > RANK_ORDER[userProfile?.rank || 'Visitor']);
        return (
          <>
            <div>
              <Label htmlFor="desiredRank">Desired Rank</Label>
              <Select value={desiredRank} onValueChange={setDesiredRank} disabled={loading}>
                <SelectTrigger id="desiredRank">
                  <SelectValue placeholder="Select a rank" />
                </SelectTrigger>
                <SelectContent>
                  {availableRanksForProgression.length > 0 ? (
                    availableRanksForProgression.map(rank => (
                      <SelectItem key={rank} value={rank}>{rank}</SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-higher-rank" disabled>No higher ranks available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="aircraftType">Preferred Aircraft Type</Label>
              <Select value={aircraftType} onValueChange={setAircraftType} disabled={loading || !userProfile}>
                <SelectTrigger id="aircraftType">
                  <SelectValue placeholder="Select aircraft type" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  {getFilteredAircraftTypes().length > 0 ? (
                    getFilteredAircraftTypes().map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-aircraft-available" disabled>No aircraft available for your rank/ratings</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="preferredDateTime">Preferred Date/Time (UTC)</Label>
              <Input
                id="preferredDateTime"
                type="datetime-local"
                value={preferredDateTime}
                onChange={(e) => setPreferredDateTime(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground mt-1">Please select a date and time in UTC.</p>
            </div>
            <div>
              <Label htmlFor="priorExperience">Prior Experience</Label>
              <Textarea
                id="priorExperience"
                value={priorExperience}
                onChange={(e) => setPriorExperience(e.target.value)}
                placeholder="Describe your prior experience relevant to this request."
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="optionalMessage">Optional Message</Label>
              <Textarea
                id="optionalMessage"
                value={optionalMessage}
                onChange={(e) => setOptionalMessage(e.target.value)}
                placeholder="Any additional notes for the staff."
                disabled={loading}
              />
            </div>
          </>
        );
      case 'contact':
      case 'new_member_orientation':
      case 'advisory_real_pilot':
      case 'improvement_request':
      case 'report_member':
      case 'tech_support':
      case 'report_staff':
      case 'other':
        return (
          <>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief subject of your request"
                required
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Provide details for your request..."
                rows={6}
                required
                disabled={loading}
              />
            </div>
          </>
        );
      default:
        return <p className="text-center text-muted-foreground">Please select a request type to see the form fields.</p>;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>Submit a New Request</SheetTitle>
          <SheetDescription>
            Select a request type and fill in the details.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4 flex-grow overflow-y-auto">
          <div>
            <Label htmlFor="requestType">Request Type</Label>
            <Select value={requestType} onValueChange={setRequestType} disabled={loading}>
              <SelectTrigger id="requestType">
                <SelectValue placeholder="Select request type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="training">Training Request</SelectItem>
                <SelectItem value="exam">Exam Request</SelectItem>
                <SelectItem value="contact">General Contact</SelectItem>
                <SelectItem value="new_member_orientation">New Member Orientation</SelectItem>
                <SelectItem value="advisory_real_pilot">Advisory for Real Pilot Career</SelectItem>
                <SelectItem value="improvement_request">Request for Improvement</SelectItem>
                <SelectItem value="report_member">Report a Member</SelectItem>
                <SelectItem value="tech_support">Technical Support</SelectItem>
                <SelectItem value="report_staff">Report a Staff Member</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {renderFormFields()}
        </form>
        <SheetFooter className="mt-auto">
          <Button type="submit" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Request'}
          </Button>
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default RequestFormSheet;