import { BeforeProofExample } from "./before-proof";

if(!process.argv[2]) {
  throw new Error('No example ID provided. Which one would you like to run?');
}

const asynRun = async (): Promise<void> => {
  switch (process.argv[2]) {
    case BeforeProofExample.ID:
      await new BeforeProofExample().run();
      break;
    default:
      throw new Error(`Unknown example provided: ${process.argv[2]}`);
  }
};

const _ = Promise.resolve().then(asynRun);
