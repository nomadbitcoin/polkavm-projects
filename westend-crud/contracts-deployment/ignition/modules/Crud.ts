import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("CrudModule", (m) => {
  const crudContract = m.contract("CrudContract");

  return { crudContract };
});
