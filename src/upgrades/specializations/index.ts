import type { SpecializationDef } from '../types'
import { REAPER_SPEC } from './ReaperSpec'
import { GHOST_SPEC } from './GhostSpec'
import { BROODMOTHER_SPEC } from './BroodmotherSpec'
import { INFESTOR_SPEC } from './InfestorSpec'

export const SPECIALIZATIONS: SpecializationDef[] = [REAPER_SPEC, GHOST_SPEC, BROODMOTHER_SPEC, INFESTOR_SPEC]

export function getSpecialization(id: string): SpecializationDef | undefined {
  return SPECIALIZATIONS.find((s) => s.id === id)
}
