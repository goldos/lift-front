import { type CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { CgoFileService } from '../../cgo-file/services/cgo-file.service';
import { CgoFileStore } from '../../cgo-file/stores/cgo-file.store';

export const cgoJobCheckGuard: CanActivateFn = async () => {
  const cgoFileService = inject(CgoFileService);
  const store = inject(CgoFileStore);

  if (store.callState() === 'idle') {
    try {
      const response = await cgoFileService.checkInitialJobStatus();
      store.updateCgoData(response);

      if (['processing', 'starting'].includes(response.status)) {
        store.checkAndPollExistingJob();
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du statut initial du job :', error);
    }
  }

  return true;
};
