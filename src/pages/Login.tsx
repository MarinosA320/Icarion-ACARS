import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import PolicyDialog from '@/components/PolicyDialog'; // New import

export default function Login() {
  const navigate = useNavigate();
  const [agreedToPolicies, setAgreedToPolicies] = useState(false);
  const [isPolicyDialogOpen, setIsPolicyDialogOpen] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
          Welcome to Icarion Virtual Airline
        </h2>
        <Auth
          supabaseClient={supabase}
          providers={[]}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'hsl(var(--primary))',
                  brandAccent: 'hsl(var(--primary-foreground))',
                },
              },
            },
          }}
          theme="light"
          redirectTo={window.location.origin + '/'}
          localization={{
            variables: {
              sign_in: {
                email_label: 'Email',
                password_label: 'Password',
                email_input_placeholder: 'Your email address',
                password_input_placeholder: 'Your password',
                button_label: 'Sign In',
                social_provider_text: 'Sign in with {{provider}}',
                link_text: 'Already have an account? Sign In',
              },
              sign_up: {
                email_label: 'Email',
                password_label: 'Create Password',
                email_input_placeholder: 'Your email address',
                password_input_placeholder: 'Create your password',
                button_label: 'Sign Up',
                social_provider_text: 'Sign up with {{provider}}',
                link_text: 'Don\'t have an account? Sign Up',
                confirmation_text: 'Check your email for the confirmation link.',
              },
              forgotten_password: {
                email_label: 'Email',
                password_label: 'Your Password',
                email_input_placeholder: 'Your email address',
                button_label: 'Send reset password instructions',
                link_text: 'Forgot your password?',
              },
              update_password: {
                password_label: 'New Password',
                password_input_placeholder: 'Your new password',
                button_label: 'Update Password',
              },
            },
          }}
          magicLink={true}
          signUp={{
            email_label: 'Email',
            password_label: 'Password',
            email_input_placeholder: 'Your email address',
            password_input_placeholder: 'Create your password',
            button_label: 'Sign Up',
            social_provider_text: 'Sign up with {{provider}}',
            link_text: 'Don\'t have an account? Sign Up',
            confirmation_text: 'Check your email for the confirmation link.',
            // Custom fields for registration
            additionalData: {
              first_name: {
                label: 'First Name',
                type: 'text',
                placeholder: 'Your first name',
                required: true,
              },
              last_name: {
                label: 'Last Name',
                type: 'text',
                placeholder: 'Your last name',
                required: true,
              },
              display_name: {
                label: 'Display Name (Visible to others)',
                type: 'text',
                placeholder: 'Your display name',
                required: true,
              },
              discord_username: {
                label: 'Discord Username',
                type: 'text',
                placeholder: 'Your Discord username (e.g., user#1234)',
                required: false,
              },
              vatsim_ivao_id: {
                label: 'VATSIM ID (CID) or IVAO ID (VID)',
                type: 'text',
                placeholder: 'Your VATSIM or IVAO ID (optional)',
                required: false,
              },
            },
            // Custom agreement checkbox
            form_id: 'sign-up-form', // Assign an ID to the form for custom elements
            element_id: 'sign-up-button', // Assign an ID to the submit button
            // This is a workaround as Auth UI doesn't directly support custom validation for its button.
            // We'll handle the agreement check outside the Auth component's direct flow.
          }}
        />
        {/* Custom agreement checkbox and policy link */}
        <div className="flex items-center space-x-2 mt-4">
          <Checkbox
            id="terms"
            checked={agreedToPolicies}
            onCheckedChange={(checked) => setAgreedToPolicies(!!checked)}
          />
          <Label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            I agree to the{' '}
            <Button variant="link" className="p-0 h-auto text-sm" onClick={() => setIsPolicyDialogOpen(true)}>
              Terms of Service, Privacy Policy, and Rules & Regulations
            </Button>
          </Label>
        </div>
        {/* Override the default Supabase Auth UI sign-up button if needed, or rely on its internal validation */}
        {/* For now, we'll let the Auth UI handle its own button, but the checkbox will be a visual cue */}
      </div>
      <PolicyDialog isOpen={isPolicyDialogOpen} onClose={() => setIsPolicyDialogOpen(false)} />
    </div>
  );
}