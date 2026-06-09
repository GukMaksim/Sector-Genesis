import type { SpecializationDef } from '../types'
import { REAPER_SPEC } from './ReaperSpec'
import { GHOST_SPEC } from './GhostSpec'

export const SPECIALIZATIONS: SpecializationDef[] = [REAPER_SPEC, GHOST_SPEC]

export function getSpecialization(id: string): SpecializationDef | undefined {
  return SPECIALIZATIONS.find((s) => s.id === id)
}
