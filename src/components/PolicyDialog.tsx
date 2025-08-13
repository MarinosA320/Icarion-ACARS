import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface PolicyDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const PolicyDialog: React.FC<PolicyDialogProps> = ({ isOpen, onClose }) => {
  const termsOfService = `
Effective Date: 03/05/2025

These Terms of Service ("Terms") govern your use of the Icarion Virtual Airline platform.

1. Eligibility
You must be 18 years or older to join, unless an exception is granted by Icarion Staff.
By registering, you confirm that you meet this requirement.

2. User Conduct
Members must behave respectfully and professionally on our platforms and associated networks (IVAO, VATSIM, POSCON).
Cheating (e.g., false flight logging) will result in disciplinary action or account termination.

3. Content Ownership
You retain ownership of your content, but grant us a license to display your name, flight data, and, for staff, profile photo.

4. Suspension & Termination
We reserve the right to suspend or terminate accounts for:
Violating our rules or network guidelines
Inactivity (after 1 month)
Providing false information

5. Modifications
We may update these Terms from time to time. Members will be notified of major changes via email or website notice.

6. Disclaimer
Icarion is a fictional virtual airline created for flight simulation purposes. We are not affiliated with any real-world airline.

7. Contact
For any questions or concerns, contact us at: general.icarion@gmail.com
  `;

  const privacyPolicy = `
Effective Date: 03/05/2025
Last Updated: 03/05/2025

At Icarion Virtual Airline ("Icarion", "we", "our", or "us"), your privacy is important to us. This Privacy Policy outlines how we collect, use, and protect your personal information.

1. Information We Collect
We collect the following personal data when you register or use our services:
Full name
Email address
IP address
Birthdate (for age verification)
Flight-related data (e.g., flight logs, hours, ranks)
Profile photo (staff members only)

2. Publicly Displayed Information
Member names will be displayed on our website.
Staff members' names and photos will be publicly visible.
By registering with Icarion, you consent to the public display of this information.

3. Data Use
We use your information for:
Membership management and communication
Display of pilot statistics and ranks
Compliance with IVAO, VATSIM, and POSCON network requirements

4. Data Retention
We retain data as long as your account is active or as required to comply with network obligations.

5. Data Protection
We take reasonable steps to protect your data from unauthorized access, alteration, or loss.

6. Age Requirement
Members must be at least 18 years old to join. Exceptions may be granted at our discretion.

7. Third-Party Sharing
We do not sell or share your data with third parties except:
To comply with applicable laws
To fulfill obligations to IVAO, VATSIM, or POSCON

8. Your Rights
You may request:
A copy of your data
Correction of inaccurate data
Deletion of your account
Requests can be sent to: general.icarion@gmail.com
  `;

  const rulesAndRegulations = `
Version 1.0
Effective Date: 03/05/2025

1. Introduction
Welcome to Icarion Virtual Airline, a community dedicated to high realism in virtual aviation. We operate on Microsoft Flight Simulator 2020, X-Plane 11, and X-Plane 12, and are affiliated with IVAO, VATSIM, and POSCON. Our mission is to simulate real-world airline operations with precision, discipline, and immersion.

All members are expected to uphold the values of realism, professionalism, and respect while representing Icarion across flight simulation networks and communication platforms.

2. Membership Requirements
Members must be at least 18 years old. Exceptions may be granted on a case-by-case basis.
All registrations are subject to manual approval by staff.
Pilots must hold an active account with at least one of the following networks: IVAO, VATSIM, or POSCON.
Real-world pilot experience is not required, but a basic understanding of IFR operations is expected.

3. Communication and Conduct
All members must conduct themselves professionally and respectfully at all times.
Unprofessional behavior, including falsifying flight reports, harassment, or poor airmanship, may result in a warning, suspension, or permanent ban.
All community interaction, including on our Discord server, must comply with the Terms of Service of the platform in use, along with Icarion’s own expectations for respectful behavior.

4. Flight Operations
4.1 Supported Simulators
Icarion supports Microsoft Flight Simulator 2020, X-Plane 11, and X-Plane 12.

4.2 Time Compression
Time compression is not permitted. All flights must be flown in real time.

4.3 Route Policy
Only routes created and published by Icarion may be flown.
Charter or custom flights are not allowed.

4.4 Aircraft Use
Aircraft access is restricted based on the type ratings held by each pilot.
Only aircraft for which a pilot is type-rated may be flown.

5. Flight Logging
All flights must be logged using the official Icarion ACARS system.
Manual PIREPs are not accepted under any circumstances.
The ACARS system records data such as departure and arrival airports, flight duration, altitude and speed, aircraft type and registration, and the online network used.

6. Booking and Scheduling
Flights must be booked prior to departure using the Icarion system.
Only scheduled routes listed in the system are available for booking.
Pilots may not bypass the booking process or operate aircraft not listed for the intended route.

7. Fleet and Aircraft Position
Icarion uses a dynamic fleet tracking system.
Aircraft must be flown from their current physical location as recorded in the system.
Aircraft positions update based on the last completed and approved flight.

8. Ranks and Progression
8.1 Rank Structure
Cadet, for pilots undergoing training or type rating
First Officer
Senior First Officer
Captain
Senior Captain

8.2 Rank Rules
Each rank grants access to specific aircraft types and routes.
Progression is based on flight hours, experience, and staff review.
Type rating completion may also be required for promotion.

9. Disciplinary System
Icarion enforces a formal warning and strike system.
First strike, formal warning.
Second strike, temporary suspension.
Third strike, possible permanent removal.

Disciplinary action may be issued for falsifying logs, repeated violations, inappropriate behavior, or misuse of Icarion systems or platforms.
All decisions are made by the staff team and are considered final.

10. Community and Communication
Icarion uses Discord as the primary platform for announcements, support, and community interaction.
All users must follow Discord's Terms of Service and behave respectfully within all channels.
Toxicity, spam, or harassment will not be tolerated.

11. Contact and Support
Members may contact the staff team via the website’s support system or through Discord.
For formal inquiries, email [Insert contact email].

Disclaimer
Icarion is a fictional virtual airline created for flight simulation purposes only.
It is not affiliated with any real-world airline or aviation authority.
  `;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] h-[90vh] flex flex-col overflow-hidden"> {/* Changed max-h to h and added overflow-hidden */}
        <DialogHeader>
          <DialogTitle>Icarion Virtual Airline Policies</DialogTitle>
          <DialogDescription>
            Please review our Terms of Service, Privacy Policy, and Rules & Regulations. You must agree to these to register.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow p-4 border rounded-md mt-4">
          <div className="prose dark:prose-invert max-w-none">
            <h3 className="text-xl font-bold mb-2">Terms of Service</h3>
            <pre className="whitespace-pre-wrap font-sans text-sm">{termsOfService.trim()}</pre>
            <Separator className="my-6" />

            <h3 className="text-xl font-bold mb-2">Privacy Policy</h3>
            <pre className="whitespace-pre-wrap font-sans text-sm">{privacyPolicy.trim()}</pre>
            <Separator className="my-6" />

            <h3 className="text-xl font-bold mb-2">Rules and Regulations</h3>
            <pre className="whitespace-pre-wrap font-sans text-sm">{rulesAndRegulations.trim()}</pre>
          </div>
        </ScrollArea>
        <div className="flex justify-end mt-4">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PolicyDialog;