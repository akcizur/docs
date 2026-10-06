'use client';

import { ClerkProvider, useAuth } from '@clerk/react';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { type ReactNode } from 'react';
import SearchDialog from '@/components/search';
import { RootProvider } from 'fumadocs-ui/provider/next';

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const convexClient = convexUrl ? new ConvexReactClient(convexUrl) : null;

function ConvexClerkBridge({ children }: { children: ReactNode }) {
  return (
    <ConvexProviderWithClerk client={convexClient!} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}

export function Provider({ children }: { children: ReactNode }) {
  const content = <RootProvider search={{ SearchDialog }}>{children}</RootProvider>;

  if (!convexClient) return content;

  if (clerkPublishableKey) {
    return (
      <ClerkProvider publishableKey={clerkPublishableKey}>
        <ConvexClerkBridge>{content}</ConvexClerkBridge>
      </ClerkProvider>
    );
  }

  return <ConvexProvider client={convexClient}>{content}</ConvexProvider>;
}
