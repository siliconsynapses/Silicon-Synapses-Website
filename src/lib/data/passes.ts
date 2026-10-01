import type { RegistrationStatus } from "@prisma/client";
import { safeDb } from "./safe";

export type PassView = {
  participantName: string;
  status: RegistrationStatus;
  checkedInAt: Date | null;
  event: {
    title: string;
    slug: string;
    venue: string;
    startsAt: Date;
    endsAt: Date | null;
    status: string;
  };
};

/**
 * Look up a digital pass by its opaque token. Returns ONLY what the pass holder
 * needs to see — participant name, status, check-in state, and event details.
 * Contact fields (email/phone) are deliberately never selected here. Returns null
 * on miss; the token is high-entropy so enumeration is infeasible.
 */
export async function getPassByToken(token: string): Promise<PassView | null> {
  if (!token || token.length < 8) return null;
  return safeDb<PassView | null>(
    (db) =>
      db.registration.findUnique({
        where: { passToken: token },
        select: {
          participantName: true,
          status: true,
          checkedInAt: true,
          event: {
            select: {
              title: true,
              slug: true,
              venue: true,
              startsAt: true,
              endsAt: true,
              status: true,
            },
          },
        },
      }),
    null,
  );
}
