/**
 * Attend qu'une condition (une fonction qui retourne un booléen) devienne vraie.
 * Utile pour les tests asynchrones en mode "zoneless".
 * @param conditionFn La fonction de condition à vérifier.
 * @param timeout Le temps maximum d'attente en millisecondes.
 */
export function waitUntil(conditionFn: () => boolean, timeout = 1000): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      if (conditionFn()) {
        clearInterval(interval);
        resolve();
      } else if (Date.now() - startTime > timeout) {
        clearInterval(interval);
        reject(new Error('waitUntil timed out.'));
      }
    }, 10);
  });
}
