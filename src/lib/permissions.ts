import type { SessionUser } from "./types";

/**
 * Regras de acesso, todas num lugar só.
 *
 * - Mecânico mestre: faz tudo, inclusive editar/excluir anotações de outros
 *   mecânicos e gerenciar usuários.
 * - Mecânico: só cria (carros e anotações). Não edita nem exclui nada.
 */
type Rule = (user: SessionUser) => boolean;

const anyone: Rule = () => true;
const isMaster: Rule = (user) => user.role === "master";

export const can = {
  createCar: anyone,
  editCar: isMaster,
  deleteCar: isMaster,
  createRecord: anyone,
  editRecord: isMaster,
  deleteRecord: isMaster,
  manageUsers: isMaster,
};
