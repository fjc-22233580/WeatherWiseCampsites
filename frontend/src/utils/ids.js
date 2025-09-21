export function campId(c) {
    return c?.id ?? c?.place_id ?? c?.campsite_id ?? null;
  }
  
