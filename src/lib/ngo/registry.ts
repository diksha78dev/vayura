
import { NgoAdapter } from './types';
import { TreeNationAdapter } from './adapters/tree-nation';
import { SankalpaTaruAdapter } from './adapters/sankalpa-taru';
import { IshaOutreachAdapter } from './adapters/isha-outreach';
import { OneTreePlantedAdapter } from './adapters/one-tree-planted';
import { EdenReforestationAdapter } from './adapters/eden-reforestation';

export const ngoRegistry: NgoAdapter[] = [
    new TreeNationAdapter(),
    new OneTreePlantedAdapter(),
    new EdenReforestationAdapter(),
    new SankalpaTaruAdapter(),
    new IshaOutreachAdapter(),
];

export function getAllNgos(): NgoAdapter[] {
    return ngoRegistry.sort((a, b) => b.transparency.score - a.transparency.score);
}

export function getNgoById(id: string): NgoAdapter | undefined {
    return ngoRegistry.find(ngo => ngo.id === id);
}
