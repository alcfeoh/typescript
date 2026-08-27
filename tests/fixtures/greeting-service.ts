import { now } from './clock';

/** The unit under test — it depends on the clock module. */
export function greet(name: string): string {
  const hour = now().getHours();
  const period = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  return `${period}, ${name}!`;
}
