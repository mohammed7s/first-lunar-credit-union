import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WalletConnect } from "@/components/WalletConnect";
import { useAccount, useSignMessage, useChainId } from "wagmi";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createSiweMessage, authenticateUser } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/supabase";
import { toast } from "sonner";

const Auth = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { signMessageAsync } = useSignMessage();
  const navigate = useNavigate();
  const { setUser, organization } = useAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleSignIn = async () => {
    if (!address) return;

    setIsAuthenticating(true);
    try {
      // Generate SIWE message
      const message = createSiweMessage(address, chainId);

      // Request signature from wallet
      toast.info('Please sign the message in your wallet');
      const signature = await signMessageAsync({ message });

      // Authenticate with backend
      const user = await authenticateUser(address, signature, message);

      if (user) {
        // Set user in auth context
        setUser(user);
        toast.success('Successfully signed in!');

        // Check if user has organization
        const { data: orgs } = await db.organizations.getByOwner(user.id);

        if (!orgs || orgs.length === 0) {
          // No organization found, redirect to create one
          navigate('/create-organization');
        } else {
          // Has organization, go to business dashboard
          navigate('/business');
        }
      } else {
        toast.error('Authentication failed');
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      if (error.message?.includes('User rejected')) {
        toast.error('Signature rejected');
      } else {
        toast.error('Failed to sign in');
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <Card className="p-8 max-w-md w-full bg-gradient-card border-border">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Connect Your Wallet</h1>
          <p className="text-muted-foreground">
            Sign in with your Ethereum wallet to access First Lunar Credit Union
          </p>
        </div>

        <WalletConnect />

        {isConnected && address && (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-sm text-center text-primary">
                ✓ Wallet connected!
              </p>
            </div>
            <Button
              onClick={handleSignIn}
              disabled={isAuthenticating}
              className="w-full"
              size="lg"
            >
              {isAuthenticating ? 'Signing in...' : 'Sign Message to Continue'}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              You'll be asked to sign a message to verify wallet ownership
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Auth;
