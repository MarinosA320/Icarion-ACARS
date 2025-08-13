import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Mail, ExternalLink } from 'lucide-react';

const Contact = () => {
  return (
    <div className="container mx-auto p-4 pt-24">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">Contact & Support</h1>
      <p className="text-lg text-center text-gray-600 dark:text-gray-400 mb-8">
        Have questions, need support, or want to connect? Reach out to us through the channels below.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* General Inquiries Card */}
        <Card className="shadow-md rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-6 w-6 text-icarion-blue-DEFAULT dark:text-icarion-gold-DEFAULT" /> General Inquiries & Support
            </CardTitle>
            <CardDescription>For all questions, support, and technical issues.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-800 dark:text-gray-200">
              Email us at: <a href="mailto:general.icarion@gmail.com" className="text-blue-500 hover:underline">general.icarion@gmail.com</a>
            </p>
          </CardContent>
        </Card>

        {/* Discord Community Card */}
        <Card className="shadow-md rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-6 w-6 text-icarion-blue-DEFAULT dark:text-icarion-gold-DEFAULT" /> Discord Community
            </CardTitle>
            <CardDescription>Join our active community for real-time chat and support.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-800 dark:text-gray-200">
              Connect with us on Discord: <a href="https://discord.gg/2UprGZXA8y" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Join our Discord Server <ExternalLink className="inline-block h-4 w-4 ml-1" /></a>
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              This is the fastest way to get help and interact with other pilots and staff.
            </p>
          </CardContent>
        </Card>

        {/* Social Media Links Card */}
        <Card className="shadow-md rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-6 w-6 text-icarion-blue-DEFAULT dark:text-icarion-gold-DEFAULT" /> Follow Us
            </CardTitle>
            <CardDescription>Stay updated with our latest news and activities.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              <a href="https://www.youtube.com/@Icarion-virtual" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">YouTube <ExternalLink className="inline-block h-4 w-4 ml-1" /></a>
            </p>
            <p>
              <a href="https://www.tiktok.com/@icarionvirtual" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">TikTok <ExternalLink className="inline-block h-4 w-4 ml-1" /></a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Contact;