import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import { Alert, AlertTitle, AlertDescription, AlertBody, AlertActions } from '../ui/alert';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

interface LadderPasswordAlertProps {
  ladderId: Id<'ladders'>;
  ladderName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  mapError?: (error: unknown) => string;
}

export function LadderPasswordAlert({
  ladderId,
  ladderName,
  isOpen,
  onClose,
  onSuccess,
  mapError,
}: LadderPasswordAlertProps) {
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addUserToLadder = useMutation(api.ladders.addUserToLadder);

  const handleJoin = async () => {
    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await addUserToLadder({
        ladderId,
        password: password.trim(),
      });

      if (result.success) {
        setPassword('');
        onClose();
        onSuccess?.();
      } else {
        setError('Failed to join ladder');
      }
    } catch (err: any) {
      const errorMessage = mapError ? mapError(err) : 'An error occurred while joining the ladder';
      setError(errorMessage);
      console.error('Error joining ladder:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setError(null);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isSubmitting) {
      handleJoin();
    }
  };

  return (
    <Alert open={isOpen} onClose={handleClose} size="sm">
      <AlertTitle>Join Ladder</AlertTitle>
      <AlertDescription>
        Enter the password to join <strong>{ladderName}</strong>
      </AlertDescription>

      <AlertBody>
        <Input
          autoFocus
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Password"
          placeholder="•••••••"
          disabled={isSubmitting}
        />
        {error && (
          <div className="mt-2 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}
      </AlertBody>

      <AlertActions>
        <Button
          onClick={handleClose}
          disabled={isSubmitting}
          plain
        >
          Cancel
        </Button>
        <Button
          onClick={handleJoin}
          disabled={isSubmitting || !password.trim()}
          color="blue"
        >
          {isSubmitting ? 'Joining...' : 'Join Ladder'}
        </Button>
      </AlertActions>
    </Alert>
  );
}
