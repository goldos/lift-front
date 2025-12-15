import { type ResourceTypesLabelEnum } from '../../feature/boond/cgo-file/enum/resource-types.enum';

export interface ResourcesInterface {
  consultant: string;
  startDate: string;
  endDate: string;
  intExt: ResourceTypesLabelEnum;
  idMission: string;
  idConsultant: string;
  idManager: string;
  price: number;
  client: string;
  salaireBrut: number;
  agence: string | null;
  natureMission: string;
  priority: number;
  typeOf: number;
}
