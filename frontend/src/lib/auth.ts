import { SiweMessage } from 'siwe';
import { db } from './supabase';

export interface AuthUser {
  id: string;
  wallet_address: string;
  wallet_type: 'obsidian' | 'metamask';
  name?: string;
}

export const createSiweMessage = (address: string, chainId: number): string => {
  const domain = window.location.host;
  const origin = window.location.origin;
  const statement = 'Sign in to First Lunar Credit Union with your Ethereum wallet';

  const message = new SiweMessage({
    domain,
    address,
    statement,
    uri: origin,
    version: '1',
    chainId,
    nonce: generateNonce(),
  });

  return message.prepareMessage();
};

export const generateNonce = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

export const authenticateUser = async (
  address: string,
  signature: string,
  message: string
): Promise<AuthUser | null> => {
  try {
    // Verify signature
    const siweMessage = new SiweMessage(message);
    const fields = await siweMessage.verify({ signature });

    if (!fields.success) {
      throw new Error('Signature verification failed');
    }

    // Check if user exists
    const { data: existingUser } = await db.users.getByWallet(address.toLowerCase());

    if (existingUser) {
      return existingUser;
    }

    // Create new user
    const { data: newUser, error } = await db.users.create(
      address.toLowerCase(),
      'metamask' // TODO: Detect wallet type
    );

    if (error || !newUser) {
      throw new Error('Failed to create user');
    }

    return newUser;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
};
