import {

  ExecutionGuardContext,
  ExecutionGuardResult

} from "./types"

export async function checkExecutionGuard(

  context: ExecutionGuardContext

): Promise<ExecutionGuardResult> {

  /*
    Próximamente consultará una tabla
    de ejecuciones para garantizar
    idempotencia global.

    Por ahora solamente centralizamos
    la lógica.
  */

  return {

    allowed: true

  }

}