import { type ResourcesInterface } from './resources.interface';
import { type CraInterface } from './cra.interface';
import { type NoteDeFraisInterface } from './note-de-frais.interface';

export interface CgoFileInterface {
  ressources: ResourcesInterface[];
  cra: CraInterface[];
  notesDeFrais: NoteDeFraisInterface[];
}
