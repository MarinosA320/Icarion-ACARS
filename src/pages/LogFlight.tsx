import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showSuccess, showError } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'; // Import Card components

import { useFlightForm } from '@/hooks/use-flight-form';
import { useUserProfileAndAircraftData } from '@/hooks/use-user-profile-aircraft-data';
import { AIRCRAFT_MIN_RANKS, hasRequiredRank, hasTypeRating, AIRCRAFT_FAMILIES } from '@/utils/aircraftData'; // New imports for validation

import FlightDetailsForm from '@/components/log-flight/FlightDetailsForm';
import FlightPlanAndRemarks from '@/components/log-flight/FlightPlanAndRemarks';
import FlightImageUpload from '@/components/log-flight/FlightImageUpload';
import FlightActionButtons from '@/components/log-flight/FlightActionButtons';

const LogFlight = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    formState,
    flightImage,
    bookingId,
    handleChange,
    handleImageChange,
    clearForm, // Keep clearForm here for successful submission
  } = useFlightForm();

  const {
    userProfile,
    filteredAircraftTypes,
    aircraftRegistrations,
  } = useUserProfileAndAircraftData(
    formState.selectedAirline,
    formState.selectedAircraftType,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showError('User not logged in.');
      setLoading(false);
      return;
    }

    // Re-validate rank and type rating before logging
    if (userProfile) {
      const requiredRank = AIRCRAFT_MIN_RANKS[formState.selectedAircraftType];
      const meetsRank = requiredRank ? hasRequiredRank(userProfile.rank, requiredRank) : true;
      const meetsTypeRating = hasTypeRating(userProfile.type_ratings, formState.selectedAircraftType);

      if (!meetsRank) {
        showError(`Your current rank (${userProfile.rank}) is not sufficient for the ${formState.selectedAircraftType}. Required: ${requiredRank}.`);
        setLoading(false);
        return;
      }
      if (!meetsTypeRating) {
        showError(`You do not have the required type rating for the ${formState.selectedAircraftType} (${AIRCRAFT_FAMILIES[formState.selectedAircraftType] || 'N/A'} family).`);
        setLoading(false);
        return;
      }
    } else {
      showError('User profile data not loaded. Cannot validate aircraft selection.');
      setLoading(false);
      return;
    }


    let flightImageUrl: string | null = null;
    if (flightImage) {
      const fileExt = flightImage.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `flight_images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('flight-images')
        .upload(filePath, flightImage);

      if (uploadError) {
        showError('Error uploading flight image: ' + uploadError.message);
        setLoading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage.from('flight-images').getPublicUrl(filePath);
      flightImageUrl = publicUrlData.publicUrl;
    }

    const { error } = await supabase.from('flights').insert({
      user_id: user.id,
      departure_airport: formState.departureAirport,
      arrival_airport: formState.arrivalAirport,
      aircraft_type: formState.selectedAircraftType,
      flight_time: formState.flightTime,
      landing_rate: formState.landingRate ? parseInt(formState.landingRate) : null,
      flight_image_url: flightImageUrl,
      flight_number: formState.flightNumber || null,
      pilot_role: formState.pilotRole,
      etd: formState.etd || null,
      atd: formState.atd || null,
      eta: formState.eta || null,
      ata: formState.ata || null,
      flight_rules: formState.flightRules,
      flight_plan: formState.flightPlan || null,
      departure_runway: formState.departureRunway || null,
      arrival_runway: formState.arrivalRunway || null,
      taxiways_used: formState.taxiwaysUsed || null,
      gates_used_dep: formState.gatesUsedDep || null,
      gates_used_arr: formState.gatesUsedArr || null,
      departure_type: formState.departureType,
      arrival_type: formState.arrivalType,
      remarks: formState.remarks || null,
      volanta_tracking_link: formState.volantaTrackingLink || null, // Include new field
    });

    if (error) {
      showError('Error logging flight: ' + error.message);
      console.error('Error logging flight:', error);
    } else {
      if (bookingId) {
        const { error: updateBookingError } = await supabase
          .from('flight_bookings')
          .update({ status: 'completed' })
          .eq('id', bookingId);

        if (updateBookingError) {
          console.error('Error updating booking status:', updateBookingError);
          showError('Flight logged, but failed to update booking status.');
        }
      }
      showSuccess('Flight logged successfully!');
      clearForm(); // Clear saved data on successful submission
      navigate('/logbook'); // Navigate back to logbook
    }
    setLoading(false);
  };

  const fullName = userProfile ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() : '';

  return (
    <div className="container mx-auto p-4 pt-24">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">Log Your Flight</h1>

      <Card className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">Flight Details</CardTitle>
          <CardDescription className="text-lg text-gray-600 dark:text-gray-400">
            Fill in the details for your flight from {formState.departureAirport || 'N/A'} to {formState.arrivalAirport || 'N/A'}.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="col-span-full md:col-span-1">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" value={fullName} disabled className="bg-gray-100 dark:bg-gray-700" />
            </div>
            <div className="col-span-full md:col-span-1">
              <Label htmlFor="vatsimIvaoId">VATSIM/IVAO ID</Label>
              <Input id="vatsimIvaoId" value={userProfile?.vatsim_ivao_id || 'N/A'} disabled className="bg-gray-100 dark:bg-gray-700" />
            </div>

            <FlightDetailsForm
              formState={formState}
              userRank={userProfile?.rank || ''}
              filteredAircraftTypes={filteredAircraftTypes}
              aircraftRegistrations={aircraftRegistrations}
              handleChange={handleChange}
              handleAircraftTypeChange={(value) => handleChange('selectedAircraftType', value)}
              handleAirlineChange={(value) => handleChange('selectedAirline', value)}
            />

            <FlightPlanAndRemarks
              flightPlan={formState.flightPlan}
              remarks={formState.remarks}
              handleChange={handleChange}
            />

            <FlightImageUpload
              handleImageChange={handleImageChange}
            />

            <FlightActionButtons
              loading={loading}
              // clearForm is no longer passed here, it's handled in handleSubmit
            />
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LogFlight;