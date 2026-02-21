// src/components/emails/welcome-email.tsx
import * as React from 'react';

export const WelcomeEmail = () => (
  <div style={{ fontFamily: 'sans-serif', padding: '20px', color: '#111' }}>
    <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Welcome to UFL.</h1>
    <p>Thanks for joining the waitlist for the 90-day challenge tracker.</p>
    <p>We'll notify you as soon as we're ready for early access.</p>
    <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #eaeaea' }} />
    <p style={{ fontSize: '12px', color: '#666' }}>Sent with focus from Abhishek Maurya.</p>
  </div>
);