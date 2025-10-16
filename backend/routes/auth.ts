import { Router } from 'express';
import { supabaseAdmin } from '../services/supabase';

const router = Router();

// Sign in with wallet (SIWE - Sign-In with Ethereum)
router.post('/signin', async (req, res) => {
  try {
    const { wallet_address, signature, message, wallet_type } = req.body;

    // TODO: Verify signature matches message
    // For now, simplified version

    // Check if user exists
    let { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('wallet_address', wallet_address.toLowerCase())
      .single();

    // Create user if doesn't exist
    if (error && error.code === 'PGRST116') {
      const { data: newUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert({
          wallet_address: wallet_address.toLowerCase(),
          wallet_type,
        })
        .select()
        .single();

      if (createError) throw createError;
      user = newUser;
    } else if (error) {
      throw error;
    }

    // Generate JWT token using Supabase auth
    // TODO: Implement proper JWT generation

    res.json({
      user,
      message: 'Sign in successful',
    });
  } catch (error: any) {
    console.error('Sign in error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    // TODO: Verify JWT and get user

    res.json({ message: 'Get current user' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
