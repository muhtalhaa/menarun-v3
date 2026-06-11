"use client";

import { useState } from "react";
import { PixelCelebration } from "@/components/celebration/PixelCelebration";
import { TokenCard } from "@/components/forms/TokenCard";

interface RegistrationSuccessProps {
  token: string;
}

export function RegistrationSuccess({ token }: RegistrationSuccessProps) {
  const [showToken, setShowToken] = useState(false);

  return (
    <>
      <PixelCelebration
        isVisible={!showToken}
        onComplete={() => setShowToken(true)}
      />
      {showToken && <TokenCard token={token} />}
    </>
  );
}
