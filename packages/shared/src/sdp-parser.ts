import { parse, write } from 'sdp-transform';
import { SessionDescription } from './types/sdp';

/**
 * Parses a raw SDP string into a structured JSON object.
 */
export function parseSDP(sdpString: string): SessionDescription {
  if (!sdpString || typeof sdpString !== 'string') {
    throw new Error("Invalid input: SDP must be a non-empty string.");
  }

  const trimmedSdp = sdpString.trim();

  // Basic validation to ensure it's actually an SDP string
  if (!trimmedSdp.startsWith('v=')) {
    throw new Error("Invalid SDP format: Must start with 'v=0' (version line).");
  }

  try {
    // We cast the output to our strict SessionDescription type
    return parse(trimmedSdp) as SessionDescription;
  } catch (error: any) {
    throw new Error(`Parsing failed: The SDP string is malformed. Details: ${error.message}`);
  }
}

/**
 * Converts a structured JSON object back into a raw SDP string.
 * (Useful for V2 when we want to manipulate and return "fixed" SDPs).
 */
export function stringifySDP(sdpObject: SessionDescription): string {
  try {
    return write(sdpObject as any);
  } catch (error: any) {
    throw new Error(`Stringify failed: Invalid SDP object. Details: ${error.message}`);
  }
}
