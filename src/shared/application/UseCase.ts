/**
 * Interface genérica para todos os Use Cases.
 *
 * Um Use Case representa uma única operação de negócio.
 * Ele orquestra: Domain Objects + Ports (repositórios, serviços externos)
 *
 * @template IRequest - DTO de entrada
 * @template IResponse - DTO de saída (geralmente Either<Erro, Sucesso>)
 */
export interface UseCase<IRequest, IResponse> {
  execute(request: IRequest): Promise<IResponse>
}
